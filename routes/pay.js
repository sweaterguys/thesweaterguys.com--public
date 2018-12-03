const cart = require('cart'),
    pay = require('pay'),
    ship = require('ship'),
    stock = require('stock'),
    sms = require('sms'),
    slack = require('slack'),
    email = require('email');

module.exports = require('express').Router()
    .get('/', (req, res) =>
        res.render('paymentPortal', { title: 'Payment Portal', cart: cart.get(req.cookies) })
    )
    .post('/', function (req, res) {
        console.log("New Order: " + req.body.shipping_firstName);
        let cart = req.cookies["cart"],
            images = [],
            quantity = 0;
        cart.forEach(function(item) {
            // images.push({
            //     product: item.product,
            //     color: item.color,
            //     logo: item.logo,
            //     x: item.x,
            //     y: item.y,
            //     width: item.width,
            //     height: item.height
            // });
            images.push(item.logo);
            quantity += parseInt(item.quantity);
        });
        let shipping = {
            email: req.body.shipping_email,
            name: req.body.shipping_firstName + ' ' + req.body.shipping_lastName,
            address: req.body.shipping_address,
            address_2: req.body.shipping_address2,
            postalCode: req.body.shipping_zip,
            city: req.body.shipping_city,
            province: req.body.shipping_province,
            phone: req.body.shipping_phone,
            speed: req.body.shipping,
            company: "The Sweater Guys",
            country: "CA",
            sweaters: quantity,
            tshirts: 0
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
        console.log("Attempting Payment of " + billing.AMOUNT + "...");
        pay(billing).then(function (result) {
            console.log("Payment: " + result[4]);
            if (result[0]){
                console.log("purchasing shipping label");
                ship(shipping).then(tracker => {
                    console.log("Shipping Label Purchased: " + tracker);
                    res.clearCookie("cart");
                    res.redirect('/success');
                    let itemsToBuy = [];
                    for (let item in cart){
                        itemsToBuy.push({
                            "product": cart[item]["product"],
                            "color": cart[item]["niceColor"],
                            "size": cart[item]["size"],
                            "quantity": cart[item]["quantity"]
                        })
                    }
                    // res.send(result[1] + trackingLabel);
                    email.send({
                        from: 'Sweater Guy',
                        to: shipping['email'],
                        subject: 'The Sweater Guys Receipt',
                        body: {
                            message: "Thanks so much for your order! We'll be in touch! Your Tracking Label can be found here:" + tracker,
                            preheader: 'Thank You!',
                            contact: shipping['name'].split(' ')[0]
                        },
                        template: 'basic'
                    });
                    console.log("Sent Email to: " + shipping['email']);

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
                    console.log("Sent Email to: Sweater Guys");

                    slack.send({
                        channel: 'orders',
                        images: images,
                        message: 'New Client!'
                    });
                    console.log("Sent Slack to: orders");

                    sms.send({
                        message: 'New Message from The Sweater Guys: Thanks for your order! Track it here: ' + tracker,
                        number: shipping['phone']
                    });
                    console.log("Sent SMS to: " + shipping['phone']);
                    sms.send({
                        message: 'New Client!',
                        number: 4168226761
                    });
                    console.log("Sent SMS to: Sweater Guys");
                    console.log("Purchasing " + quantity + " Items...");
                    stock.order(itemsToBuy);
                    console.log("Done!");
                });
            }else{
                res.redirect('/error?error='+result[1]);
                console.log("ERR: " + result[1]);
            }
        });
    });