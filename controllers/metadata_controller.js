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

    for (var i = 0; i < files.length; i++) {
        files[i] = get_metadata(files[i]);
    }

    res.render('list', {songs: files});
}

function write_metadata(metadata) {
    const buffer = fs.readFileSync(__dirname + '/../music/' + metadata.filename);
    const mp3tag = new MP3Tag(buffer, true);
    mp3tag.read();
    
    console.log(metadata);

    if (metadata.title  != '') { mp3tag.tags.title = metadata.title;   }
    if (metadata.artist != '') { mp3tag.tags.artist = metadata.artist; }
    if (metadata.album  != '') { mp3tag.tags.album = metadata.album;   }
    if (metadata.year   != '') { mp3tag.tags.year = metadata.year;     }

    mp3tag.save();

    // Handle error if there's any
    if (mp3tag.error !== '') throw new Error(mp3tag.error)

    mp3tag.read()
    console.log(mp3tag.tags)

    // Write the new buffer to file
    fs.writeFileSync(__dirname + '/../music/' + metadata.filename, mp3tag.buffer)
}

function get_metadata(file) {
    const buffer = fs.readFileSync(__dirname + '/../music/' + file)
    const mp3tag = new MP3Tag(buffer, true)

    mp3tag.read();

    console.log(mp3tag.tags);

    var title =  mp3tag.tags.title  || '';
    var artist = mp3tag.tags.artist || '';
    var album =  mp3tag.tags.album  || '';
    var year =   mp3tag.tags.year   || '';

    // Handle error if there's any
    if (mp3tag.error !== '') throw new Error(mp3tag.error)
    else return { 'filename': file, 'title': title, 'artist': artist, 'album': album, 'year': year };
}
