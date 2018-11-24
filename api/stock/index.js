// Stock API

const request = require('request'),
    default_stock = require('./default.json'),
    credentials = require('credentials');

module.exports = {
    get: (product) => new Promise(resolve => {
        request.get(process.env.STOCK_URI, (err, res, body) => {
            if (err || res.statusCode !== 200) resolve(JSON.stringify(default_stock[product]));
            else resolve(JSON.stringify(JSON.parse(body)[product]))
        })
    }),
    order: (itemsToBuy) => new Promise(resolve =>{
        console.log(itemsToBuy);
        request.post({
            headers: {'content-type' : 'application/json'},
            url:     process.env.STOCK_URI,
            body:    JSON.stringify(credentials.stock +':'+ itemsToBuy)
        }, function(error, response, body){
            resolve(body);
        })
    })
};