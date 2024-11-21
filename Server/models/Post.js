const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    replies: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            content: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments: [CommentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
