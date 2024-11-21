const express = require('express');
const Post = require('../models/Post');
const { verifyToken } = require('../middleware/auth');
const sanitizeHtml = require('sanitize-html');
const router = express.Router();

// Create Post
router.post('/', verifyToken, async (req, res) => {
    const { title, content } = req.body;

    const sanitizedContent = sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'span', 'u']), // Customize as needed
        allowedAttributes: {
            '*': ['style'], // Customize based on the styles you want to allow
        }
    });

    const post = new Post({ title, content: sanitizedContent, author: req.user.id });

    try {
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
        .populate([
            { path: 'author', select: 'username profileImage' },
            { 
                path: 'comments.user', 
                select: 'username profileImage'
            },
            { 
                path: 'comments.replies.user', 
                select: 'username profileImage'
            }
        ])
        .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch a post by ID
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        .populate([
            { path: 'author', select: 'username profileImage' }, // Populate post author
            { 
                path: 'comments.user', 
                select: 'username profileImage' // Populate comment authors
            },
            { 
                path: 'comments.replies.user', 
                select: 'username profileImage' // Populate reply authors
            }
        ]);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Update Post
router.put('/:id', verifyToken, async (req, res) => {
    const { title, content } = req.body;

    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this post' });
        }

        post.title = title;
        post.content = content;
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Post
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to delete this post' });
        }

        await post.deleteOne();
        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Implementing Comment System routes

// Add a comment
router.post('/:postId/comments',verifyToken, async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user.id; // Assume user is authenticated
        const post = await Post.findById(req.params.postId);

        post.comments.push({ user: userId, content });
        await post.save();
        await post.populate('comments.user', 'username profileImage');
        res.status(201).json(post.comments);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Add a reply to a comment
router.post('/:postId/comments/:commentId/replies',verifyToken, async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user.id; // Assume user is authenticated
        const post = await Post.findById(req.params.postId);

        const comment = post.comments.id(req.params.commentId);
        comment.replies.push({ user: userId, content });
        await post.save();

        await post.populate([
            { path: 'comments.user', select: 'username profileImage' },
            { path: 'comments.replies.user', select: 'username profileImage' },
        ]);

        res.status(201).json(post.comments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add reply' });
    }
});

// Update a comment
router.put('/:postId/comments/:commentId', async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Post.findById(req.params.postId);

        const comment = post.comments.id(req.params.commentId);
        comment.content = content;
        await post.save();

        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update comment' });
    }
});

// Delete a comment
router.delete('/:postId/comments/:commentId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        post.comments.id(req.params.commentId).remove();
        await post.save();

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});



module.exports = router;
