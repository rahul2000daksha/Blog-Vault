import React, { useState } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './postForm.css'; // Import the new CSS file
const apiUrl = process.env.REACT_APP_API_URL;


const PostForm = ({ refetch }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token'); // Get the token from local storage
        await axios.post(`${apiUrl}/api/posts/`, { title, content }, {
            headers: { Authorization: token },
        });

        setTitle('');
        setContent('');
        refetch();
    };

    return (
        <form className="post-form" onSubmit={handleSubmit}>
            <input 
                type="text" 
                className="post-title-input"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Title" 
                required 
            />
            <ReactQuill 
                value={content} 
                onChange={setContent} 
                placeholder="Write your post here..." 
                className="post-content-editor"
            />
            <button type="submit" className="post-submit-btn">Create Post</button>
        </form>
    );
};

export default PostForm;
