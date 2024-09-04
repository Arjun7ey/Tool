import React, { useState } from 'react';
import { Typography, Box, InputBase, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import '../Components/Styles/LoginStyle.css'; // Ensure styles are still imported
import ey from '../assets/images/logo/ey.png';
import loginobject from '../assets/images/logo/loginobject.svg';
import axiosInstance from '../Components/utils/axiosInstance';
import { useAuth } from '../Components/utils/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [buttonClass, setButtonClass] = useState('');
    const [error, setError] = useState('');
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const { fetchUserData } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
    
        // Check if email or password are empty
        if (email === '' || password === '') {
            setError('Please, Enter your email and password');
            return; // Exit the function if validation fails
        }
    
        setError('');
        setButtonClass('button-animation');
    
        try {
            const loginData = { email, password };
            const response = await axiosInstance.post('/api/login/', loginData);
    
            if (response.status === 200) {
                const { access, refresh } = response.data;  
                
                localStorage.setItem('access_token', access);
                localStorage.setItem('refresh_token', refresh);
    
                // Fetch user data and navigate to dashboard
                await fetchUserData();
                navigate('/images');
            } else {
                setError('Invalid credentials');
            }
        } catch (error) {
            setError('Error during login: Invalid credentials');
            console.error('Error during login:', error);
        } finally {
            // Ensure button animation is removed regardless of success or failure
            setButtonClass('');
        }
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
                        <div className="login-wrapper">
                            {/* Additional content */}
                        </div>
                    </form>
                </Box>
            </div>
        </div>
    );
};

export default Login;
