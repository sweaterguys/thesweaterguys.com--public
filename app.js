console.log(`Welcome to the ${process.env.NODE_ENV} environment`);

// declare dependencies
const
    express = require('express'),
    path = require('path'),
    app = express();
require('dotenv').config({path: './private/.env'});

// set views engine
app.set('views', [
    path.join(__dirname, 'views'),
    path.join(__dirname, 'views/pages'),
    path.join(__dirname, 'views/modules'),
    path.join(__dirname, 'views/admin')
]).set('view engine', 'ejs');

// initialize dependencies
app.use(
    express.json(),
    express.urlencoded({ extended: false }),
    express.static(path.join(__dirname, 'public')),
    require('stylus').middleware(path.join(__dirname, 'public')),
    require('morgan')('dev'),
    require('cookie-parser')()
);

// declare routes
routes = {
    '': './routes/index',
    api: './routes/api',
    about: './routes/about',
    cart: './routes/cart',
    contact: './routes/contact',
    design: './routes/design',
    developer: './routes/developer',
    error: './routes/error',
    hoodie: './routes/product',
    crew: './routes/product',
    quarter: './routes/product',
    faq: './routes/faq',
    pay: './routes/pay',
    success: './routes/success',
    terms: './routes/terms',
};

// set up a route to redirect http to https
if (process.env.NODE_ENV === 'production') {
    app.get('*', function(req, res) {
        if (!req.secure) {
            res.redirect('https://' + req.headers.host + req.url);
        }
    });
}

// set app.locals
app.locals.svg = require('./public/data/svgPaths.json');

// initialize routes
for (let route in routes) app.use('/'+route, require(routes[route]))

//catch errors
app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use((err, req, res) => {
    console.log(err);
    res.clearCookie('cart');
    res.status(err.status || 500);
    res.render('error', {
        title: 'oops',
        error: err.status || 500,
        cart: 0
    });
});

//export app
module.exports = app;