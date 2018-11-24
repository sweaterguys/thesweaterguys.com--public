const mockup = require('../api/mockup'),
    discount = require('../private/discount'),
    cart = require('cart');

module.exports = require('express').Router()
    .get('/', (req, res) => {
        let lineItems = [],
            totalPrice = 0;
        if (req.cookies["cart"]){
            lineItems = req.cookies["cart"];
            lineItems.forEach(function(item) {
                item.svg = mockup.svg(item.product, '', item.color, item.logo, item.x, item.y, item.width, item.height);
                totalPrice += item.price * item.quantity;
            });
        }
        // console.log(lineItems);
        res.render('cart', { title: 'Cart', cart: cart.get(req.cookies), lineItems: lineItems, subtotal: totalPrice});
    })
    .post('/', (req, res) => {
        console.log(req.body);
        let lineItems = req.body;
        lineItems.taxRate = 15;
        if (Object.keys(discount).includes(lineItems.discountCode))
            lineItems.discount = discount[req.body.discountCode];
        else
            lineItems.discount = 0;
        res.render('checkout', { title: 'Checkout', cart: cart.get(req.cookies), lineItems: lineItems});
    })
    .post('/delete', (req, res)=>{
        cart.delete(req, res);
        res.redirect('/cart');
    })
    .post('/update', (req, res)=>{
        cart.update(req.cookies['cart'], req.body ,res);
        res.redirect('/cart');
    });