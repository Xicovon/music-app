const youtubedl = require('youtube-dl-exec')

exports.download = function(req, res) {
    res.render('download');
}

exports.get_song = async function(req, res) {
    var download_url = decodeURIComponent(req.query.url);
    download_url = download_url.substring(0, download_url.indexOf('&'));
    console.log(download_url);
    await download_song(download_url);
    res.redirect('/download');
}

exports.tag = function(req, res) {

}

async function download_song(url) {
    console.log('Downloading song from url: ' + url);
    await youtubedl(url, {
        extractAudio: true,
        audioQuality: 0,
        paths: ['./music'],
        noWarnings: true,
        preferFreeFormats: true,
        ffmpegLocation: './'
    }).then(output => console.log(output))
    console.log('Finished downloading song');
}