const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');

function authenticate(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Dostop zavrnjen' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Neveljaven žeton' });
    }
}

module.exports = authenticate;
