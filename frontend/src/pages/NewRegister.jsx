import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Container, Box, Typography, TextField, Button, Paper, Alert, Grid, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function NewRegister() {
  const [formData, setFormData] = useState({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [banner, setBanner] = useState({ message: '', success: false });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.values(formData).some((v) => !v.trim())) return setBanner({ message: 'All fields are required.', success: false });
    if (formData.password !== formData.confirmPassword) return setBanner({ message: 'Passwords do not match.', success: false });
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return setBanner({ message: 'Please enter a valid email.', success: false });
    if (!/^\d{10}$/.test(formData.phoneNumber)) return setBanner({ message: 'Phone must be 10 digits.', success: false });

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[formData.email]) return setBanner({ message: 'User with this email already exists.', success: false });

    users[formData.email] = { fullName: formData.fullName, phoneNumber: formData.phoneNumber, password: formData.password, createdAt: new Date().toISOString() };
    localStorage.setItem('users', JSON.stringify(users));
    setBanner({ message: 'Registration successful! Redirecting…', success: true });
    setTimeout(() => navigate('/login'), 1000);
  };

  return (
    <Container component="main" maxWidth="sm">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper elevation={2} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
            <Typography variant="h4" sx={{ mb: 1, textAlign: 'center', fontWeight: 600 }}>InternnX</Typography>
            <Typography variant="h6" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>Create Your Account</Typography>

            {banner.message && (
              <Alert severity={banner.success ? 'success' : 'error'} sx={{ mb: 3 }} variant="filled">{banner.message}</Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField required fullWidth label="Full Name" name="fullName" autoComplete="name" autoFocus value={formData.fullName} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField required fullWidth label="Email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField required fullWidth label="Phone Number" name="phoneNumber" autoComplete="tel" value={formData.phoneNumber} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((s) => !s)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword((s) => !s)}>{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }}>Create Account</Button>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account? <Link to="/login" style={{ textDecoration: 'none' }}>Sign in</Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
}
