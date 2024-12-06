import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './profilePage.css';
import { useNavigate } from 'react-router-dom';
import defaultAvatar from '../images/Default-User-Image.png';

const ProfilePage = () => {
    const [username, setUsername] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/profile/user', {
                    headers: { Authorization: token },
                });

                setUsername(response.data.username);
                setProfileImage(response.data.profileImage);
                setUserId(response.data._id);
            } catch (error) {
                console.error('Error fetching user data:', error);
                alert('Failed to fetch user data.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setPreviewImage(URL.createObjectURL(file));
        setProfileImage(file);
    };

    const handleUpdateProfile = async () => {
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('profileImage', profileImage);
            formData.append('userId', userId);

            const token = localStorage.getItem('token');
            const response = await axios.put('http://localhost:5000/api/profile/update', formData, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'multipart/form-data',
                },
            });


            alert('Profile updated successfully!');
            setProfileImage(response.data.user.profileImage);
            setPreviewImage('');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    const profileImageSrc = profileImage
        ? `http://localhost:5000${profileImage}`
        : defaultAvatar;

    return (
        <div className="profile-page">
            <button className='back-btn' style={{ zIndex: '1' }} onClick={() => navigate('/')}>Back</button>
            <h1>Edit Profile</h1>
            <div className="profile-container">
                <div className="image-preview">

                    <img
                        src={previewImage || profileImageSrc}
                        alt="Profile"
                    />
                    <input type="file" onChange={handleImageChange} />
                </div>
                <div className="profile-info">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Update Username"
                    />
                    <button onClick={handleUpdateProfile}>Save Changes</button>
                    
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;





