const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');


exports.signup = ( req, res, next ) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array()
        throw error;
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt.hash(password, 12)
        .then(hashedPw => {
            const user = new User({
                email: email,
                password: hashedPw,
                name: name
            })
            return user.save()
        })
        .then(result => {
            res.status(201).json({ message: "User Created !", userId: result._id })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let foundUser;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                const err = new Error('User With this email not found');
                err.statusCode = 401;
                throw err;
            }
            foundUser = user
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if (!isEqual) {
                const err = new Error("Wrong password");
                err.statusCode = 401;
                throw err;
            }
            const token = jwt.sign({
                email: email,
                userId: foundUser._id.toString()
            },
            process.env.JWT_SECRET, 
            { expiresIn: '1h' })
            res.status(200).json({
                token: token,
                userId: foundUser._id.toString()
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}