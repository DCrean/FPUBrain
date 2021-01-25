const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const log = require('./log.js');
const TOKEN_PATH = 'token.json';
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];


exports.readSheet = function(type) { 
}


exports.writeSheet = function(type) { 
}


exports.appendToSheet = function(type) { 
}


exports.createSheet = function(sheetName) {
	let sheets = google.sheets('v4', getAuth());
	let newSheet = {}; 
	newSheet.properties = {};
	newSheet.properties.title = sheetName;
	//newSheet.properties.hidden = true;
	sheets.spreadsheets.create(newSheet, handleSheetUpdateResponse);
}

function handleSheetUpdateResponse(error, spreadsheet) {
	if(error){
		log(error);
	} else {
		log(`Spreadsheet ID: ${spreadsheet.spreadsheetId}`, false);
	}
}

function getAuth(){
	return google.options.auth;
}



/* ====================================================================
 *
 *							Auth Functions
 *
 * ====================================================================
 */

exports.init = function(){
	fs.readFile('credentials.json', tryAuthorize);
}

function tryAuthorize(err, content) {
	if (err) return console.log('Error loading client secret file:', err);
	authorize(JSON.parse(content));
	log('Authorized', false);
}

/**
 * Create an OAuth2 client with the given credentials, and then store the authorized client.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  // Check for a previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err){ 
    	oAuth2Client = getNewToken(oAuth2Client);
    } else {
    	oAuth2Client.setCredentials(JSON.parse(token));	
    }
    google.options({
		auth: oAuth2Client
	});
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * return the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 */
function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  log('Authorize this app by visiting this url:', authUrl, false);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err){
      	log(err);
      	return console.error('Error while trying to retrieve access token', err);
      }
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err){
        	log(err);
        	return console.error(err);
        }
        log('Token stored to', TOKEN_PATH, false);
      });
      return oAuth2Client;
    });
  });
}