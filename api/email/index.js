// Email API

const credentials = require('credentials'),
    {google} = require('googleapis'),
    ejs = require('ejs');

authorize = new Promise(resolve => {
    const oAuth2Client = new google.auth.OAuth2(
        credentials.gmail_auth.client_id,
        credentials.gmail_auth.client_secret,
        credentials.gmail_auth.redirect_uris[0]);
    oAuth2Client.setCredentials(credentials.gmail_token);
    resolve(oAuth2Client);
});
 /*
 takes object:

 to: recipient email address
 from: sender email address
 contact: recipient first and last name
 subject: email subject
 body:{
    message: message content
    preheader: content preview (displayed beside subject line)
    contact: first name of recipient
    images: [image0, image1, ...]
 }
template: basic, etc.

 */
module.exports = {
    send: (data) => {
        return new Promise(resolve=>{
            authorize.then(auth => {
                if (!('template' in data)) data.template = 'basic';
                const gmail = google.gmail({version: 'v1', auth});
                ejs.renderFile(__dirname + '/templates/' + data.template +'.ejs', {body: data.body}, function(err, str){
                    gmail.users.messages.send({
                        auth: auth,
                        userId: 'me',
                        resource: {
                            raw: Buffer.from([
                                "Content-Type: text/html; charset=\"UTF-8\"\n",
                                "MIME-Version: 1.0\n",
                                "Content-Transfer-Encoding: 7bit\n",
                                "to: ", data.to, "\n",
                                "from: ", data.from, "\n",
                                "subject: ", data.subject, "\n\n",
                                str
                            ].join('')).toString("base64").replace(/\+/g, '-').replace(/\//g, '_')
                        }
                    }, (err, response) => resolve(err || response.status))
                });
            })
        })
    }
};