const cart = require('cart'),
    fs = require('fs');

module.exports = require('express').Router()
    .get('/', function(req, res) {
        let file = fs.readFileSync('./README.md', 'utf8');
        let showdown  = require('showdown');
        showdown.setOption('tables', true);
        let converter = new showdown.Converter(),
            text      = file,
            html      = converter.makeHtml(text);
        res.render('developer', { title: 'Developer', cart: cart.get(req.cookies), markdown: html.replace(/public\/img/g, 'img')});
    });