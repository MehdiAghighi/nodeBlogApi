// Node Packages
const path = require('path');

// 3rd Party Packages
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
require('dotenv').config();

// Controllers

// Routes
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};


app.use(bodyParser.json());
app.use(
    multer({
        storage: fileStorage,
        fileFilter: fileFilter
    }).single('image')
);

app.use('/images', express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((err, req, res, next) => {
    console.log(err);
    const status = err.statusCode || 500;
    const message = err.message;
    const data = err.data;
    res.status(status)
        .json({
            message: message,
            data: data
        })
})

mongoose.connect(process.env.MONGODB_URI)
    .then(res => {
        app.listen(8080);
    })
    .catch(err => {
        console.log(err);
    })