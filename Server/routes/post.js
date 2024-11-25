const express = require('express');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const { verifyToken } = require('../middleware/auth');
const sanitizeHtml = require('sanitize-html');
const router = express.Router();



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify upload directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

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
router.post('/:postId/comments', verifyToken,upload.array('files', 5), async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user.id; // Assume user is authenticated
        const files = req.files.map(file => ({
            filename: file.originalname,
            url: `/uploads/${file.filename}`
        }));
        const post = await Post.findById(req.params.postId);

        post.comments.push({ user: userId, content,files });
        await post.save();
        await post.populate([
            { path: 'comments.user', select: 'username profileImage' },
            { path: 'comments.replies.user', select: 'username profileImage' },
        ]);
        res.status(201).json(post.comments);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Add a reply to a comment
router.post('/:postId/comments/:commentId/replies', verifyToken,upload.array('files', 5), async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user.id; // Assume user is authenticated
        const files = req.files.map(file => ({
            filename: file.originalname,
            url: `/uploads/${file.filename}`
        }));
        const post = await Post.findById(req.params.postId);

        const comment = post.comments.id(req.params.commentId);
        comment.replies.push({ user: userId, content,files });
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
router.put('/:postId/comments/:commentId', verifyToken, async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Post.findById(req.params.postId);

        const comment = post.comments.id(req.params.commentId);
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this comment' });
        }
        comment.content = content;
        await post.save();

        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update comment' });
    }
});

// Delete a comment
router.delete('/:postId/comments/:commentId', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        const comment = post.comments.id(req.params.commentId);

        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to delete this comment' });
        }

        comment.deleteOne();
        await post.save();

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});



// Update a reply
router.put('/:postId/comments/:commentId/replies/:replyId', verifyToken, async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Post.findById(req.params.postId);

        const comment = post.comments.id(req.params.commentId);
        const reply = comment.replies.id(req.params.replyId);

        if (reply.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to update this reply' });
        }

        reply.content = content;
        await post.save();

        res.status(200).json(reply);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update reply' });
    }
});

// Delete a reply
router.delete('/:postId/comments/:commentId/replies/:replyId', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        const comment = post.comments.id(req.params.commentId);
        const reply = comment.replies.id(req.params.replyId);

        if (reply.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'You are not authorized to delete this reply' });
        }

        reply.deleteOne();
        await post.save();

        res.status(200).json({ message: 'Reply deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete reply' });
    }
});

router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = router;
