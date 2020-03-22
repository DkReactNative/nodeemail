const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
var base64 = require('js-base64').Base64;

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

const myEmail='dkgarhwal366@gmail.com'

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  authorize(JSON.parse(content), checkInbox);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}



function checkInbox(auth){
    let gmail = google.gmail({version: 'v1', auth});
        gmail.users.messages.list({
        userId: myEmail,
        labelIds: 'INBOX',
        maxResults: 10
    }, (err, res) => {
        if(!err){
            //mail array stores the mails.
            var mails = res.data.messages;
            fs.writeFile('response.json', JSON.stringify(mails), (err)=> {
                if (err) throw err;
                console.log('Saved!');
              });
            //We call the getMail function passing the id of first mail as parameter.
            mails.forEach((ele,i)=>{
                getMail(ele.id,gmail,i);
            })
            
        }
        else{
            console.log(err);
        }
    });        
}
    
     //getMail function retrieves the mail body and parses it for useful content.
    //In our case it will parse for all the links in the mail.
   function  getMail(msgId,gmail,i){
        
        //This api call will fetch the mailbody.
        gmail.users.messages.get({
            'userId': myEmail,
            'id': msgId
        }, (err, res) => {
            if(!err){
                
                var body = res.data.payload.body.data;
                var htmlBody = base64.decode(body);
                fs.writeFile(`body${i}.html`, htmlBody, (err)=> {
                    if (err) throw err;
                    console.log('Saved!');
                  });
                
            }
        });
    }

   