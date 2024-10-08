import React, { useState, useEffect } from 'react';
import { Typography, Box, InputBase, IconButton, Snackbar } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import '../Components/Styles/LoginStyle.css';
import ey from '../assets/images/logo/ey.png';
import loginobject from '../assets/images/logo/loginobject.svg';
import axiosInstance from '../Components/utils/axiosInstance';
import { useAuth } from '../Components/utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [buttonClass, setButtonClass] = useState('');
    const [error, setError] = useState('');
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const { fetchUserData } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCsrfToken = async () => {
            try {
                await axiosInstance.get(`${BASE_URL}/api/csrf_cookie/`, { withCredentials: true });
            } catch (error) {
                console.error('Error fetching CSRF token:', error);
                setSnackbarMessage('Error fetching CSRF token. Please try refreshing the page.');
                setSnackbarOpen(true);
            }
        };

        fetchCsrfToken();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (email === '' || password === '') {
            setError('Please enter your email and password');
            return;
        }

        setError('');
        setButtonClass('button-animation');

        try {
            const loginData = { email, password };
            const response = await axiosInstance.post('/api/login/', loginData, {
                withCredentials: true,
            });

            if (response.status === 200) {
                const { access, refresh } = response.data;
                localStorage.setItem('access_token', access);
                localStorage.setItem('refresh_token', refresh);
                await fetchUserData();
                navigate('/dashboard');
            } else {
                setError('Invalid credentials');
            }
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (error.response.status === 403) {
                    setError('You are already logged in on another browser. Please log out there first.');
                } else if (error.response.data && error.response.data.detail) {
                    setError(error.response.data.detail);
                } else {
                    setError('An error occurred during login. Please try again.');
                }
            } else if (error.request) {
                // The request was made but no response was received
                setError('No response received from server. Please check your internet connection.');
            } else {
                // Something happened in setting up the request that triggered an Error
                setError('An unexpected error occurred. Please try again.');
            }
            console.error('Error during login:', error);
        } finally {
            setButtonClass('');
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <div className="container">
            <div className="left-section">
                <div className='left-content'>
                    <img className="logo" src={ey} alt="EY Logo" />
                    <h2 className='welcome'>Welcome to</h2>
                    <h1 className="title">EY Buzz.</h1>
                    <p className="subtitle">Effortless Social Media Management,<br /> All in One Place.</p>
                </div>
            </div>
            <div>
                <img className="object1" src={loginobject} alt="object" />
            </div>
            <div className="right-section">
                <Box className="login-container" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h5" className="signin-title">Sign In</Typography>
                    <p className='sub-text'>Enter your email and password to login to your account</p>
                    <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '400px' }}>
                        <InputBase
                            placeholder="Email Address"
                            fullWidth
                            required
                            type="email"
                            id="email"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            sx={{ backgroundColor: '#f5f5f5', borderRadius: '4px', padding: '10px', margin: '10px 0' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            inputProps={{ 'aria-label': 'Email Address' }}
                        />
                        <Box sx={{ position: 'relative', width: '100%' }}>
                            <InputBase
                                placeholder="Password"
                                fullWidth
                                required
                                name="password"
                                type={showPassword ? "text" : "password"}
                                id="password"
                                autoComplete="current-password"
                                sx={{ backgroundColor: '#f5f5f5', borderRadius: '4px', padding: '10px', margin: '10px 0', paddingRight: '40px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                                inputProps={{ 'aria-label': 'Password' }}
                            />
                            <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                sx={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </Box>
                        {error && <p className="error-message m-2">{error}</p>}
                        <input
                            type="submit"
                            value="Sign In"
                            className={`login-btn ${buttonClass}`}
                            style={{ width: '100%', backgroundColor: '#F4B400', color: 'white', fontWeight: 'bold', padding: '10px', border: 'none', cursor: 'pointer' }}
                        />
                    </form>
                </Box>
            </div>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
            />
        </div>
    );
};

export default Login;