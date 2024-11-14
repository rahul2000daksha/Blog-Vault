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
        const posts = await Post.find().populate('author', 'username').populate('comments.user', 'username');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch a post by ID
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
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

module.exports = router;
