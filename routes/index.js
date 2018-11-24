const mockup = require('mockup'),
    cart = require('cart');
module.exports = require('express').Router()
    .get('/', function(req, res) {
        let r = req.cookies,
            q = req.query,
            svg = {};
        if (q.Name) {
            svg = mockup.svg('hoodie', 'white', '#111', q.Name, '', '', '', '');
        }
        else if (r['cart'] && r['cart'].length > 0){
            let s = r['cart'];
            s = s[s.length - 1];
            svg = mockup.svg(s.product, '', s.color, s.logo, s.x, s.y, s.width, s.height);
        }
        else{
            svg = mockup.svg('hoodie','', '#CCC', '', '', '', '');
        }
        res.render('index', { title: 'The Sweater Guys', cart: cart.get(req.cookies), svg: svg });
    });