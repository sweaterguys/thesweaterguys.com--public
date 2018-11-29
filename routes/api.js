const Multer = require('multer'),
    multer = Multer({storage: Multer.memoryStorage(), limits: {fileSize: 20 * 1024 * 1024}});


const sms = require('sms'), email = require('email'), slack = require('slack'), mockup = require('mockup'),
    upload = require('upload'), cart = require('cart'), pay = require('pay'), auth = require('auth');

module.exports = require('express').Router()
    .get('/', (req, res) =>
        res.render('terminal', { title: 'api', cart: cart.get(req.cookies) })
    )
    .post('/sms/send', auth, (req, res) =>
        sms.send(req.body).then(status => res.send(status))
    )
    .post('/sms/receive', (req) =>
        sms.receive(req.body).then(data => console.log(data))
    )
    .post('/slack/send', auth, (req, res) =>
        slack.send(req.body).then(status => res.send(status))
    )
    .post('/slack/receive', (req, res) =>
        slack.send(req.body).then(status => res.send(status))
    )
    .post('/email/send', auth, (req, res) =>
        email.send(req.body).then(status=>res.sendStatus(status))
    )
    .post('/email/send/test', auth, (req, res) =>
        res.render('../../api/email/templates/'+ req.body.template +'.ejs', {body: req.body.body})
    )
    .post('/upload', multer.single('file'), (req, res) =>
        upload(req.file).then(file => res.send(file))
    )
    .post('/mockup', (req, res) =>
        mockup(req.body).then(mockup=>res.send(mockup))
    )
    .post('/pay', (req, res) =>
        pay(req.body).then(status => res.send(status))
    );
