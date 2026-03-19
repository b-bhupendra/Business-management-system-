import React from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, useTheme } from '@mui/material';
import { EventSeat, Payment, NotificationsActive, QrCode } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Hero Section */}
      <Box sx={{ 
        pt: 15, 
        pb: 10, 
        textAlign: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`
      }}>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            CoExisting Space
            <br />
            Seat Reservation System
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 4 }}>
            Effortlessly manage and track seat assignments across various subsections like Trisha and G2 Library. Flexible monthly or n-month reservations.
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => navigate('/app')}
            sx={{ px: 4, py: 1.5, fontSize: '1.1rem', borderRadius: 2 }}
          >
            Go to Dashboard
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 6 }}>
          Key Features
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <EventSeat color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Seat Assignment
                </Typography>
                <Typography color="text.secondary">
                  Assign seats to individuals for specific durations (monthly or n-months) in designated subsections.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Payment color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Flexible Payments
                </Typography>
                <Typography color="text.secondary">
                  Accept payments via cash or integrated QR code platforms for seamless transactions.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <NotificationsActive color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Payment Notifications
                </Typography>
                <Typography color="text.secondary">
                  Built-in automated notifications to remind users of upcoming or overdue payments.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <QrCode color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  QR Integration
                </Typography>
                <Typography color="text.secondary">
                  Generate unique QR codes for quick and easy payment processing on the spot.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
