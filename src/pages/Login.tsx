import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, TextField, 
  Button, InputAdornment, IconButton, Alert, Avatar 
} from '@mui/material';
import { 
  Visibility, VisibilityOff, Lock, Email, 
  BusinessCenter 
} from '@mui/icons-material';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('admin@luminapro.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@luminapro.com' && password === 'admin123') {
      onLogin();
    } else {
      setError('Invalid email or password. Try admin@luminapro.com / admin123');
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: 'background.default',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background orbs */}
      <Box sx={{
        position: 'absolute', top: '10%', right: '10%', width: {xs: '60vw', md: '30vw'}, height: {xs: '60vw', md: '30vw'},
        background: 'radial-gradient(circle, rgba(0,242,254,0.15) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%', zIndex: 0, filter: 'blur(60px)',
      }} className="animate-float" />
      <Box sx={{
        position: 'absolute', bottom: '10%', left: '10%', width: {xs: '60vw', md: '30vw'}, height: {xs: '60vw', md: '30vw'},
        background: 'radial-gradient(circle, rgba(161,140,209,0.15) 0%, rgba(0,0,0,0) 70%)',
        borderRadius: '50%', zIndex: 0, filter: 'blur(60px)', animationDelay: '2s'
      }} className="animate-float" />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        style={{ width: '100%', maxWidth: 420, zIndex: 1, padding: '0 20px' }}
      >
        <Card className="glass-panel" sx={{ 
          width: '100%', 
          borderRadius: 4, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          bgcolor: 'background.paper',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar sx={{ 
                background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', 
                width: 64, height: 64, mx: 'auto', mb: 2,
                boxShadow: '0 4px 20px rgba(0,242,254,0.4)'
              }}>
                <BusinessCenter fontSize="large" sx={{ color: '#fff' }} />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit' }} className="text-gradient">
                Lumina Pro
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Sign in to your premium workspace
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
                className="animate-pulse-glow"
                sx={{ 
                  mt: 4, 
                  py: 1.5, 
                  borderRadius: 3, 
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                  color: '#fff',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  }
                }}
              >
                Sign In
              </Button>
            </form>

            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">
                Demo Credentials:
                <br />
                admin@luminapro.com / admin123
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}
