const cart = require('cart');
module.exports = require('express').Router()
    .get('/', (req, res) =>
        res.render('terms', { title: 'Terms', cart: cart.get(req.cookies) }));