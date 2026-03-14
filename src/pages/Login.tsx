import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, 
  Button, InputAdornment, IconButton, Alert, Fade, Avatar 
} from '@mui/material';
import { 
  Visibility, VisibilityOff, Lock, Email, 
  BusinessCenter 
} from '@mui/icons-material';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('admin@bizmanage.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default credentials: admin@bizmanage.com / admin123
    if (email === 'admin@bizmanage.com' && password === 'admin123') {
      onLogin();
    } else {
      setError('Invalid email or password. Try admin@bizmanage.com / admin123');
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'transparent',
    }}>
      <Fade in timeout={1000}>
        <Card sx={{ 
          width: '100%', 
          maxWidth: 400, 
          borderRadius: 4, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          bgcolor: 'background.paper'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mx: 'auto', mb: 2 }}>
                <BusinessCenter fontSize="large" />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                BizManage
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Sign in to manage your business
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                sx={{ 
                  mt: 4, 
                  py: 1.5, 
                  borderRadius: 3, 
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1.1rem'
                }}
              >
                Sign In
              </Button>
            </form>

            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                Demo Credentials:
                <br />
                admin@bizmanage.com / admin123
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
}
