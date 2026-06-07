var fs = require('fs');
const MP3Tag = require('mp3tag.js');
var path = require ('path');
const music_path = path.join(__dirname, '../music/');

exports.edit = function(req, res) {
    res.render('edit', {song: get_metadata(req.query.filename)});
}

exports.tag = function(req, res) {
    const filename = req.query.filename;
    const title = req.query.title;
    const artist = req.query.artist;
    const album = req.query.album;
    const year = req.query.year;
    write_metadata({filename: filename, title: title, artist: artist, album: album, year: year});
    res.redirect('/songs/list');
}

exports.list = function(req, res) {
    var files = search_directory(music_path);

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

    for (var i = 0; i < files.length; i++) {
        var metadata = get_metadata(path.join(files[i].parentPath, files[i].name));
        // filter the non empty values
        if (title_filter_null === true) {
            if (metadata.title != '') {
                files[i] = null;
                continue;
            }
        }
        if (artist_filter_null === true) {
            if (metadata.artist != '') {
                files[i] = null;
                continue;
            }
        }
        if (album_filter_null === true) {
            if (metadata.album != '') {
                files[i] = null;
                continue;
            }
        }
        if (year_filter_null === true) {
            if (metadata.year != '') {
                files[i] = null;
                continue;
            }
        }
        // filter search queries
        if (title_filter_query != '' && !metadata.title.toLowerCase().includes(title_filter_query.toLowerCase())) {
            files[i] = null;
            continue;
        }
        if (artist_filter_query != '' && !metadata.artist.toLowerCase().includes(artist_filter_query.toLowerCase())) {
            files[i] = null;
            continue;
        }
        if (album_filter_query != '' && !metadata.album.toLowerCase().includes(album_filter_query.toLowerCase())) {
            files[i] = null;
            continue;
        }
        if (year_filter_query != '' && !metadata.year.toLowerCase().includes(year_filter_query.toLowerCase())) {
            files[i] = null;
            continue;
        }

        files[i] = get_metadata(path.join(files[i].parentPath, files[i].name));
    }

    files = files.filter(file => file !== null);
    
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
