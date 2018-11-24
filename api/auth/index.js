// Auth API
const credentials = require('credentials');

module.exports = auth = (req, res, next) => {
    if (req.headers.authorization)
        if (Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString() === credentials.auth)
            return next();
    res.header('WWW-Authenticate', 'Basic realm="Admin Area"');
    setTimeout(() => res.send('Authentication required', 401), 5000);
    console.log('Unable to authenticate user: '+ req.headers.authorization);
};