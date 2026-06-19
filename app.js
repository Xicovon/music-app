var express = require('express');
var app = express();
// set the view engine to ejs
app.set('view engine', 'ejs');
var path = require ('path');
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'views/songs/')]);

// CONFIGURE CORS
var cors = require('cors');
// Adds headers: Access-Control-Allow-Origin: *
app.use(cors());

app.use(express.static(__dirname + '/public'));

var favicon = require('serve-favicon');
app.use(favicon(path.join(__dirname,'public','favicon.ico')));

var google_auth_controller = require('./controllers/google_auth_controller');
app.get('/auth', google_auth_controller.auth);
app.get('/callback', google_auth_controller.callback);

var download_controller = require('./controllers/download_controller');
app.get('/download', download_controller.download);
app.get('/get_song', download_controller.get_song);
app.get('/tag', download_controller.tag);

var metadata_controller = require('./controllers/metadata_controller');
app.get('/songs/edit', metadata_controller.edit);
app.get('/songs/list', metadata_controller.list);
app.get('/songs/tag', metadata_controller.tag);
app.get('/songs/update_files', metadata_controller.update_files);

const fs = require('node:fs');
const { json } = require('node:stream/consumers');

app.get('/', async function (req, res) {
  res.redirect('/download');
});

var db = require('./db');
app.listen(3737, async function () {
  console.log('listening on port 3737!');
  await db.init_db();
});
