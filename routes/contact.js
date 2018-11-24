const cart = require('cart'),
    email = require('../api/email');

module.exports = require('express').Router()
    .get('/', (req, res) =>
        res.render('contact', { title: 'contact', cart: cart.get(req.cookies) }))
    .post('/', (req, res) => {
        res.render('success', { title: 'Success', cart: api.cart(req.cookies) });
        email.send('talk@thesweaterguys.com', req.body.subject, 'new email from ' + req.body.from + ': ' + req.body.message);
        email.send(req.body.from, 'Thanks For Your Email!', "Thanks so much for your email! We'll be in touch!");
    });