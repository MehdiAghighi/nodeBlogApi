const path = require('path');
const fs = require('fs');

const {
    validationResult
} = require('express-validator');

const io = require('../socket');

// Models
const Post = require('../models/post');
const User = require('../models/user');

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
                .populate('creator')
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
        creator: req.userId
    });
    let creator;
    post.save()
        .then(result => {
            return User.findById(req.userId);
        })
        .then(user => {
            creator = user;
            user.posts.push(post);
            return user.save()
        })
        .then(result => {
            io.getIO().emit('posts', {
                action: 'CREATE',
                post: {
                    ...post._doc,
                    creator: {_id: result._id, name : result._doc.name}
                }
            })
            res.status(201).json({
                message: "Post Created Succesfuly",
                post: post,
                creator: {
                    _id: creator._id,
                    name: creator.name
                }
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
            return res.status(200).json({
                message: "Post Fetched",
                post: post
            });
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

    // console.log(req.file)
    if (req.file) {
        imageUrl = req.file.path
    }
    // console.log(imageUrl)
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
            if (post.creator.toString() !== req.userId) {
                const error = new Error("You don't have premission to do this");
                error.statusCode = 403;
                throw error;
            }
            if (req.file) {
                clearImage(post.imageUrl)
                post.imageUrl = imageUrl;
            }
            post.title = title;
            post.content = content;
            return post.save()
        })
        .then(result => {
            res.status(200).json({
                message: "updated succesfuly",
                post: result
            })
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
            if (post.creator.toString() !== req.userId) {
                const error = new Error("You don't have premission to do this");
                error.statusCode = 403;
                throw error;
            }
            clearImage(post.imageUrl);
            return Post.findByIdAndRemove(postId)
        })
        .then(result => {
            return User.findById(req.userId)
        })
        .then(user => {
            user.posts.pull(postId)
            return user.save();
        })
        .then(result => {
            return res.status(200).json({
                message: 'Deleted Succesfuly'
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}