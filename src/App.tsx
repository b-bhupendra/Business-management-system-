/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Layout } from './lib/Layout';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Billing } from './pages/Billing';
import { Notifications } from './pages/Notifications';

const theme = createTheme({
  palette: {
    primary: { main: '#075e54' }, // WhatsApp dark green
    secondary: { main: '#128c7e' }, // WhatsApp light green
    background: { default: '#f0f2f5' },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  }
});

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout currentTab={currentTab} setCurrentTab={setCurrentTab}>
        {currentTab === 'dashboard' && <Dashboard />}
        {currentTab === 'customers' && <Customers />}
        {currentTab === 'billing' && <Billing />}
        {currentTab === 'notifications' && <Notifications />}
      </Layout>
    </ThemeProvider>
  );
}
