// Stock API

const request = require('request'),
    default_stock = require('./default.json'),
    credentials = require('credentials');

module.exports = {
    get: (product) => new Promise(resolve => {
        // request.get(process.env.STOCK_URI, (err, res, body) => {
        //     if (err || res.statusCode !== 200) resolve(JSON.stringify(default_stock[product]));
        //     else resolve(JSON.stringify(JSON.parse(body)[product]))
        // })
        resolve(JSON.stringify(default_stock[product]))
    }),
    order: (itemsToBuy) => new Promise(resolve =>{
        request.post({
            headers: {
                'env' : process.env.NODE_ENV,
                'content-type' : 'application/json',
                'Authorization' : 'Basic ' + Buffer.from(credentials.auth).toString("base64")
            },
            url:     process.env.STOCK_URI,
            body:    JSON.stringify(itemsToBuy)
        }, function(error, response, body){
            resolve(body);
        })
    })
};