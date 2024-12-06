import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './register.css'; // Link to the CSS file

const Register = ({ onRegister, handleOldUser }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:5000/api/users/register', { username, email, password });
        onRegister();
        navigate('/login');
    };

    return (
        <div className="register-container">
            
            <form className="register-form" onSubmit={handleRegister}>
                <h1 className='register-heading'>Register Now</h1>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button className='registerbtn' type="submit">Register</button>
                <button className="old-user-btn" onClick={handleOldUser}>If already registered?</button>

            </form>
        </div>
    );
};

export default Register;
