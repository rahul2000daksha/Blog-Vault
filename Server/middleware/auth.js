const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(500).json({ message: 'Failed to authenticate token' });

        req.user = await User.findById(decoded.id);
        next();
    });
};

module.exports = { verifyToken };
