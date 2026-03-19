/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './lib/Layout';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Billing } from './pages/Billing';
import { Notifications } from './pages/Notifications';
import { Login } from './pages/Login';
import { LandingPage } from './pages/LandingPage';
import { Reservations } from './pages/Reservations';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: darkMode ? '#00f2fe' : '#4facfe' }, // Vibrant cyan/blue
      secondary: { main: darkMode ? '#a18cd1' : '#fbc2eb' }, // Purple tones
      background: { 
        default: darkMode ? '#0b0f19' : '#f4f7f6', // Deep dark / soft grey
        paper: darkMode ? '#13192b' : '#ffffff' // Darker paper / White
      },
    },
    typography: {
      fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
      h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 800 },
      h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
      h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
      h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
      h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
      h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
      button: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
    },
    shape: { borderRadius: 16 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            backdropFilter: 'blur(10px)',
            background: darkMode ? 'rgba(19, 25, 43, 0.7)' : 'rgba(255, 255, 255, 0.8)',
            boxShadow: darkMode ? '0 8px 32px 0 rgba(0, 0, 0, 0.3)' : '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 255, 255, 0.5)',
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            padding: '10px 24px',
            transition: 'all 0.3s ease-in-out',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: darkMode ? '0 0 15px rgba(0,242,254,0.4)' : '0 10px 20px rgba(79,172,254,0.2)',
              transform: 'translateY(-2px)'
            }
          }
        }
      }
    }
  }), [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className={darkMode ? 'dark' : ''}>
        <div className="animated-doodle" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app/*" element={
              !isAuthenticated ? (
                <Login onLogin={() => setIsAuthenticated(true)} />
              ) : (
                <Layout 
                  currentTab={currentTab} 
                  setCurrentTab={setCurrentTab}
                  onLogout={() => setIsAuthenticated(false)}
                  darkMode={darkMode}
                  onToggleDarkMode={toggleDarkMode}
                >
                  {currentTab === 'dashboard' && <Dashboard />}
                  {currentTab === 'reservations' && <Reservations />}
                  {currentTab === 'customers' && <Customers />}
                  {currentTab === 'billing' && <Billing />}
                  {currentTab === 'notifications' && <Notifications />}
                </Layout>
              )
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </Box>
    </ThemeProvider>
  );
}
