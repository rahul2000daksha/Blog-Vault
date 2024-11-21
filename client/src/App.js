import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Register';
import EditPostForm from './components/EditPostForm';
import ProfilePage from './pages/ProfilePage';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        // Check if the user is logged in based on token presence in localStorage
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }

        // Check if the user has registered based on a flag in localStorage
        const registered = localStorage.getItem('isRegistered');
        if (registered) {
            setIsRegistered(true);
        } else {
            setIsRegistered(false);
        }
    }, []);

    // After successful registration
    const handleRegister = () => {
        localStorage.setItem('isRegistered', true);
        setIsRegistered(true);
    };

    // After successful login
    const handleLogin = (token) => {

        localStorage.setItem('token', token);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    const handleNewUser = () => {
        console.log('Redirecting to register page');
        setIsRegistered(false);
    };
    const handleOldUser = () => {
        console.log('Redirecting to login page');
        setIsRegistered(true);
    };

    return (
        <Router>
            <Routes>
                {/* Show Register page only if user is not registered */}
                <Route
                    path="/register"
                    element={!isRegistered ? <Register onRegister={handleRegister} handleOldUser={handleOldUser} /> : <Navigate to="/login" />}
                />

                {/* Show Login page only if user is registered but not logged in */}
                <Route
                    path="/login"
                    element={isRegistered && !isAuthenticated ? <Login onLogin={handleLogin} handleNewUser={handleNewUser} /> : <Navigate to="/" />}
                />

                {/* Show Home page only if user is authenticated */}
                <Route
                    path="/"
                    element={isAuthenticated ? <Home handleLogout={handleLogout} /> : <Navigate to={isRegistered ? "/login" : "/register"} />}
                />

                <Route
                    path="/edit/:id"
                    element={isAuthenticated ? <EditPostForm /> : <Navigate to="/login" />}
                />

                <Route
                    path="/profile"
                    element= {<ProfilePage/>}
                />


            </Routes>
        </Router>
    );
}

export default App;
