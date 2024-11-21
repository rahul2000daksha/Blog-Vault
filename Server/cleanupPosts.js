const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('./models/Post'); // Adjust the path to your Post model

dotenv.config();


const cleanupPosts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const result = await Post.deleteMany({ author: null });
        console.log(`Deleted ${result.deletedCount} posts with null authors.`);
        mongoose.disconnect();
    } catch (error) {
        console.error('Error cleaning up posts:', error);
        mongoose.disconnect();
    }
};

cleanupPosts();
