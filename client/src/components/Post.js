import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Post = ({ post }) => {
    const navigate = useNavigate();

    const handleDelete = async () => {
        const token = localStorage.getItem('token'); // Get the token from local storage
        try {
            await axios.delete(`http://localhost:5000/api/posts/${post._id}`, {
                headers: { Authorization: token },
            });
            // Optionally, you can trigger a refresh or update the UI accordingly
            window.location.reload(); // Simple way to refresh the posts
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = () => {
        navigate(`/edit/${post._id}`); // Navigate to the edit post form
    };

    return (
        <div>
            <h2>{post.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
            <small>By: {post.author.username}</small>
            <button onClick={handleEdit}>Edit</button>
            <button onClick={handleDelete}>Delete</button>
            {/* Optionally, implement comments functionality here */}
        </div>
    );
};

export default Post;
