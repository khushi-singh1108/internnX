import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip
} from '@mui/material';

export default function AppliedInternships() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userEmail = localStorage.getItem('loggedInUser');
    if (!isLoggedIn || !userEmail) {
      navigate('/login');
      return;
    }

    // Expected structure in localStorage:
    // {
    //   [userEmail]: [ { id, title, company, dateApplied } ]
    // }
    const store = JSON.parse(localStorage.getItem('appliedInternships') || '{}');
    const list = Array.isArray(store[userEmail]) ? store[userEmail] : [];
    setItems(list);
  }, [navigate]);

  return (
    <Container component="main" maxWidth="lg">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Box sx={{ mt: 6, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Applied Internships
            </Typography>
            <Button variant="outlined" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </Box>

          {items.length === 0 ? (
            <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No internships applied yet</Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {items.map((item) => (
                <Grid item xs={12} md={6} key={item.id || `${item.title}-${item.company}`}>
                  <Paper component={motion.div} whileHover={{ scale: 1.01 }} elevation={2} sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {item.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 1 }}>
                      {item.company}
                    </Typography>
                    <Chip label={`Applied on ${new Date(item.dateApplied).toLocaleDateString()}`} size="small" />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </motion.div>
    </Container>
  );
}
