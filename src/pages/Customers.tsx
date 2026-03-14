import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { 
  Box, Typography, Button, TextField, Card, CardContent, 
  List, ListItem, ListItemText, ListItemAvatar, Avatar, 
  Chip, InputAdornment, Dialog, DialogTitle, DialogContent, 
  DialogActions, Grid
} from '@mui/material';
import { 
  Add as AddIcon, Search as SearchIcon, Mail as MailIcon, 
  Phone as PhoneIcon, CalendarMonth as CalendarIcon, 
  Person as PersonIcon 
} from '@mui/icons-material';

export function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });

  const fetchCustomers = () => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => setCustomers(data));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer)
    });
    setNewCustomer({ name: '', email: '', phone: '' });
    setShowAdd(false);
    fetchCustomers();
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ spaceY: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Customers
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setShowAdd(true)}
          sx={{ borderRadius: 2 }}
        >
          New Customer
        </Button>
      </Box>

      <Dialog open={showAdd} onClose={() => setShowAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Customer</DialogTitle>
        <form onSubmit={handleAdd}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Name"
                  required
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  required
                  value={newCustomer.email}
                  onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.08)', bgcolor: 'rgba(0,0,0,0.01)' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
          />
        </Box>
        <List sx={{ p: 0 }}>
          {filtered.map((customer) => (
            <ListItem 
              key={customer.id} 
              divider 
              sx={{ 
                py: 2, 
                px: 3,
                '&:hover': { bgcolor: 'action.hover' },
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' }
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <Box sx={{ flexGrow: 1, minWidth: 0, mr: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {customer.name}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.5 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <MailIcon sx={{ fontSize: 16, mr: 0.5 }} /> {customer.email}
                  </Typography>
                  {customer.phone && (
                    <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon sx={{ fontSize: 16, mr: 0.5 }} /> {customer.phone}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, mt: { xs: 2, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}>
                <Chip 
                  label={customer.status} 
                  size="small" 
                  color={customer.status === 'active' ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ mb: 1, alignSelf: { xs: 'flex-start', sm: 'flex-end' } }}
                />
                <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon sx={{ fontSize: 14, mr: 0.5 }} /> 
                  First contact: {format(new Date(customer.first_contact), 'MMM d, yyyy')}
                </Typography>
              </Box>
            </ListItem>
          ))}
          {filtered.length === 0 && (
            <Box sx={{ p: 8, textCenter: 'center' }}>
              <Typography color="textSecondary" align="center">No customers found.</Typography>
            </Box>
          )}
        </List>
      </Card>
    </Box>
  );
}
