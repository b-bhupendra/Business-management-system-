import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './lib/Layout';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Billing } from './pages/Billing';
import { Notifications } from './pages/Notifications';
import { Login } from './pages/Login';
import { LandingPage } from './pages/LandingPage';
import { Reservations } from './pages/Reservations';
import Roles from './pages/Roles';

interface User {
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [selectedOrg, setSelectedOrg] = useState('All Organizations');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogin = (u: User) => {
    setUser(u);
    if (u.role === 'staff' && currentTab === 'dashboard') {
      setCurrentTab('customers');
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />} />
          <Route path="/app/*" element={
            !user ? (
              <Login onLogin={handleLogin} darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
            ) : (
              <Layout 
                user={user}
                currentTab={currentTab} 
                setCurrentTab={setCurrentTab}
                onLogout={() => setUser(null)}
                darkMode={darkMode}
                onToggleDarkMode={toggleDarkMode}
                selectedOrg={selectedOrg}
                setSelectedOrg={setSelectedOrg}
              >
                {currentTab === 'dashboard' && <Dashboard user={user} selectedOrg={selectedOrg} />}
                {currentTab === 'reservations' && <Reservations user={user} selectedOrg={selectedOrg} />}
                {currentTab === 'customers' && <Customers user={user} selectedOrg={selectedOrg} />}
                {currentTab === 'billing' && <Billing user={user} selectedOrg={selectedOrg} />}
                {currentTab === 'roles' && <Roles />}
                {currentTab === 'notifications' && <Notifications user={user} selectedOrg={selectedOrg} />}
              </Layout>
            )
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
