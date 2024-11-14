import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
                setError('Invalid credentials'); // Set a generic error for other cases
            }
        }
    };

    

    return (
        <>

            <form onSubmit={handleLogin}>
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
                <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button onClick={handleNewUser} >New User ? register first</button>

        </>
    );
};

export default Login;
