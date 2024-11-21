import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Post from '../components/Post';
import PostForm from '../components/PostForm';
import './home.css'; // Import the CSS file
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Home = ({ handleLogout }) => {
    const [posts, setPosts] = useState([]);

    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token);
    const userId = decoded.id;
    

    const fetchPosts = async () => {
        const response = await axios.get('http://localhost:5000/api/posts/');
        setPosts(response.data);
    };

    useEffect(() => {
        fetchPosts();
        
    }, []);

    const handleDeletePost = (deletedPostId) => {
        // Filter out the deleted post from the state
        setPosts((prevPosts) => prevPosts.filter((post) => post._id !== deletedPostId));
    };



    return (
        <div className="home-container">
            <h1 className="home-title">Blog-Vault</h1>
            <PostForm refetch={fetchPosts} />
            <button className='profile-btn' style={{zIndex:'1'}} onClick={() => navigate('/profile')}>Profile</button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
            <h1 className="PostSection-title" style={{zIndex:'1',position:'absolute',top:'60%', color:'white',textDecoration:'underline'}}>Post Feed</h1>
            <div className="posts-container">
                {posts.map(post => (
                    <Post key={post._id} post={post} userId={userId} handleDeletePost={handleDeletePost} />
                ))}
            </div>
        </div>
    );
};

export default Home;
