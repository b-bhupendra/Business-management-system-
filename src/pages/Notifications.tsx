import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { 
  Box, Typography, Button, TextField, Card, 
  List, ListItem, ListItemText, ListItemAvatar, Avatar, 
  Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, Grid, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { 
  Send as SendIcon, NotificationsActive as BellIcon, 
  CheckCircle as CheckCircleIcon 
} from '@mui/icons-material';

export function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newNotification, setNewNotification] = useState({ customer_id: '', message: '' });

  const fetchData = () => {
    fetch('/api/notifications').then(res => res.json()).then(data => setNotifications(data));
    fetch('/api/customers').then(res => res.json()).then(data => setCustomers(data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotification)
    });
    setNewNotification({ customer_id: '', message: '' });
    setShowAdd(false);
    fetchData();
  };

  return (
    <Box sx={{ spaceY: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Notifications
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<SendIcon />}
          onClick={() => setShowAdd(true)}
          sx={{ borderRadius: 2 }}
        >
          Send Notification
        </Button>
      </Box>

      <Dialog open={showAdd} onClose={() => setShowAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>Compose Notification</DialogTitle>
        <form onSubmit={handleSend}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required>
                  <InputLabel>Recipient</InputLabel>
                  <Select
                    value={newNotification.customer_id}
                    label="Recipient"
                    onChange={e => setNewNotification({...newNotification, customer_id: e.target.value})}
                  >
                    {customers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={4}
                  required
                  value={newNotification.message}
                  onChange={e => setNewNotification({...newNotification, message: e.target.value})}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Send</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.08)', bgcolor: 'action.hover' }}>
          <Typography variant="subtitle2" color="textSecondary">Recent Notifications</Typography>
        </Box>
        <List sx={{ p: 0 }}>
          {notifications.map((notif) => (
            <ListItem 
              key={notif.id} 
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
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', opacity: 0.8 }}>
                  <BellIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary={
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    To: {notif.customer_name}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="textPrimary" sx={{ mt: 0.5 }}>
                    {notif.message}
                  </Typography>
                }
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, mt: { xs: 2, sm: 0 }, width: { xs: '100%', sm: 'auto' } }}>
                <Chip 
                  label="Sent" 
                  size="small" 
                  color="success" 
                  icon={<CheckCircleIcon />}
                  variant="outlined"
                  sx={{ mb: 1, alignSelf: { xs: 'flex-start', sm: 'flex-end' } }}
                />
                <Typography variant="caption" color="textSecondary">
                  {format(new Date(notif.sent_at), 'MMM d, yyyy h:mm a')}
                </Typography>
              </Box>
            </ListItem>
          ))}
          {notifications.length === 0 && (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <Typography color="textSecondary">No notifications sent yet.</Typography>
            </Box>
          )}
        </List>
      </Card>
    </Box>
  );
}
