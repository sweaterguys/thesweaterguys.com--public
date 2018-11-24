const stock = require('../api/stock'),
    cart = require('cart');

module.exports = require('express').Router()
    .get('/', (req, res) =>
        stock.get((req.originalUrl).split('/').pop()).then((stock)=>
            res.render('product', { title: req.originalUrl.split('/').pop(), stock: stock, cart: cart.get(req.cookies) })
        )
    );