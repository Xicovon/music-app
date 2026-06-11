var fs = require('fs');
const MP3Tag = require('mp3tag.js');
var path = require ('path');
const music_path = path.join(__dirname, '../music/');
var File = require('../models/files').File;
const { Op } = require('@sequelize/core');
const db = require('../db');

exports.edit = function(req, res) {
    res.render('edit', {song: get_metadata(req.query.filename)});
}

exports.tag = async function(req, res) {
    const filename = req.query.filename;
    const parentPath = req.query.parentPath;
    const title = req.query.title;
    const artist = req.query.artist;
    const album = req.query.album;
    const year = req.query.year;

    var f = await File.findOne({where: { name: path.basename(filename)} });
    f.title = title;
    f.artist = artist;
    f.album = album;
    f.year = year;
    await f.save();

    write_metadata({filename: filename, parentPath: parentPath, title: title, artist: artist, album: album, year: year});
    res.redirect('/songs/list');
}

exports.update_files = async function(req, res) {
    // check each file on disk
    // search db for file
    // if file not in db create

    // do not await
    await search_files();

    res.redirect('/songs/list');
}

async function search_files(search_path) {
    var files = search_directory(music_path);
    files.forEach((f) => {
        console.log('searching db for file: ' + f.name);
        create_file(path.join(f.parentPath, f.name));
    })
}

async function create_file(file_name){
    const [file, created] = await File.findOrCreate({
        where: { name: path.basename(file_name) },
        defaults: {
            path: file_name,
            fileType: path.extname(file_name)
        },
    });
    if (created) {
        console.log('file was created: ' + file_name);
        const metadata = get_metadata(file.path);
        file.title = metadata.title;
        file.artist = metadata.artist;
        file.album = metadata.album;
        file.year = metadata.year;
        file.save();
    }
}

exports.list = async function(req, res) {
    var title_filter_null   = (req.query.title_filter_null  === 'true') || false;
    var title_filter_query  = req.query.title_filter_query  || '';
    var artist_filter_null  = (req.query.artist_filter_null === 'true') || false;
    var artist_filter_query = req.query.artist_filter_query || '';
    var album_filter_null   = (req.query.album_filter_null  === 'true') || false;
    var album_filter_query  = req.query.album_filter_query  || '';
    var year_filter_null    = (req.query.year_filter_null   === 'true') || false;
    var year_filter_query   = req.query.year_filter_query   || '';
    var search_params_json = {
        title_filter_null: title_filter_null,
        title_filter_query: title_filter_query,
        artist_filter_null: artist_filter_null,
        artist_filter_query: artist_filter_query,
        album_filter_null: album_filter_null,
        album_filter_query: album_filter_query,
        year_filter_null: year_filter_null,
        year_filter_query: year_filter_query
    };

    var whereStatement = {};
    if(title_filter_null) {
        whereStatement.title = { [Op.or]: [{[Op.is]: null}, {[Op.eq]: ''}] };
    }
    if(artist_filter_null) {
        whereStatement.artist = { [Op.or]: [{[Op.is]: null}, {[Op.eq]: ''}] };
    }
    if(album_filter_null) {
        whereStatement.album = { [Op.or]: [{[Op.is]: null}, {[Op.eq]: ''}] };
    }
    if(year_filter_null) {
        whereStatement.year = { [Op.or]: [{[Op.is]: null}, {[Op.eq]: ''}] };
    }

    var files = await File.findAll({
        where: {
            [Op.and]: [
                whereStatement,
                db.sequelize.where(db.sequelize.fn('lower', db.sequelize.col('title')), { [Op.substring]: '%' + title_filter_query + '%' }),
                db.sequelize.where(db.sequelize.fn('lower', db.sequelize.col('artist')), { [Op.substring]: '%' + artist_filter_query + '%' }),
                db.sequelize.where(db.sequelize.fn('lower', db.sequelize.col('album')), { [Op.substring]: '%' + album_filter_query + '%' }),
                db.sequelize.where(db.sequelize.fn('lower', db.sequelize.col('year')), { [Op.substring]: '%' + year_filter_query + '%' }),
            ],
        }
    });
    
    res.render('list', {songs: files, search_params: search_params_json});
}

function write_metadata(metadata) {
    const buffer = fs.readFileSync(path.join(metadata.parentPath, metadata.filename));
    const mp3tag = new MP3Tag(buffer, true);
    mp3tag.read();

    if (metadata.title  != '') { mp3tag.tags.title = metadata.title;   }
    if (metadata.artist != '') { mp3tag.tags.artist = metadata.artist; }
    if (metadata.album  != '') { mp3tag.tags.album = metadata.album;   }
    if (metadata.year   != '') { mp3tag.tags.year = metadata.year;     }

    mp3tag.save();

    // Handle error if there's any
    if (mp3tag.error !== '') throw new Error(mp3tag.error)

    mp3tag.read()

    // Write the new buffer to file
    fs.writeFileSync(path.join(metadata.parentPath, metadata.filename), mp3tag.buffer)
}

function get_metadata(file_path) {
    const buffer = fs.readFileSync(file_path);
    const mp3tag = new MP3Tag(buffer, true)

    mp3tag.read();

    var title =  mp3tag.tags.title  || '';
    var artist = mp3tag.tags.artist || '';
    var album =  mp3tag.tags.album  || '';
    var year =   mp3tag.tags.year   || '';

    // Handle error if there's any
    if (mp3tag.error !== '') throw new Error(mp3tag.error)
    else return { 'filename': path.basename(file_path), 'parentPath': path.dirname(file_path), 'title': title, 'artist': artist, 'album': album, 'year': year };
}

function search_directory(dir) {
    var files = fs.readdirSync(dir, { recursive: true, withFileTypes: true });
    files = files.filter(file => file.isFile());
    return files;
}
