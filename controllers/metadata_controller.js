var fs = require('fs');
const MP3Tag = require('mp3tag.js');

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
    var files = fs.readdirSync(__dirname + '/../music/');

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
        var metadata = get_metadata(files[i]);
        // filter the non empty values
        if (title_filter_null === true) {
            console.log('the title_filter_null is ' + title_filter_null);
            if (metadata.title != '') {
                console.log('title filter null');
                files[i] = null;
                continue;
            }
        }
        if (artist_filter_null === true) {
            if (metadata.artist != '') {
                console.log('artist filter null');
                files[i] = null;
                continue;
            }
        }
        if (album_filter_null === true) {
            if (metadata.album != '') {
                console.log('album filter null');
                files[i] = null;
                continue;
            }
        }
        if (year_filter_null === true) {
            if (metadata.year != '') {
                console.log('year filter null');
                files[i] = null;
                continue;
            }
        }
        // filter search queries
        if (title_filter_query != '' && !metadata.title.toLowerCase().includes(title_filter_query.toLowerCase())) {
            console.log('title filter query');
            files[i] = null;
            continue;
        }
        if (artist_filter_query != '' && !metadata.artist.toLowerCase().includes(artist_filter_query.toLowerCase())) {
            console.log('artist filter query');
            files[i] = null;
            continue;
        }
        if (album_filter_query != '' && !metadata.album.toLowerCase().includes(album_filter_query.toLowerCase())) {
            console.log('album filter query');
            files[i] = null;
            continue;
        }
        if (year_filter_query != '' && !metadata.year.toLowerCase().includes(year_filter_query.toLowerCase())) {
            console.log('year filter query');
            files[i] = null;
            continue;
        }

        files[i] = get_metadata(files[i]);
    }

    files = files.filter(file => file !== null);
    
    res.render('list', {songs: files, search_params: search_params_json});
}

function write_metadata(metadata) {
    const buffer = fs.readFileSync(__dirname + '/../music/' + metadata.filename);
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
    fs.writeFileSync(__dirname + '/../music/' + metadata.filename, mp3tag.buffer)
}

function get_metadata(file) {
    const buffer = fs.readFileSync(__dirname + '/../music/' + file)
    const mp3tag = new MP3Tag(buffer, true)

    mp3tag.read();

    var title =  mp3tag.tags.title  || '';
    var artist = mp3tag.tags.artist || '';
    var album =  mp3tag.tags.album  || '';
    var year =   mp3tag.tags.year   || '';

    // Handle error if there's any
    if (mp3tag.error !== '') throw new Error(mp3tag.error)
    else return { 'filename': file, 'title': title, 'artist': artist, 'album': album, 'year': year };
}
