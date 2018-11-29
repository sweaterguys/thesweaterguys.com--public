const cart = require('cart'),
    pay = require('pay'),
    ship = require('../api/ship'),
    stock = require('../api/stock'),
    sms = require('../api/sms'),
    slack = require('../api/slack'),
    email = require('../api/email');

module.exports = require('express').Router()
    .get('/', (req, res) =>
        res.render('paymentPortal', { title: 'Payment Portal', cart: cart.get(req.cookies) })
    )
    .post('/', function (req, res) {
        let images = [];
        let cart = req.cookies["cart"];
        req.cookies["cart"].forEach(function(image) {
            images.push({
                product: image.product,
                color: image.color,
                logo: image.logo,
                x: image.x,
                y: image.y,
                width: image.width,
                height: image.height
            });
        });
        let shipping = {
            email: req.body.shipping_email,
            name: req.body.shipping_firstName + ' ' + req.body.shipping_lastName,
            address: req.body.shipping_address2.replace(/^\D+/g, '') + req.body.shipping_address,
            zip: req.body.shipping_zip,
            city: req.body.shipping_city,
            province: req.body.shipping_province,
            phone: req.body.shipping_phone,
            speed: req.body.shipping
        };
        let billing = {
            EMAIL: req.body.billing_email,
            NAME: req.body.billing_firstName + ' ' + req.body.billing_lastName,
            ADDR1: req.body.billing_address2.replace(/^\D+/g, '') + req.body.billing_address,
            ZIPCODE: req.body.billing_zip,
            CITY: req.body.billing_city,
            STATE: req.body.billing_province,
            PHONE: req.body.billing_phone,
            AMOUNT: req.body.total.replace('$', ''),
            CC_NUM: req.body.ccNum,
            CC_EXPIRES: req.body.expire,
            CVCCVV2: req.body.cvv
        };
        if (req.body.sameadr === "on") {
            billing = {
                EMAIL: req.body.shipping_email,
                NAME: req.body.shipping_firstName + ' ' + req.body.shipping_lastName,
                ADDR1: req.body.shipping_address2.replace(/^\D+/g, '') + req.body.shipping_address,
                ZIPCODE: req.body.shipping_zip,
                CITY: req.body.shipping_city,
                STATE: req.body.shipping_province,
                PHONE: req.body.shipping_phone,
                AMOUNT: req.body.total,
                CC_NUM: req.body.ccNum,
                CC_EXPIRES: req.body.expire,
                CVCCVV2: req.body.cvv
            }
        }
        pay(billing).then(function (result) {
            if (result[0]){
                // let trackingLabel = ship.getShipLabel('https://ct.soa-gw.canadapost.ca/rs/artifact/1d7a90d2c72cb7a2/10001248060/0');
                let trackingLabel = '1234567890';
                res.clearCookie("cart");
                res.redirect('/success');
                let itemsToBuy = [];
                for (let item in req.cookies["cart"]){
                    itemsToBuy.push({
                        "product": req.cookies["cart"][item]["product"],
                        "color": req.cookies["cart"][item]["niceColor"],
                        "size": req.cookies["cart"][item]["size"],
                        "quantity": req.cookies["cart"][item]["quantity"]
                    })
                }
                console.log({"1a394191-24d5-4922-83bd-f31f39610f4b": itemsToBuy});
                console.log(trackingLabel);
                // res.send(result[1] + trackingLabel);
                email.send({
                    from: 'Sweater Guy',
                    to: shipping['email'],
                    subject: 'The Sweater Guys Receipt',
                    body: {
                        message: "Thanks so much for your order! We'll be in touch!",
                        preheader: 'Thank You!',
                        contact: shipping['name'].split(' ')[0]
                    },
                    template: 'basic'
                });
                email.send({
                    from: 'Sweater Guy',
                    to: 'talk@thesweaterguys.com',
                    subject: 'New Order',
                    body: {
                        message: 'New Client!' +'\n' + 'CART: ' + JSON.stringify(cart) +'\n' + 'Shipping: ' + JSON.stringify(shipping),
                        preheader: 'order',
                        contact: 'Sweater'
                    },
                    template: 'basic'
                });
                slack.send({
                    channel: 'orders',
                    images: images,
                    message: 'New Client!' +'\n' + 'CART: ' + JSON.stringify(cart) +'\n' + 'Shipping: ' + JSON.stringify(shipping)
                });
                sms.send({
                    message: 'New Message from The Sweater Guys: Thanks for your order! check your email for your tracking number!',
                    number: shipping['phone']
                });
                sms.send({
                    message: 'New Client!',
                    number: 4168226761
                });
                stock.order(itemsToBuy);
            }else{
                res.redirect('/error?error='+result[1]);
            }
        });
    });