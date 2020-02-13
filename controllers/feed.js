const { validationResult } = require('express-validator');

// Models
const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    Post.find()
        .then(posts => {
            return res.status(200)
                .json({
                    message: "Successfuly Fetched Posts.",
                    posts: posts
                })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Fialed. User Inputs Are Incorrect')
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: "images/duck.jpg",
        creator: {
            name: "Max"
        },
    })
    post.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: "Post Created Succesfuly",
                post: result
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Post Not Found');
                error.statusCode = 404;
                throw error;
            }
            return res.status(200).json({ message: "Post Fetched", post: post });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}