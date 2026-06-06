const fs = require('node:fs');
const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(
  fs.readFileSync('credentials.txt', 'utf-8')
);

var credentials = null;
try {
  credentials = JSON.parse(fs.readFileSync('api.json'));
  oauth2Client.setCredentials(credentials);
} catch (err) {
  console.error(err);
}

exports.auth = function(req, res){
  res.redirect(url);
};

exports.callback = async function(req, res) {
  // This will provide an object with the access_token and refresh_token.
  // Save these somewhere safe so they can be used at a later time.
  const {tokens} = await oauth2Client.getToken(req.query.code)
  oauth2Client.setCredentials(tokens);

  api = Object.assign(tokens, req.query);

  fs.writeFile('api.json', JSON.stringify(api), err => {
    if (err) {
      console.error(err);
      res.send(err);
    } else {
      res.redirect('/');
    }
  })
};

// generate a url that asks permissions for Blogger and Google Calendar scopes
const scopes = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar'
];

const url = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',

  // If you only need one scope, you can pass it as a string
  scope: scopes
});
