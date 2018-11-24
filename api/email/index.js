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

module.exports = {
    send: (data) => {
        return new Promise(resolve=>{
            authorize.then(auth => {
                const gmail = google.gmail({version: 'v1', auth});
                ejs.renderFile(__dirname + '/email/templates/' + data.template, {body: data.body}, function(err, str){
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