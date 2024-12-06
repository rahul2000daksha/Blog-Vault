import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './register.css'; // Same CSS file used for styling both components

const Login = ({ onLogin, handleNewUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/api/users/login', { email, password });
            onLogin(response.data.token);
            navigate('/');
        } catch (error) {
            if (error.response && error.response.data.message === 'User not found (Please register first)') {
                setError('User not found. Please register first.');
            } else {
                setError('Invalid credentials');
            }
        }
    };

    return (
        <div className="form-container">
            <form className="form-box" onSubmit={handleLogin}>
                <h2 className="form-heading">Login</h2>
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
                <button className="form-btn" type="submit">Login</button>
                <button className="redirect-btn" onClick={handleNewUser}>New User? Register first</button>

            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Login;
