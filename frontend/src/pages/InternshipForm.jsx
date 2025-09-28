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
  InputLabel,
  Select,
  Chip,
  Autocomplete,
  Rating,
  Alert,
  CircularProgress
} from '@mui/material';

const skillsList = [
  'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Angular',
  'Vue.js', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git',
  'Machine Learning', 'Data Analysis', 'UI/UX Design', 'DevOps',
{{ ... }}
  'Sydney',
  'Toronto',
  'Mumbai'
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
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, resumeBase64: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSkillsChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      skills: newValue
{{ ... }}
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
              backgroundColor: 'background.paper'
            }}
          >
            <Typography
              component="h1"
              variant="h4"
              sx={{
                mb: 1,
                textAlign: 'center',
                fontWeight: 600
              }}
            >
              Find Your Perfect Match
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 4,
                textAlign: 'center',
{{ ... }}
              <Alert severity="success" sx={{ mb: 3 }}>
                Form submitted successfully! Redirecting to dashboard...
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Button variant="outlined" component="label">
                    {formData.resumeBase64 ? 'Resume Uploaded' : 'Upload Resume'}
                    <input type="file" accept=".pdf,.doc,.docx" hidden onChange={handleResumeUpload} />
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Sector ofInterest</InputLabel>
                    <Select
                      name="roleType"
                      value={formData.roleType}
                      onChange={handleChange}
                      label="Sector ofInterest"
                    >
                      {roleTypes.map(role => (
                        <MenuItem key={role} value={role}>
                          {role}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/dashboard')}
                    sx={{
                      borderColor: '#6366F1',
                      color: '#6366F1',
                      '&:hover': {
                        borderColor: '#4F46E5',
                        color: '#4F46E5',
                      },
                    }}
                  >
                    Back to Dashboard
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
}