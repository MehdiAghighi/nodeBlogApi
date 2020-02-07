exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [ { title: "Post #1", content: "this is some post content" } ]
    });
}

exports.createPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;
    // Create In DB
    res.status(201).json({
        message: "Post Created Succesfuly",
        post: {
            id: new Date().toISOString(),
            title: title,
            content: content
        }
    })
}