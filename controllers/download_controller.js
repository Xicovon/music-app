const youtubedl = require('youtube-dl-exec')
var fs = require('fs');

exports.download = function(req, res) {
    res.render('download');
}

exports.get_song = async function(req, res) {
    var download_url = decodeURIComponent(req.query.url);
    download_url = download_url.substring(0, download_url.indexOf('&'));
    var filepath = await download_song(download_url);
    filepath = filepath.split('[ExtractAudio] Destination: ')[1];
    filepath = filepath.split('Deleting Original')[0];
    filepath = filepath.substring(filepath.indexOf('\\') + 1, filepath.indexOf('.opus') + 5)
    await convert_to_mp3(filepath);
    res.redirect('/download');
}

exports.tag = function(req, res) {

}

async function download_song(url) {
    var console_output;

    await youtubedl(url, {
        extractAudio: true,
        audioQuality: 0,
        paths: ['./music'],
        noWarnings: true,
        preferFreeFormats: true,
        ffmpegLocation: './'
    }).then(output => console_output = output)

    return console_output;
}

async function convert_to_mp3(path) {
    var execSync = require('child_process').execSync;
    var path = __dirname + '/../music/' + path.substring(0, path.indexOf('.'));

    execSync('ffmpeg -i \"' + path + '.opus\" \"' + path + '.mp3\"', { encoding: 'utf-8' });

    fs.unlink(path + '.opus', (err) => {
        if (err) throw err;
    });
}
