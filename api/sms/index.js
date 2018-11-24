// Contact API

const credentials = require('credentials');

module.exports = {
    send: (body) => {
        return new Promise(resolve => {
            require('twilio')(credentials.twilio.accountSid, credentials.twilio.authToken)
            .messages.create({
                body: body.message,
                to: '+1' + body.number,
                mediaUrl: body.media,
                from: '+15147005301'
            }).then(response => resolve(response.sid))
        })
    },
    receive: (body) => {

    }
};