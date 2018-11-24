const cart = require('cart');
module.exports = require('express').Router()
    .get('/', function(req, res) {
        res.render('about', { title: 'About', cart: cart.get(req.cookies) });
    });