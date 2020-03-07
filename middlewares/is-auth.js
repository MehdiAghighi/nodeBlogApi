const jwt = require('jsonwebtoken');

exports.isAuth = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const err = new Error('No Authorization Token is given');
        err.statusCode = 401;
        throw err;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        // Wrong Format
        err.statusCode = 500;
        throw err;
    }
    // Correct Format But Not Verified (Means Not With This Secret)
    if (!decodedToken) {
        const err = new Error('Not Authenticated.');
        err.statusCode = 500;
        throw err;
    }
    req.userId = decodedToken.userId;
    next();
}