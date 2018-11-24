// Pay API

const request = require('request'),
    credentials = require('credentials');
module.exports = pay = (billing) => {
    const constants = credentials.bluepay;
    let allData = Object.assign({}, constants, billing);
    function serialize(obj) {
        let str = [];
        for (let p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    }
    let postString = serialize(allData);
    return new Promise(function(resolve) {
        request({
            url: "https://secure.bluepay.com/interfaces/bp10emu",
            method: "POST",
            json: false,
            body: postString
        }, function (error, response, body) {
            let data = body;
            let result = {};
            let keys = data.split('<a href="/interfaces/wlcatch?')[1].split('">here</a>')[0].split('&amp;');
            keys.forEach(function (pair) {
                pair = pair.split('=');
                result[pair[0]] = decodeURIComponent(pair[1] || '');
            });
            let d = JSON.parse(JSON.stringify(result));
            console.log(d);
            if (d.Result === "APPROVED") {
                resolve([true, d.AMOUNT + ", " + d.INVOICE_ID + ", " + d.MESSAGE + ", Shipping Label: "]);
            } else {
                resolve([false, "DECLINED" + ", " + d.MESSAGE]);
            }
        })
    })
};