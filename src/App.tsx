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
      primary: { main: darkMode ? '#60a5fa' : '#2563eb' }, // Blue tones
      secondary: { main: '#64748b' }, // Slate
      background: { 
        default: darkMode ? '#0f172a' : '#f8fafc', // Slate 900 / Slate 50
        paper: darkMode ? '#1e293b' : '#ffffff' // Slate 800 / White
      },
    },
    typography: {
      fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
      h1: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
      h2: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
      h3: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
      h4: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
      h5: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
      h6: { fontFamily: '"Playfair Display", serif', fontWeight: 600 },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.03)',
            border: darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
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
