import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useParams, useNavigate } from 'react-router-dom';
import './editform.css'; // Import the new CSS file

const EditPostForm = () => {
    const { id } = useParams(); // Get post ID from URL
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async () => {
            const response = await axios.get(`http://localhost:5000/api/posts/${id}`);
            setTitle(response.data.title);
            setContent(response.data.content);
        };

        fetchPost();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token'); // Get the token from local storage
        await axios.put(`http://localhost:5000/api/posts/${id}`, { title, content }, {
            headers: { Authorization: token },
        });

        navigate('/'); // Redirect to home after editing
    };

    return (
        <div className="edit-form-container">
            <form className="edit-form" onSubmit={handleSubmit}>
                <input
                    className="edit-title-input"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    required
                />
                <ReactQuill
                    className="edit-content-editor"
                    value={content}
                    onChange={setContent}
                    placeholder="Write your post here..."
                />
                <button className="edit-submit-btn" type="submit">Update Post</button>
            </form>
        </div>
    );
};

export default EditPostForm;
