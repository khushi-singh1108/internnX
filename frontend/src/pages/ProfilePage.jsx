import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Container,
  Box,
  Paper,
  Grid,
  Avatar,
  IconButton,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Camera as CameraIcon,
  Save as SaveIcon,
  ArrowBack as BackIcon,
  AccountCircle as ProfileIcon
} from '@mui/icons-material';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    profileImage: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userEmail = localStorage.getItem('loggedInUser');

    if (!isLoggedIn || !userEmail) {
      navigate('/login');
      return;
    }

    // Fetch user details from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userData = users[userEmail];

    if (userData) {
      setUserDetails({
        fullName: userData.fullName,
        email: userEmail,
        phoneNumber: userData.phoneNumber,
        profileImage: userData.profileImage || ''
      });
    }
  }, [navigate]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(userDetails.phoneNumber)) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid 10-digit phone number',
        severity: 'error'
      });
      return;
    }

    // Save updated details to localStorage
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userData = users[userDetails.email];

    if (userData) {
      users[userDetails.email] = {
        ...userData,
        fullName: userDetails.fullName,
        phoneNumber: userDetails.phoneNumber,
        profileImage: userDetails.profileImage || ''
      };
      localStorage.setItem('users', JSON.stringify(users));
      
      setIsEditing(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUserDetails(prev => ({ ...prev, profileImage: reader.result }));
      setIsEditing(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 6 }}>
      <Container component="main" maxWidth="xl">
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%', fontWeight: 700 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Captivating Header Section */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h2" 
              sx={{ 
                mb: 2, 
                fontWeight: 900,
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em'
              }}
            >
              Your Digital Identity
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#1f2937',
                fontWeight: 700,
                fontSize: { xs: '1.2rem', sm: '1.4rem' },
                maxWidth: '700px',
                mx: 'auto',
                lineHeight: 1.4
              }}
            >
              Manage your personal information and showcase your professional profile with style
            </Typography>
            <Box sx={{ 
              width: 80, 
              height: 4, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              mx: 'auto', 
              mt: 3, 
              borderRadius: 2 
            }} />
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'flex-start', 
            gap: { xs: 4, sm: 6 }, 
            flexWrap: { xs: 'wrap', lg: 'nowrap' },
            maxWidth: '1100px',
            mx: 'auto',
            px: 2
          }}>
            {/* Profile Avatar Section - LEFT SIDE */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 6,
                  overflow: 'hidden',
                  position: 'relative',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  width: { xs: 300, sm: 320 },
                  height: 450,
                  boxShadow: '0 25px 50px rgba(102, 126, 234, 0.4)',
                  border: 'none',
                  flexShrink: 0
                }}
              >
                {/* Edit Button */}
                <IconButton
                  onClick={handleEdit}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    width: 40,
                    height: 40,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                      transform: 'rotate(90deg)'
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.5)'
                    }
                  }}
                  disabled={isEditing}
                >
                  <EditIcon sx={{ fontSize: 20 }} />
                </IconButton>

                <CardContent sx={{ 
                  p: 4, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  textAlign: 'center'
                }}>
                  <Avatar
                    src={userDetails.profileImage || undefined}
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      mb: 3,
                      border: '4px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    {!userDetails.profileImage && userDetails.fullName ? userDetails.fullName.charAt(0).toUpperCase() : <ProfileIcon sx={{ fontSize: 50 }} />}
                  </Avatar>
                  
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 900, 
                      mb: 2,
                      fontSize: '1.5rem'
                    }}
                  >
                    {userDetails.fullName || 'khushi'}
                  </Typography>
                  
                  <Chip 
                    label="● Active User" 
                    sx={{ 
                      bgcolor: 'rgba(16, 185, 129, 0.3)', 
                      color: '#10B981',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      mb: 3,
                      border: '1px solid rgba(16, 185, 129, 0.4)'
                    }} 
                  />
                  
                  <Button 
                    variant="contained" 
                    component="label" 
                    startIcon={<CameraIcon />}
                    sx={{ 
                      fontWeight: 700, 
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      py: 1.5,
                      px: 3,
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: 3,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.3)'
                      }
                    }}
                  >
                    📸 Upload Photo
                    <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile Details Section - RIGHT SIDE */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 6,
                  overflow: 'hidden',
                  width: { xs: 300, sm: 650 },
                  height: 450,
                  bgcolor: 'white',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #e5e7eb',
                  flexShrink: 0
                }}
              >
                {/* Header */}
                <Box sx={{ 
                  background: '#000000', 
                  color: 'white', 
                  p: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  borderTopLeftRadius: 6,
                  borderTopRightRadius: 6
                }}>
                  <PersonIcon sx={{ fontSize: 24, mr: 1.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '1.1rem' }}>
                    Profile Details
                  </Typography>
                </Box>

                <CardContent sx={{ p: 4 }}>
                  <Grid container spacing={3}>
                    {/* Full Name Field */}
                    <Grid item xs={12}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 900,
                          color: '#6366F1',
                          fontSize: '0.95rem',
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <PersonIcon sx={{ mr: 1, fontSize: 18 }} />
                        Full Name
                      </Typography>
                      <TextField
                        fullWidth
                        name="fullName"
                        value={userDetails.fullName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="khushi"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: '#000000',
                            height: '50px',
                            bgcolor: isEditing ? 'white' : '#f9fafb',
                            border: '2px solid transparent',
                            '&:hover fieldset': { 
                              borderColor: isEditing ? '#6366F1' : '#d1d5db',
                              borderWidth: '2px'
                            },
                            '&.Mui-focused fieldset': { 
                              borderColor: '#6366F1',
                              borderWidth: '2px',
                              boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
                            },
                            '& fieldset': {
                              borderColor: '#d1d5db',
                              borderWidth: '2px'
                            }
                          },
                          '& input': { 
                            fontWeight: 700,
                            color: '#000000',
                            fontSize: '1rem',
                            padding: '14px 16px'
                          }
                        }}
                      />
                    </Grid>

                    {/* Email and Phone Row */}
                    <Grid item xs={6}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 900,
                          color: '#6366F1',
                          fontSize: '0.95rem',
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <EmailIcon sx={{ mr: 1, fontSize: 18 }} />
                        Email Address
                      </Typography>
                      <TextField
                        fullWidth
                        name="email"
                        value={userDetails.email}
                        disabled
                        placeholder="khushi11@gmail.com"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            fontSize: '1rem',
                            fontWeight: 600,
                            bgcolor: '#f9fafb',
                            height: '50px',
                            '& fieldset': { 
                              borderColor: '#d1d5db',
                              borderWidth: '2px'
                            }
                          },
                          '& input': { 
                            fontWeight: 700,
                            color: '#000000',
                            fontSize: '1rem',
                            padding: '14px 16px'
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 900,
                          color: '#6366F1',
                          fontSize: '0.95rem',
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <PhoneIcon sx={{ mr: 1, fontSize: 18 }} />
                        Phone Number
                      </Typography>
                      <TextField
                        fullWidth
                        name="phoneNumber"
                        value={userDetails.phoneNumber}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="3847378765"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: '#000000',
                            height: '50px',
                            bgcolor: isEditing ? 'white' : '#f9fafb',
                            border: '2px solid transparent',
                            '&:hover fieldset': { 
                              borderColor: isEditing ? '#6366F1' : '#d1d5db',
                              borderWidth: '2px'
                            },
                            '&.Mui-focused fieldset': { 
                              borderColor: '#6366F1',
                              borderWidth: '2px',
                              boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
                            },
                            '& fieldset': {
                              borderColor: '#d1d5db',
                              borderWidth: '2px'
                            }
                          },
                          '& input': { 
                            fontWeight: 700,
                            color: '#000000',
                            fontSize: '1rem',
                            padding: '14px 16px'
                          }
                        }}
                      />
                    </Grid>

                    {/* Action Buttons */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        {isEditing && (
                          <Button
                            variant="contained"
                            onClick={handleSave}
                            startIcon={<SaveIcon />}
                            sx={{ 
                              fontWeight: 700, 
                              py: 2, 
                              px: 5,
                              fontSize: '1rem',
                              textTransform: 'none',
                              borderRadius: 4,
                              mr: 2,
                              minHeight: '48px',
                              background: 'linear-gradient(45deg, #10B981 30%, #059669 90%)',
                              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #059669 30%, #047857 90%)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)'
                              }
                            }}
                          >
                            💾 Save Changes
                          </Button>
                        )}
                        
                        <Button
                          variant="outlined"
                          onClick={() => navigate('/dashboard')}
                          startIcon={<BackIcon />}
                          sx={{ 
                            fontWeight: 700, 
                            py: 2, 
                            px: 5,
                            fontSize: '1rem',
                            textTransform: 'none',
                            borderRadius: 4,
                            color: '#000000',
                            borderColor: '#000000',
                            borderWidth: 2,
                            minHeight: '48px',
                            '&:hover': {
                              borderColor: '#6366F1',
                              color: '#6366F1',
                              borderWidth: 2,
                              bgcolor: 'rgba(99, 102, 241, 0.05)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                            }
                          }}
                        >
                          🏠 Back to Dashboard
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}