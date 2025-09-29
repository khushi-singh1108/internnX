import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  IconButton,
  InputAdornment,
  Grid,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Login as LoginIcon,
  PersonAdd as RegisterIcon 
} from '@mui/icons-material';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  // Check if user is already logged in
  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setErrorMessage('');
    setIsSuccess(false);
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const user = users[loginData.email];

    if (user && user.password === loginData.password) {
      setErrorMessage('Login successful!');
      setIsSuccess(true);

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loggedInUser', loginData.email);
      localStorage.setItem('userName', user.fullName || loginData.email.split('@')[0]);

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setErrorMessage('Invalid email or password.');
      setIsSuccess(false);
      setLoginData({ ...loginData, password: '' });
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (Object.values(registerData).some((v) => !v.trim())) {
      return setErrorMessage('All fields are required.');
    }
    if (registerData.password !== registerData.confirmPassword) {
      return setErrorMessage('Passwords do not match.');
    }
    if (!/^\S+@\S+\.\S+$/.test(registerData.email)) {
      return setErrorMessage('Please enter a valid email.');
    }
    if (!/^\d{10}$/.test(registerData.phoneNumber)) {
      return setErrorMessage('Phone must be 10 digits.');
    }
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[registerData.email]) {
      return setErrorMessage('User with this email already exists.');
    }

    // Store user data with all fields
    const fullName = `${registerData.firstName} ${registerData.lastName}`;
    users[registerData.email] = {
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      fullName,
      phoneNumber: registerData.phoneNumber,
      password: registerData.password,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loggedInUser', registerData.email);
    localStorage.setItem('userName', fullName);

    setErrorMessage('Registration successful! Redirecting to dashboard...');
    setIsSuccess(true);
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Container component="main" maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Paper 
            elevation={8} 
            sx={{ 
              p: { xs: 3, sm: 5 }, 
              width: '100%', 
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography 
                component="h1" 
                variant="h3" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em'
                }}
              >
                InternnX
              </Typography>
              <Typography 
                component="h2" 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }}
              >
                Your Gateway to Internships
              </Typography>
            </Box>

            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              centered
              sx={{ 
                mb: 4,
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)'
                },
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  textTransform: 'none',
                  minWidth: { xs: 100, sm: 120 },
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 700
                  }
                }
              }}
            >
              <Tab label="Login" />
              <Tab label="Register" />
            </Tabs>

            {errorMessage && (
              <Alert 
                severity={isSuccess ? "success" : "error"} 
                sx={{ mb: 3 }}
                variant="filled"
              >
                {errorMessage}
              </Alert>
            )}

            <AnimatePresence mode="wait">
              {activeTab === 0 ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box 
                    component="form" 
                    onSubmit={handleLoginSubmit} 
                    sx={{ mt: 1 }}
                  >
                    <TextField
                      required
                      fullWidth
                      id="login-email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={loginData.email}
                      onChange={handleLoginChange}
                      sx={{ 
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          fontWeight: 500,
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiInputLabel-root': {
                          fontWeight: 600,
                        }
                      }}
                    />

                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      autoComplete="current-password"
                      value={loginData.password}
                      onChange={handleLoginChange}
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
                        mt: 3,
                        mb: 3,
                        py: 1.8,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        borderRadius: 3,
                        background: 'linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)',
                        boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                        textTransform: 'none',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5B5FE8 30%, #7C3AED 90%)',
                          boxShadow: '0 12px 25px rgba(99, 102, 241, 0.4)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Sign In
                    </Button>
                  </Box>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box 
                    component="form" 
                    onSubmit={handleRegisterSubmit} 
                    sx={{ mt: 1 }}
                  >
                    <Grid container spacing={2}>
                      {/* First Row: First Name + Last Name */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="First Name"
                          name="firstName"
                          autoComplete="given-name"
                          autoFocus
                          value={registerData.firstName || ''}
                          onChange={handleRegisterChange}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              fontWeight: 500,
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: 2,
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 600,
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="Last Name"
                          name="lastName"
                          autoComplete="family-name"
                          value={registerData.lastName || ''}
                          onChange={handleRegisterChange}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              fontWeight: 500,
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: 2,
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 600,
                            }
                          }}
                        />
                      </Grid>

                      {/* Second Row: Phone Number + Email */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="Phone Number"
                          name="phoneNumber"
                          autoComplete="tel"
                          value={registerData.phoneNumber}
                          onChange={handleRegisterChange}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              fontWeight: 500,
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: 2,
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 600,
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="Email"
                          name="email"
                          autoComplete="email"
                          value={registerData.email}
                          onChange={handleRegisterChange}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              fontWeight: 500,
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: 2,
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 600,
                            }
                          }}
                        />
                      </Grid>

                      {/* Third Row: Password + Confirm Password */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="Password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              fontWeight: 500,
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: 2,
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 600,
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton 
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="Confirm Password"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={registerData.confirmPassword}
                          onChange={handleRegisterChange}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              fontWeight: 500,
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                                borderWidth: 2,
                              },
                            },
                            '& .MuiInputLabel-root': {
                              fontWeight: 600,
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton 
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      startIcon={<RegisterIcon />}
                      sx={{ 
                        mt: 3,
                        mb: 2,
                        py: 1.8,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        borderRadius: 3,
                        background: 'linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)',
                        boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)',
                        textTransform: 'none',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5B5FE8 30%, #7C3AED 90%)',
                          boxShadow: '0 12px 25px rgba(99, 102, 241, 0.4)',
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Create Account
                    </Button>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}
