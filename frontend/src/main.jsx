import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import LoginPage from './pages/LoginPage.jsx';
import NewRegister from './pages/NewRegister.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import InternshipFormLite from './pages/InternshipFormLite.jsx';
import AppliedInternships from './pages/AppliedInternships.jsx';
import './index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <NewRegister />,
  },
  {
    path: '/register',
    element: <NewRegister />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    path: '/internship-form',
    element: <InternshipFormLite />,
  },
  {
    path: '/applied-internships',
    element: <AppliedInternships />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
);