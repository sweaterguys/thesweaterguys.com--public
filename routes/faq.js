const cart = require('cart');

module.exports = require('express').Router()
    .get('/', function(req, res) {
        res.render('faq', { title: 'FAQ', cart: cart.get(req.cookies) });
    });