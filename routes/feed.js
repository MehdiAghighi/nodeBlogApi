// Node Packages

// 3rd Party Packages
const express = require('express');
const { body } = require('express-validator');

// Controllers
const feedController = require('../controllers/feed');

// MiddleWares
const { isAuth } = require('../middlewares/is-auth');

const router = express.Router()

// GET /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

// POST /feed/post
router.post('/post', [
    body('title')
        .trim()
        .isLength({ min: 5 }),
    body('content')
        .trim()
        .isLength({ min: 5 })
], feedController.createPost);

router.get('/post/:postId', isAuth, feedController.getPost);

router.put('/post/:postId', isAuth, [
    body('title')
        .trim()
        .isLength({ min: 5 }),
    body('content')
        .trim()
        .isLength({ min: 5 })
], feedController.updatePost);

router.delete('/post/:postId', feedController.deletePost);

module.exports = router;