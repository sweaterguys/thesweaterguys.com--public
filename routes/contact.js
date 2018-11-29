const cart = require('cart'),
    email = require('email');

module.exports = require('express').Router()
    .get('/', (req, res) =>
        res.render('contact', { title: 'contact', cart: cart.get(req.cookies) }))
    .get('/unsubscribe', (req, res) =>
        res.send(email.blacklist(req.query.email))
    )
    .post('/', (req, res) => {
        res.render('success', { title: 'Success', cart: cart.get(req.cookies) });
        email.send({
            from: 'Sweater Guy',
            to: 'talk@thesweaterguys.com',
            subject: 'new email from ' + req.body.from,
            body: {
                message: req.body.email + ' : ' + req.body.message,
                preheader: req.body.email,
                contact: 'Sweater'
            },
            template: 'basic'
        });
        email.send({
            from: 'Sweater Guy',
            to: req.body.email,
            subject: 'Thanks For Your Email!',
            body: {
                message: "Thanks so much for your email! We'll be in touch!",
                preheader: 'Thank You!',
                contact: req.body.from.split(' ')[0]
            },
            template: 'basic'
        });
    });