const cart = require('cart');

module.exports = require('express').Router()
    .get('/', (req, res) =>
        res.render('design', { title: 'Design Studio', cart: cart.get(req.cookies)}))

    .post('/', function(req, res){
        cart.set(req.cookies, req.body, res).then(newCart => res.send(cart.get({'cart':newCart})));
    });