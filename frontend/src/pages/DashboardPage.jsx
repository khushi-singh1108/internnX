import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Paper,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Work as WorkIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import './DashboardPage.css';

export default function DashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [userName, setUserName] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  // Profile menu handling
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const user = localStorage.getItem('loggedInUser');
    const storedUserName = localStorage.getItem('userName');

    if (isLoggedIn !== 'true' || !user) {
      navigate('/');
      return;
    }

    setUserName(storedUserName || user.split('@')[0]);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleFindInternships = () => {
    navigate('/internship-form');
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Navbar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          bgcolor: 'white', 
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              background: 'linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              fontSize: { xs: '1.3rem', sm: '1.6rem' },
              letterSpacing: '-0.02em'
            }}
          >
            InternnX
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            {!isMobile && (
              <Button
                color="inherit"
                sx={{ 
                  color: 'text.primary',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                  '&:hover': {
                    bgcolor: 'rgba(99, 102, 241, 0.08)',
                    color: 'primary.main'
                  }
                }}
                startIcon={<PersonIcon />}
                onClick={handleProfileClick}
              >
                Profile
              </Button>
            )}
            <Button
              color="inherit"
              sx={{ 
                color: 'text.primary',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                '&:hover': {
                  bgcolor: 'rgba(239, 68, 68, 0.08)',
                  color: 'error.main'
                }
              }}
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
            <IconButton onClick={handleMenuOpen}>
              <Avatar sx={{ bgcolor: '#6366F1' }}>
                {userName.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{ mt: 1 }}
          >
            {isMobile && (
              <MenuItem onClick={handleProfileClick}>
                <PersonIcon sx={{ mr: 1 }} /> Profile
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: { xs: 12, sm: 14 }, mb: 4, px: { xs: 2, sm: 3 } }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 6 } }}>
            <Typography 
              variant="h2" 
              sx={{ 
                mb: 2, 
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                background: 'linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em'
              }}
            >
              Dashboard Overview
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.1rem', sm: '1.3rem' },
                maxWidth: '600px',
                mx: 'auto',
                textAlign: 'left',
                ml: { xs: 2, sm: 4, md: 8 },
                color: '#000000'
              }}
            >
              Welcome back, {userName}! Here's your personalized dashboard.
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 3, sm: 4 }} alignItems="stretch" justifyContent="center">
            {/* Find New Internships Card */}
            <Grid item xs={12} md={6}>
              <Paper
                component={motion.div}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                elevation={0}
                sx={{
                  p: { xs: 4, sm: 5 },
                  height: { xs: '220px', sm: '260px' },
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  borderRadius: 5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 15px 35px rgba(102, 126, 234, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': { 
                    boxShadow: '0 25px 50px rgba(102, 126, 234, 0.5)',
                    transform: 'translateY(-5px)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255, 255, 255, 0.15)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                  '&:hover::before': {
                    opacity: 1,
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                  }
                }}
                onClick={handleFindInternships}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, zIndex: 1 }}>
                  <SearchIcon sx={{ fontSize: { xs: 40, sm: 52 }, mr: 2, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                  <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', sm: '1.6rem' }, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    Find New Internships
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, opacity: 0.95, zIndex: 1, lineHeight: 1.4 }}>
                  Discover new opportunities with our AI-powered matching system
                </Typography>
              </Paper>
            </Grid>

            {/* Applied Internships Card */}
            <Grid item xs={12} md={6}>
              <Paper
                component={motion.div}
                whileHover={{ scale: 1.05, y: -10 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                elevation={0}
                sx={{
                  p: { xs: 4, sm: 5 },
                  height: { xs: '220px', sm: '260px' },
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  borderRadius: 5,
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 15px 35px rgba(240, 147, 251, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': { 
                    boxShadow: '0 25px 50px rgba(240, 147, 251, 0.5)',
                    transform: 'translateY(-5px)'
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255, 255, 255, 0.15)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                  '&:hover::before': {
                    opacity: 1,
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 100,
                    height: 100,
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                  }
                }}
                onClick={() => navigate('/applied-internships')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, zIndex: 1 }}>
                  <AssignmentIcon sx={{ fontSize: { xs: 40, sm: 52 }, mr: 2, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                  <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', sm: '1.6rem' }, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    Applied Internships
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, opacity: 0.95, zIndex: 1, lineHeight: 1.4 }}>
                  Track your applications and interview status
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}
