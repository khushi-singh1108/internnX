import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Autocomplete,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  IconButton
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  School as EducationIcon,
  Work as WorkIcon,
  Favorite as InterestIcon,
  AttachMoney as StipendIcon,
  Search as FindIcon,
  Description as ResumeIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const skillsList = [
  'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Angular',
  'Vue.js', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git',
  'Machine Learning', 'Data Analysis', 'UI/UX Design', 'DevOps',
  'Cybersecurity', 'Cloud Computing'
];

const roleTypes = [
  'Software Development',
  'Data Science',
  'UI/UX Design',
  'Product Management',
  'DevOps',
  'Cloud Architecture',
  'Cybersecurity',
  'Business Analysis',
  'Digital Marketing'
];

const locations = [
  'Remote', 'New York', 'San Francisco', 'London', 'Berlin',
  'Tokyo', 'Singapore', 'Sydney', 'Toronto', 'Mumbai'
];

export default function InternshipForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roleType: '',
    preferredLocations: [],
    skills: [],
    workExperience: '',
    education: '',
    interests: '',
    expectedStipend: '',
    proficiencyLevel: 3,
    resumeBase64: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) navigate('/login');
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (event, newValue) => setFormData((p) => ({ ...p, skills: newValue }));
  const handleLocationsChange = (event, newValue) => setFormData((p) => ({ ...p, preferredLocations: newValue }));
  const handleProficiencyChange = (event, newValue) => setFormData((p) => ({ ...p, proficiencyLevel: newValue }));

  const handleResumeUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFormData((p) => ({ ...p, resumeBase64: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (formData.skills.length === 0) {
      setError('Please select at least one sector interest');
      setIsSubmitting(false);
      return;
    }

    try {
      await new Promise((r) => setTimeout(r, 1200));
      const userEmail = localStorage.getItem('loggedInUser');
      const internshipData = JSON.parse(localStorage.getItem('internshipData') || '{}');
      internshipData[userEmail] = { ...formData, submittedAt: new Date().toISOString() };
      localStorage.setItem('internshipData', JSON.stringify(internshipData));
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f2f5', py: 4 }}>
      <Container component="main" maxWidth="md">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Main Card Container */}
          <Card 
            elevation={8}
            sx={{ 
              borderRadius: 4,
              overflow: 'hidden',
              bgcolor: 'white',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Header Section */}
            <Box sx={{ 
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              color: 'white',
              p: 4,
              textAlign: 'center',
              position: 'relative'
            }}>
              {/* HOME Button */}
              <Button
                onClick={() => navigate('/dashboard')}
                startIcon={<HomeIcon />}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  textTransform: 'none',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
                  }
                }}
              >
                HOME
              </Button>

              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 900,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  letterSpacing: '-0.02em',
                  mb: 1
                }}
              >
                Let's Find Your Match
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '1rem', sm: '1.2rem' },
                  opacity: 0.9
                }}
              >
                AI-POWERED INTERNSHIP PLATFORM
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ m: 3 }}>Form submitted successfully! Redirecting…</Alert>}

            {/* Upload Resume Section - Full Width Stretched */}
            <Box sx={{ px: 0, py: 2, bgcolor: '#f8fafc' }}>
              <Box sx={{ px: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 800,
                    fontSize: '1.3rem',
                    color: '#1a1a1a',
                    mb: 2
                  }}
                >
                  Upload Resume (PDF, DOC, DOCX, TXT)
                </Typography>
              </Box>
              
              <Card 
                elevation={0}
                sx={{ 
                  border: formData.resumeBase64 ? '3px solid #4CAF50' : '3px dashed #6366F1',
                  borderRadius: 0,
                  bgcolor: formData.resumeBase64 ? 'rgba(76, 175, 80, 0.05)' : 'rgba(99, 102, 241, 0.05)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  width: '100%',
                  minHeight: '140px',
                  mx: 0,
                  '&:hover': {
                    borderColor: formData.resumeBase64 ? '#45a049' : '#4F46E5',
                    bgcolor: formData.resumeBase64 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.2)'
                  }
                }}
              >
                <CardContent sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '120px'
                }}>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={formData.resumeBase64 ? <ResumeIcon sx={{ fontSize: 32 }} /> : <UploadIcon sx={{ fontSize: 32 }} />}
                    sx={{
                      py: 3,
                      px: 10,
                      fontSize: '1.4rem',
                      fontWeight: 900,
                      borderRadius: 3,
                      background: formData.resumeBase64 
                        ? 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)'
                        : 'linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)',
                      boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
                      textTransform: 'none',
                      minWidth: '400px',
                      maxWidth: '100%',
                      '&:hover': {
                        background: formData.resumeBase64
                          ? 'linear-gradient(45deg, #45a049 30%, #388e3c 90%)'
                          : 'linear-gradient(45deg, #5B5FE8 30%, #7C3AED 90%)',
                        boxShadow: '0 12px 30px rgba(99, 102, 241, 0.5)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    {formData.resumeBase64 ? '✓ Resume Uploaded Successfully!' : '📄 Upload Resume'}
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx,.txt" 
                      hidden 
                      onChange={handleResumeUpload} 
                    />
                  </Button>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mt: 2, 
                      color: 'text.secondary', 
                      fontWeight: 700,
                      fontSize: '1.2rem'
                    }}
                  >
                    {formData.resumeBase64 
                      ? 'Your resume has been uploaded and processed!' 
                      : 'Upload your resume to get personalized matches'
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={4}>

                  {/* Location Preferences */}
                  <Grid item xs={12}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 800,
                        fontSize: '1.3rem',
                        color: '#1a1a1a',
                        mb: 2
                      }}
                    >
                      Location Preferences
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="e.g., New Delhi, Remote"
                      value={formData.preferredLocations.join(', ')}
                      onChange={(e) => {
                        const locations = e.target.value.split(',').map(loc => loc.trim()).filter(loc => loc);
                        setFormData(prev => ({ ...prev, preferredLocations: locations }));
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          fontSize: '1.2rem',
                          fontWeight: 600,
                          '&:hover fieldset': { borderColor: 'primary.main', borderWidth: 2 },
                          '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 }
                        }
                      }}
                    />
                  </Grid>

                  {/* Sector Interests */}
                  <Grid item xs={12}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 800,
                        fontSize: '1.3rem',
                        color: '#1a1a1a',
                        mb: 3
                      }}
                    >
                      Sector Interests
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {[
                        { name: 'Technology', color: '#2196F3' },
                        { name: 'E-commerce', color: '#FF9800' },
                        { name: 'Analytics', color: '#9C27B0' },
                        { name: 'Marketing', color: '#F44336' },
                        { name: 'Design', color: '#4CAF50' },
                        { name: 'Finance', color: '#607D8B' }
                      ].map((sector) => (
                        <Grid item xs={6} sm={4} md={6} key={sector.name}>
                          <Card
                            elevation={formData.skills.includes(sector.name) ? 4 : 1}
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              border: formData.skills.includes(sector.name) 
                                ? `3px solid ${sector.color}` 
                                : '2px solid #e0e0e0',
                              bgcolor: formData.skills.includes(sector.name) 
                                ? `${sector.color}15` 
                                : 'white',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: `0 8px 25px ${sector.color}40`,
                                border: `3px solid ${sector.color}`
                              }
                            }}
                            onClick={() => {
                              const newSkills = formData.skills.includes(sector.name)
                                ? formData.skills.filter(s => s !== sector.name)
                                : [...formData.skills, sector.name];
                              setFormData(prev => ({ ...prev, skills: newSkills }));
                            }}
                          >
                            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontWeight: 800,
                                  fontSize: '1.2rem',
                                  color: formData.skills.includes(sector.name) ? sector.color : '#666'
                                }}
                              >
                                {formData.skills.includes(sector.name) ? '✓ ' : ''}{sector.name}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  {/* Find Matches Button */}
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={28} color="inherit" /> : <FindIcon sx={{ fontSize: 28 }} />}
                        sx={{
                          py: 4,
                          px: 8,
                          fontSize: '1.5rem',
                          fontWeight: 900,
                          borderRadius: 4,
                          background: 'linear-gradient(45deg, #6366F1 30%, #8B5CF6 90%)',
                          boxShadow: '0 15px 40px rgba(99, 102, 241, 0.4)',
                          textTransform: 'none',
                          minWidth: '320px',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #5B5FE8 30%, #7C3AED 90%)',
                            boxShadow: '0 20px 50px rgba(99, 102, 241, 0.6)',
                            transform: 'translateY(-3px)'
                          },
                          '&:disabled': {
                            background: 'linear-gradient(45deg, #9CA3AF 30%, #6B7280 90%)'
                          }
                        }}
                      >
                        {isSubmitting ? 'FINDING YOUR MATCHES...' : 'FIND MY MATCHES'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          {/* Bottom Message */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 600,
                fontSize: '1.1rem'
              }}
            >
              No matching internships found. Try different preferences.
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}