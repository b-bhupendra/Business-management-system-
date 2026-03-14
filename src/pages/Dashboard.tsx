import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Fade } from '@mui/material';
import { People, AttachMoney, Receipt, NotificationsActive } from '@mui/icons-material';

// WhatsApp-like doodle background pattern (subtle)
const waBackground = `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E")`;

export function Dashboard() {
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Artificial delay to show loading animation
    const timer = setTimeout(() => {
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => {
          setStats(data);
          setLoading(false);
        });
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
        <Typography variant="h6" color="textSecondary" sx={{ animation: 'pulse 1.5s infinite' }}>
          Loading Analytics...
        </Typography>
      </Box>
    );
  }

  const cards = [
    { name: 'Total Customers', value: stats.totalCustomers, icon: <People fontSize="large" />, color: '#1976d2', bg: '#e3f2fd' },
    { name: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: <AttachMoney fontSize="large" />, color: '#2e7d32', bg: '#e8f5e9' },
    { name: 'Pending Bills', value: stats.pendingBills, icon: <Receipt fontSize="large" />, color: '#ed6c02', bg: '#fff3e0' },
    { name: 'Notifications Sent', value: stats.totalNotifications, icon: <NotificationsActive fontSize="large" />, color: '#9c27b0', bg: '#f3e5f5' },
  ];

  return (
    <Fade in={!loading} timeout={800}>
      <Box sx={{ 
        p: { xs: 2, sm: 4 },
        minHeight: 'calc(100vh - 120px)',
      }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}>
          Analytics Dashboard
        </Typography>
        
        <Grid container spacing={3} mb={4}>
          {cards.map((card) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.name}>
              <Card sx={{ borderRadius: 3, transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Box sx={{ 
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : card.bg, 
                    color: darkMode ? 'primary.main' : card.color, 
                    p: 1.5, 
                    borderRadius: 2, 
                    display: 'flex', 
                    mr: 2 
                  }}>
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary" fontWeight="bold">
                      {card.name}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="textPrimary">
                      {card.value}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ borderRadius: 3, p: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
              Revenue Overview (Last 7 Days)
            </Typography>
            <Box sx={{ height: 350, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.1)' : '#e0e0e0'} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: darkMode ? 'rgba(255,255,255,0.5)' : '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: darkMode ? 'rgba(255,255,255,0.5)' : '#64748b', fontSize: 12 }}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                      color: darkMode ? '#ffffff' : '#0f172a'
                    }}
                    labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke={theme.palette.primary.main} strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
}

import { useTheme } from '@mui/material/styles';
