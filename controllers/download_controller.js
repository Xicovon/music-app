const youtubedl = require('youtube-dl-exec')
var fs = require('fs');
var path = require ('path');
const db = require('../db');
var File = require('../models/files').File;

exports.download = function(req, res) {
    res.render('download');
}

exports.get_song = async function(req, res) {
    var download_url = decodeURIComponent(req.query.url);
    if (download_url.indexOf('&') != -1) {
        download_url = download_url.substring(0, download_url.indexOf('&'));
    }
    var filepath = await download_song(download_url);
    await create_db_record(filepath);
    res.redirect('/songs/list');
}

exports.tag = function(req, res) {

}

async function download_song(url) {
    var console_output;
    const ffmpeg_location = (process.env.NODE_ENV != 'production') ? path.join(__dirname, '../') : '/usr/bin/ffmpeg';

    await youtubedl(url, {
        extractAudio: true,
        audioQuality: 0,
        paths: ['./music'],
        noWarnings: true,
        preferFreeFormats: true,
        ffmpegLocation: ffmpeg_location,
        audioFormat: 'mp3',
        restrictFilenames: true,
    }).then(output => console_output = output)

    console_output = console_output.split('[ExtractAudio] Destination: ')[1];
    console_output = console_output.split(/\r?\n|\r|\n/g)[0];
    console_output = console_output.substring(console_output.indexOf('\\') + 1, console_output.indexOf('.mp3') + 5)

    return console_output;
}

async function create_db_record(filename) {
    console.log('Creating db record for newly downloaded file: ' + filename);
    const filepath = path.join(__dirname, '../', 'music/', filename);
    const f = await File.create({ name: filename, path: filepath, fileType: path.extname(filename) });
}
