const cart = require('cart');

module.exports = require('express').Router()
    .get('/', function(req, res) {
        res.render('error', { error: req.query.error, title: 'Error', cart: cart.get(req.cookies) });
    });