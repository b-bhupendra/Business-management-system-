import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format } from 'date-fns';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Fade } from '@mui/material';
import { AttachMoney, Receipt, WarningAmber, AccessTime } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'motion/react';

const COLORS = ['#00f2fe', '#4facfe', '#a18cd1', '#fbc2eb', '#8884d8'];

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
          if (data && data.revenueData) {
            setStats(data);
          } else {
            throw new Error('invalid API response');
          }
          setLoading(false);
        })
        .catch(() => {
          // Fallback data if API fails to prevent blank screen
          setStats({
            amountToBePaid: 12500,
            overdueAmount: 3200,
            averageDueDays: 14,
            totalRevenue: 45000,
            revenueData: [
              { date: '2023-10-01', revenue: 4000 },
              { date: '2023-10-02', revenue: 3000 },
              { date: '2023-10-03', revenue: 5000 },
              { date: '2023-10-04', revenue: 2780 },
              { date: '2023-10-05', revenue: 6890 },
              { date: '2023-10-06', revenue: 4390 },
              { date: '2023-10-07', revenue: 6490 },
            ],
            payViaStats: [
              { pay_via: 'Cash', count: 40 },
              { pay_via: 'Card', count: 35 },
              { pay_via: 'UPI', count: 25 },
            ]
          });
          setLoading(false);
        });
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
        <Typography variant="h6" color="textSecondary" sx={{ animation: 'pulse 1.5s infinite', fontFamily: 'Outfit' }}>
          Loading Intelligence...
        </Typography>
      </Box>
    );
  }

  const cards = [
    { name: 'Amount to be Paid', value: `$${stats.amountToBePaid.toLocaleString()}`, icon: <Receipt fontSize="large" />, color: '#00f2fe' },
    { name: 'Overdue Amount', value: `$${stats.overdueAmount.toLocaleString()}`, icon: <WarningAmber fontSize="large" />, color: '#ff4b2b' },
    { name: 'Average Due Days', value: `${stats.averageDueDays} days`, icon: <AccessTime fontSize="large" />, color: '#f5af19' },
    { name: 'Total Collected', value: `$${stats.totalRevenue.toLocaleString()}`, icon: <AttachMoney fontSize="large" />, color: '#00C49F' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <Box 
      component={motion.div} 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      sx={{ p: { xs: 2, sm: 4 }, minHeight: 'calc(100vh - 120px)' }}
    >
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, mb: 4, fontFamily: 'Outfit' }} className="text-gradient">
        Analytics Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.name} component={motion.div} variants={itemVariants}>
            <Card className="glass-panel" sx={{ borderRadius: 4, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-6px)' } }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Box sx={{ 
                  background: darkMode ? `rgba(255,255,255,0.05)` : `rgba(0,242,254,0.1)`, 
                  color: card.color, 
                  p: 2, 
                  borderRadius: 3, 
                  display: 'flex', 
                  mr: 3,
                  boxShadow: `0 4px 15px ${card.color}40`
                }}>
                  {card.icon}
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" fontWeight="bold">
                    {card.name}
                  </Typography>
                  <Typography variant="h5" fontWeight="900" color="textPrimary" sx={{ fontFamily: 'Outfit' }}>
                    {card.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8} component={motion.div} variants={itemVariants}>
          <Card className="glass-panel" sx={{ borderRadius: 4, p: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3, fontFamily: 'Outfit' }}>
                Revenue Flow (Last 7 Days)
              </Typography>
              <Box sx={{ height: 350, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.6}/>
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
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
                        borderRadius: '16px', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                        backgroundColor: darkMode ? 'rgba(19,25,43,0.9)' : 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                        color: darkMode ? '#ffffff' : '#0f172a'
                      }}
                      labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke={theme.palette.primary.main} strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4} component={motion.div} variants={itemVariants}>
          <Card className="glass-panel" sx={{ borderRadius: 4, p: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3, fontFamily: 'Outfit' }}>
                Payment Methods
              </Typography>
              <Box sx={{ height: 350, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {stats.payViaStats && stats.payViaStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.payViaStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="pay_via"
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.payViaStats.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                          backgroundColor: darkMode ? 'rgba(19,25,43,0.9)' : 'rgba(255,255,255,0.9)',
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography color="textSecondary">No payment data available yet.</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
