const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User'); // Adjust the path to your User model
const { verifyToken } = require('../middleware/auth');
const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Save uploaded files to "uploads/" folder



// Get current user data
router.get('/user', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            _id: user._id,
            username: user.username,
            profileImage: user.profileImage,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});






// Update user profile
router.put('/update', verifyToken, upload.single('profileImage'), async (req, res) => {
    const { username } = req.body;

    try {
        // Ensure the logged-in user is updating their own profile
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Update fields
        if (username) user.username = username;
        if (req.file) user.profileImage = `/uploads/${req.file.filename}`;

        const updatedUser = await user.save();
        res.json({
            message: 'Profile updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
