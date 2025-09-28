import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import './LoginPage.css';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // For hackathon: A simple way to manage users. In a real app, this would be a backend call.
  const USERS = JSON.parse(localStorage.getItem('users')) || { 'user@example.com': 'password123' };

  // Check if user is already logged in
  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const user = USERS[username];
    if (user && user.password === password) {
      setErrorMessage('Login successful!');
      setIsSuccess(true);

      // Store login state and user data
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loggedInUser', username);
      localStorage.setItem('userName', username.split('@')[0]);

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } else {
      setErrorMessage('Invalid username or password.');
      setIsSuccess(false);
      setPassword(''); // Clear password field on failed login
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            marginTop: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper 
            elevation={2} 
            sx={{ 
              p: 4, 
              width: '100%', 
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Typography 
              component="h1" 
              variant="h4" 
              sx={{ 
                mb: 1, 
                textAlign: 'center', 
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              InternnX
            </Typography>
            <Typography 
              component="h2" 
              variant="h6" 
              sx={{ 
                mb: 4, 
                textAlign: 'center', 
                color: 'text.secondary',
                fontWeight: 400 
              }}
            >
              Welcome Back
            </Typography>

            {errorMessage && (
              <Alert 
                severity={isSuccess ? "success" : "error"} 
                sx={{ mb: 3 }}
                variant="filled"
              >
                {errorMessage}
              </Alert>
            )}

            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              sx={{ mt: 1 }}
              className="form-container"
            >
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 3 }}
              />

              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 4 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                startIcon={<LoginIcon />}
                sx={{ 
                  mt: 2,
                  mb: 3,
                  py: 1.5
                }}
              >
                Sign In
              </Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link to="/register" style={{ textDecoration: 'none' }}>
                    Create Account
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
}
