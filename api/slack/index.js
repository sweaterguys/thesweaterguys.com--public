// Contact API

const credentials = require('credentials'),
    channels = {
        'general': 'C78H7NVC7',
        'random': 'C76UTBHPT',
        'kalindre': 'C8UC99PS9',
        'dexter': 'D78DGLKML',
        'dom': 'D79H9TWGN',
        'ted': 'D77GSU7H8',
    };

module.exports = {
    send: (body) => {
        return new Promise(resolve => {
            const { WebClient } = require('@slack/client');
            const web = new WebClient(credentials.slack);
            let channel = channels[body.channel] || 'C93M01G8Y',
                attachments = [];
            if (body.images) for (let i in body.images){
                attachments.push(
                    {
                        "fallback": "image",
                        "color": "#1b75bc",
                        "author_name": "Tre Monte",
                        "author_link": "https://thesweaterguys.com/about",
                        "author_icon": "https://thesweaterguys.com/img/icons/FAV.png",
                        "title_link": "https://thesweaterguys.com/about",
                        "image_url": body.images[i],
                        "ts": 123456789
                    }
                )
            }
            web.chat.postMessage({
                as_user: false,
                channel: channel,
                text: body.message,
                attachments: attachments
            })
                .then(response=>resolve(response));
        })
    }
};