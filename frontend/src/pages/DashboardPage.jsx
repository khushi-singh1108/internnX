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
      navigate('/login');
      return;
    }

    setUserName(storedUserName || user.split('@')[0]);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleFindInternships = () => {
    navigate('/internship-form');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navbar */}
      <AppBar position="fixed" sx={{ bgcolor: 'white', boxShadow: 1 }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              color: '#6366F1',
              fontWeight: 600,
              fontSize: '1.5rem'
            }}
          >
            InternnX
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              color="inherit"
              sx={{ color: 'text.primary' }}
              startIcon={<WorkIcon />}
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
            {!isMobile && (
              <Button
                color="inherit"
                sx={{ color: 'text.primary' }}
                startIcon={<PersonIcon />}
                onClick={handleProfileClick}
              >
                Profile
              </Button>
            )}
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
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
            Welcome back, {userName}!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Here's your personalized dashboard
          </Typography>

          <Grid container spacing={3}>
            {/* Find New Internships Card */}
            <Grid item xs={12} md={6}>
              <Paper
                component={motion.div}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                elevation={2}
                sx={{
                  p: 4,
                  height: '200px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '&:hover': { boxShadow: 4 }
                }}
                onClick={handleFindInternships}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SearchIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h6">Find New Internships</Typography>
                </Box>
                <Typography color="text.secondary">
                  Discover new opportunities with our AI-powered matching system
                </Typography>
              </Paper>
            </Grid>

            {/* Applied Internships Card */}
            <Grid item xs={12} md={6}>
              <Paper
                component={motion.div}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                elevation={2}
                sx={{
                  p: 4,
                  height: '200px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  '&:hover': { boxShadow: 4 }
                }}
                onClick={() => navigate('/applied-internships')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h6">Applied Internships</Typography>
                </Box>
                <Typography color="text.secondary">
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
