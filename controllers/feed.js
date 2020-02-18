const path = require('path');
const fs = require('fs');

const { validationResult } = require('express-validator');

// Models
const Post = require('../models/post');

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    Post.find().countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage)
        })
        .then(posts => {
            return res.status(200)
                .json({
                    message: "Successfuly Fetched Posts.",
                    posts: posts,
                    totalItems: totalItems
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
    if (!req.file) {
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
      }
      const imageUrl = req.file.path;
      const title = req.body.title;
      const content = req.body.content;
      const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: { name: 'Maximilian' }
      });
    
    post.save()
        .then(result => {
            // console.log(result);
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

exports.updatePost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Fialed. User Inputs Are Incorrect')
        error.statusCode = 422;
        throw error;
    }
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path
    }
    if (!imageUrl) {
        const error = new Error('No File Picked.')
        error.statusCode = 422;
        throw error;
    }

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('No Post Found.')
                error.statusCode = 400;
                throw error;
            }
            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl)
            }
            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl;
            return post.save()
        })
        .then(result => {
            res.status(200).json({ message: "updated succesfuly", post: result })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('No Post Found.')
                error.statusCode = 400;
                throw error;
            }
            // Check User
            clearImage(post.imageUrl);
            return Post.findByIdAndRemove(postId)
        })
        .then(result => {
            console.log(result);
            return res.status(200).json({ message: 'Deleted Succesfuly' })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}