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
  Rating,
  Alert,
  CircularProgress
} from '@mui/material';

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

export default function InternshipFormLite() {
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

    if (!formData.roleType || formData.skills.length === 0 || !formData.education) {
      setError('Please fill in all required fields');
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
    <Container component="main" maxWidth="md">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Box sx={{ mt: 4, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Paper elevation={2} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
            <Typography component="h1" variant="h4" sx={{ mb: 1, textAlign: 'center', fontWeight: 600 }}>
              Find Your Perfect Match
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
              Tell us about your preferences and skills to get matched with the best internship opportunities
            </Typography>

            {error && (<Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>)}
            {success && (<Alert severity="success" sx={{ mb: 3 }}>Form submitted successfully! Redirecting…</Alert>)}

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
                    <InputLabel>Sector of Interest</InputLabel>
                    <Select name="roleType" value={formData.roleType} onChange={handleChange} label="Sector of Interest">
                      {roleTypes.map((role) => (
                        <MenuItem key={role} value={role}>{role}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete multiple value={formData.skills} onChange={handleSkillsChange} options={skillsList}
                    renderInput={(params) => (<TextField {...params} label="Skills" required />)}
                    renderTags={(value, getTagProps) => value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Typography component="legend">Proficiency Level</Typography>
                    <Rating name="proficiencyLevel" value={formData.proficiencyLevel} onChange={handleProficiencyChange} max={5} size="large" />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Autocomplete multiple value={formData.preferredLocations} onChange={handleLocationsChange} options={locations}
                    renderInput={(params) => (<TextField {...params} label="Preferred Locations" />)}
                    renderTags={(value, getTagProps) => value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField fullWidth label="Education" name="education" value={formData.education} onChange={handleChange} required multiline rows={2} placeholder="e.g., Bachelor's in Computer Science, 3rd year" />
                </Grid>

                <Grid item xs={12}>
                  <TextField fullWidth label="Work Experience" name="workExperience" value={formData.workExperience} onChange={handleChange} multiline rows={3} placeholder="Tell us about your previous internships, projects, or relevant experience" />
                </Grid>

                <Grid item xs={12}>
                  <TextField fullWidth label="Interests & Goals" name="interests" value={formData.interests} onChange={handleChange} multiline rows={2} placeholder="What are you passionate about? What do you want to learn from this internship?" />
                </Grid>

                <Grid item xs={12}>
                  <TextField fullWidth label="Expected Monthly Stipend (USD)" name="expectedStipend" type="number" value={formData.expectedStipend} onChange={handleChange} placeholder="e.g., 1000" />
                </Grid>

                <Grid item xs={12}>
                  <Button type="submit" fullWidth variant="contained" disabled={isSubmitting} sx={{ mt: 2, py: 1.5 }}>
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Find Matches'}
                  </Button>
                </Grid>

                <Grid item xs={12}>
                  <Button fullWidth variant="outlined" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
}
