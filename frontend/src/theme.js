import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#475569', // Soft slate
      light: '#64748B',
      dark: '#334155',
    },
    secondary: {
      main: '#059669', // Subtle green
      light: '#10B981',
      dark: '#047857',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.15 },
    h2: { fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2 },
    h3: { fontSize: '1.875rem', fontWeight: 800, lineHeight: 1.3 },
    h4: { fontSize: '1.5rem', fontWeight: 800 },
    h5: { fontSize: '1.25rem', fontWeight: 700 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            fontWeight: 700,
          },
          '& .MuiInputLabel-root': { fontWeight: 700 },
        },
      },
    },
    MuiTypography: {
      defaultProps: { variantMapping: { h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5' } },
    },
  },
});

export default theme;