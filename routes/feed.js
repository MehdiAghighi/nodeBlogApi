// Node Packages

// 3rd Party Packages
const express = require('express');

// Controllers
const feedController = require('../controllers/feed');

const router = express.Router()

// GET /feed/posts
router.get('/posts', feedController.getPosts);

// POST /feed/post
router.post('/post', feedController.createPost);

module.exports = router;