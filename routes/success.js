const cart = require('cart');

module.exports = require('express').Router()
    .get('/', (req, res) =>
        res.render('success', { title: 'Success!', cart: cart.get(req.cookies) }));