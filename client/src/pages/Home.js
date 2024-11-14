import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Post from '../components/Post';
import PostForm from '../components/PostForm';


const Home = ({handleLogout}) => {
    const [posts, setPosts] = useState([]);
    

    const fetchPosts = async () => {
        const response = await axios.get('http://localhost:5000/api/posts/');
        setPosts(response.data);
       
    };

    useEffect(() => {
        fetchPosts();
    }, []);


    return (
        <div>
            <h1>Blog Platform</h1>
            <PostForm refetch={fetchPosts} />
            <button onClick={handleLogout}>Logout</button>
            {posts.map(post => (
                <Post key={post._id} post={post} />
            ))}
        </div>
    );
};

export default Home;
