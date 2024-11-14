import React, { useState } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const PostForm = ({refetch}) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token'); // Get the token from local storage
        await axios.post('http://localhost:5000/api/posts/', { title, content }, {
            headers: { Authorization: token },
        });

        setTitle('');
        setContent('');
        refetch();
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Title" 
                required 
            />
            <ReactQuill value={content} onChange={setContent} placeholder="Write your post here..." />
            <button type="submit">Create Post</button>
        </form>
    );
};

export default PostForm;
