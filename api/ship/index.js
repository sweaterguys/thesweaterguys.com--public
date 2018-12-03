let request = require("request");
let upload = require("upload");
// Get Canada Post API credentials
let credentials = require("credentials");
let canadaCreds, canadaURL;
if (process.env.NODE_ENV === 'production') {
    canadaCreds = 'Basic ' + Buffer.from(credentials.canadaPost).toString('base64');
    canadaURL = "https://soa-gw.canadapost.ca/rs/0008683830/ncshipment"
} else {
    canadaCreds = 'Basic ' + Buffer.from(credentials.canadaPostDev).toString('base64');
    canadaURL = "https://ct.soa-gw.canadapost.ca/rs/0008683830/ncshipment"
}
function refreshToken() {
    let options = {
        method: "POST",
        url: "https://www.googleapis.com/oauth2/v4/token",
        qs: credentials.cloudPrint
    };
    return new Promise((resolve) => {
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            body = JSON.parse(body);
            resolve(body.access_token);
        })
    })
}

// To send document to Google Cloud Print API
function printThatShit (url, token) {
    let options = {
        method: "POST",
        url: "https://www.google.com/cloudprint/submit",
        qs: {
            printerid: "339aeff8-72d0-9c07-9d21-f64936c6eecf",
            title: "invoice",
            contentType: "url",
            content: url,
            ticket: '{"version": "1.0","print": {"color": {"type":"STANDARD_MONOCHROME"},"copies": {"copies": 1}}}'
        },
        headers: { Authorization: "Bearer " + token }
    };

    request(options);
}

// To retrieve shipping label artifact after purchase
getShipLabel = (url =>{return new Promise(resolve => {
    let options = {
        method: "GET",
        url: url,
        encoding: null,
        headers: {
            Authorization: canadaCreds,
            Accept: "application/pdf"
        }
    };

    // Buffer the artifact (a PDF) as it is returned from Canada Post
    function bufferArtifact () { return new Promise((resolve) => {
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            resolve(body);
        })
    })
    }

    // Upload the artifact to a Google Cloud Storage bucket
    bufferArtifact().then(body => { return upload.pdf(body)})
        .then(publicUrl => {
            refreshToken()
                .then(token => {
                    // Print shipping label via temporary GCP access token and URL to artifact
                    printThatShit(publicUrl, token)
                });
            resolve(publicUrl);
        });
})});

// To purchase a shipping label given customer shipping info and garment quantities
module.exports = (shipping => {
    return new Promise(resolve => {

        function buyShipLabel (shipping) {
            // Shipping box dimensions
            let box = {
                "weight": shipping.weight.toString(),
                "length": "38.1",
                "width": "38.1",
                "height": "38.1"
            };

            // Params for Canada Post Non-Contract Shipping API
            let options = {
                method: "POST",
                url: canadaURL,
                headers: {
                    "Content-Type": "application/vnd.cpc.ncshipment-v4+xml",
                    Accept: "application/vnd.cpc.ncshipment-v4+xml",
                    Authorization: (canadaCreds)
                },
                body: `<?xml version="1.0" encoding="utf-8"?><non-contract-shipment xmlns="http://www.canadapost.ca/ws/ncshipment-v4"><requested-shipping-point>H2W1X0</requested-shipping-point><delivery-spec><service-code>DOM.EP</service-code><sender><company>The Sweater Guys</company><contact-phone>514-966-2591</contact-phone><address-details><address-line-1>403-4067 BOUL SAINT-LAURENT</address-line-1><address-line-2></address-line-2><city>Montreal</city><prov-state>QC</prov-state><postal-zip-code>H2W1Y7</postal-zip-code></address-details></sender><destination><name>${shipping.name}</name><company>${shipping.company}</company><address-details><address-line-1>${shipping.address}</address-line-1><address-line-2>${shipping.address_2}</address-line-2><city>${shipping.city}</city><prov-state>${shipping.province}</prov-state><country-code>${shipping.country}</country-code><postal-zip-code>${shipping.postalCode.replace(' ','')}</postal-zip-code></address-details></destination><options><option><option-code>DNS</option-code></option></options><parcel-characteristics><weight>${box.weight}</weight><dimensions><length>${box.length}</length><width>${box.width}</width><height>${box.height}</height></dimensions></parcel-characteristics><preferences><show-packing-instructions>false</show-packing-instructions></preferences></delivery-spec></non-contract-shipment>`
            };
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                // Retrieve URL to shipping label from returned body
                let DOMParser = require("xmldom").DOMParser;
                let parser = new DOMParser();
                let xmlDoc = parser.parseFromString(body, "text/xml");
                let children = xmlDoc.documentElement.childNodes;
                let url = children[2].childNodes[4].getAttribute("href");
                let tracking = children[1].childNodes['0'].data;
                getShipLabel(url);
                resolve(`https://www.canadapost.ca/trackweb/en#/search?searchFor=${tracking}`);
            });
        }

        // Shipping box dimensions, in kg and cm
        let totalWeight = shipping.sweaters / 2.2 + 0.4 * shipping.tshirts / 2.2;
        totalWeight = totalWeight.toFixed(2);

        // For large orders, split into multiple boxes
        if (totalWeight > 13.0) {
            let boxes = totalWeight / 13.0;

            for (let i = 0; i < boxes; i++) {
                if (i === boxes - 1) {
                    shipping.weight = totalWeight % 13
                } else {
                    shipping.weight = 13.0
                }
                buyShipLabel (shipping);
            }
        } else {
            shipping.weight = totalWeight;
            buyShipLabel (shipping);
        }
    })
});