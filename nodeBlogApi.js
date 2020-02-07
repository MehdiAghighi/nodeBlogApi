// Node Packages

// 3rd Party Packages
const express = require('express');
const bodyParser = require('body-parser');

// Controllers

// Routes
const feedRoutes = require('./routes/feed');

const app = express();

app.use(bodyParser.json());

app.use('/feed', feedRoutes);

app.listen(8080);