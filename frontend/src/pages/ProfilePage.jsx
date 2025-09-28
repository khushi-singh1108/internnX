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
  Select
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

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
    <Container component="main" maxWidth="sm">
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            marginTop: 8,
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
              backgroundColor: 'background.paper',
              position: 'relative'
            }}
          >
            <IconButton
              onClick={handleEdit}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
              disabled={isEditing}
            >
              <EditIcon />
            </IconButton>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Avatar
                src={userDetails.profileImage || undefined}
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                  mb: 1
                }}
              >
                {!userDetails.profileImage && userDetails.fullName ? userDetails.fullName.charAt(0).toUpperCase() : ''}
              </Avatar>
              <Button size="small" variant="outlined" component="label">
                Upload Photo
                <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
              </Button>
              <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>
                Profile Details
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={userDetails.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  value={userDetails.email}
                  disabled
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={userDetails.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </Grid>

              {isEditing && (
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSave}
                    sx={{ mt: 2 }}
                  >
                    Save Changes
                  </Button>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/dashboard')}
                  sx={{ mt: isEditing ? 1 : 3 }}
                >
                  Back to Dashboard
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
}