const fs = require('node:fs');
const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(
  fs.readFileSync(credentials.txt, 'utf-8')
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

exports.retrieve_schedule = async function(req, res) {
  const gmail = google.gmail({version: 'v1', auth: oauth2Client});
  var messages = null;
  var message = null;
  try {
    messages = await gmail.users.messages.list({userId: 'me', maxResults: 1, q: 'from:zahraa@wcc.mb.ca filename:pdf'});
    message = await gmail.users.messages.get({userId: 'me', id: messages.data.messages[0].id});
  } catch (err) {
    console.log(err);
    res.redirect('/auth');
    return;
  }
  
  var date = message.data.payload.headers.find(header => header.name === 'Date').value;
  date = date.replaceAll(':', ' ');
  date = date.substring(date.indexOf(',') + 2, date.length - 6);
  date = date.trim();

  const attachment = message.data.payload.parts[1].body.attachmentId;
  const attachmentData = await gmail.users.messages.attachments.get({userId: 'me', messageId: messages.data.messages[0].id, id: attachment});
  //res.send(attachmentData.data.data);
  fs.writeFile('documents/schedule - ' + date + '.pdf', attachmentData.data.data, 'base64', err => {
    if (err) {
      console.error(err);
      res.status(500).send(err);
    } else {      
      res.redirect('/');
    }
  });
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
