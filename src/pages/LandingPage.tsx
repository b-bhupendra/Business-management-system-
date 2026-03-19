import React from 'react';
import { Box, Typography, Button, Container, Grid, useTheme } from '@mui/material';
import { EventSeat, Payment, NotificationsActive, QrCode } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export function LandingPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', overflow: 'hidden', position: 'relative' }}>
      {/* Background glowing orbs */}
      <Box sx={{
        position: 'absolute', top: '-10%', left: '-10%', width: {xs: '80vw', md: '40vw'}, height: {xs: '80vw', md: '40vw'},
        background: 'radial-gradient(circle, rgba(0,242,254,0.15) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%', zIndex: 0, filter: 'blur(60px)',
      }} className="animate-float" />
      <Box sx={{
        position: 'absolute', bottom: '-10%', right: '-10%', width: {xs: '80vw', md: '40vw'}, height: {xs: '80vw', md: '40vw'},
        background: 'radial-gradient(circle, rgba(161,140,209,0.15) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%', zIndex: 0, filter: 'blur(60px)', animationDelay: '2s'
      }} className="animate-float" />

      {/* Hero Section */}
      <Box sx={{ position: 'relative', zIndex: 1, pt: { xs: 15, md: 25 }, pb: 10, textAlign: 'center' }}>
        <Container maxWidth="md" component={motion.div} initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div variants={itemVariants}>
            <Typography variant="h1" gutterBottom sx={{ fontWeight: 800, fontSize: { xs: '3rem', md: '5rem' }, lineHeight: 1.1 }}>
              Welcome to <br />
              <span className="text-gradient">Lumina Pro</span>
            </Typography>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 6, maxWidth: '80%', mx: 'auto', lineHeight: 1.6 }}>
              The most elegant and powerful seat reservation and payment tracking system. Seamless management, breathtaking design.
            </Typography>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/app')}
              className="animate-pulse-glow"
              sx={{ 
                px: 6, py: 2, fontSize: '1.2rem', 
                borderRadius: '50px',
                background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                color: '#fff'
              }}
            >
              Enter Dashboard
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 15, position: 'relative', zIndex: 1 }} component={motion.div} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 800, mb: 10 }}>
            <span className="text-gradient">Premium Features</span>
          </Typography>
        </motion.div>
        <Grid container spacing={4}>
          {[
            { icon: <EventSeat sx={{ fontSize: 48 }} />, title: "Smart Seating", desc: "Intelligent assignments for monthly or flexible durations." },
            { icon: <Payment sx={{ fontSize: 48 }} />, title: "Fluid Payments", desc: "Seamless integrated tracking for all your transactions." },
            { icon: <NotificationsActive sx={{ fontSize: 48 }} />, title: "Smart Alerts", desc: "Automated reminders that keep your revenue flowing." },
            { icon: <QrCode sx={{ fontSize: 48 }} />, title: "Instant QR", desc: "Generate dynamic QR codes for lightning-fast payments." }
          ].map((feature, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <motion.div variants={itemVariants} whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }} style={{ height: '100%' }}>
                <Box className="glass-panel" sx={{ p: 4, height: '100%', borderRadius: 4, textAlign: 'center', transition: 'all 0.3s' }}>
                  <Box sx={{ 
                    display: 'inline-flex', p: 2, borderRadius: '24px', mb: 3,
                    background: theme.palette.mode === 'dark' ? 'rgba(0,242,254,0.1)' : 'rgba(0,242,254,0.15)',
                    color: '#00f2fe'
                  }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ fontFamily: 'Outfit' }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ lineHeight: 1.7 }}>
                    {feature.desc}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
