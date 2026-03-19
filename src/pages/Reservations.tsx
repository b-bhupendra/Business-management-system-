import React, { useEffect, useState } from 'react';
import { format, differenceInDays, addMonths } from 'date-fns';
import QRCode from 'react-qr-code';
import { 
  Box, Typography, Button, TextField, Card, CardContent, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, Grid, MenuItem, Select, FormControl, InputLabel,
  IconButton, Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, CheckCircle as CheckCircleIcon, 
  NotificationsActive as NotifyIcon, QrCode as QrCodeIcon,
  EventSeat as EventSeatIcon
} from '@mui/icons-material';

export function Reservations() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showQR, setShowQR] = useState<any>(null);
  const [newReservation, setNewReservation] = useState({ 
    customer_id: '', 
    subsection: 'Trisha', 
    seat_number: '', 
    start_date: format(new Date(), 'yyyy-MM-dd'), 
    duration_months: 1, 
    amount: '', 
    pay_via: 'Cash' 
  });

  const fetchData = () => {
    fetch('/api/reservations').then(res => res.json()).then(data => setReservations(data));
    fetch('/api/customers').then(res => res.json()).then(data => setCustomers(data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const endDate = format(addMonths(new Date(newReservation.start_date), Number(newReservation.duration_months)), 'yyyy-MM-dd');
    
    await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newReservation,
        amount: parseFloat(newReservation.amount),
        end_date: endDate
      })
    });
    setNewReservation({ customer_id: '', subsection: 'Trisha', seat_number: '', start_date: format(new Date(), 'yyyy-MM-dd'), duration_months: 1, amount: '', pay_via: 'Cash' });
    setShowAdd(false);
    fetchData();
  };

  const handleStatusChange = async (id: number, status: string) => {
    await fetch(`/api/reservations/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  const handleSendNotification = async (res: any) => {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        customer_id: res.customer_id, 
        message: `Payment Reminder: $${res.amount} for Seat ${res.seat_number} in ${res.subsection} (Valid till ${format(new Date(res.end_date), 'MMM d, yyyy')}).` 
      })
    });
    alert('Notification sent!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ spaceY: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Seat Reservations
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setShowAdd(true)}
          sx={{ borderRadius: 2 }}
        >
          New Reservation
        </Button>
      </Box>

      <Dialog open={showAdd} onClose={() => setShowAdd(false)} fullWidth maxWidth="md">
        <DialogTitle>Assign New Seat</DialogTitle>
        <form onSubmit={handleAdd}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Customer</InputLabel>
                  <Select
                    value={newReservation.customer_id}
                    label="Customer"
                    onChange={e => setNewReservation({...newReservation, customer_id: e.target.value})}
                  >
                    {customers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Subsection</InputLabel>
                  <Select
                    value={newReservation.subsection}
                    label="Subsection"
                    onChange={e => setNewReservation({...newReservation, subsection: e.target.value})}
                  >
                    <MenuItem value="Trisha">Trisha</MenuItem>
                    <MenuItem value="G2 Library">G2 Library</MenuItem>
                    <MenuItem value="Main Hall">Main Hall</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Seat Number"
                  required
                  value={newReservation.seat_number}
                  onChange={e => setNewReservation({...newReservation, seat_number: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  required
                  InputLabelProps={{ shrink: true }}
                  value={newReservation.start_date}
                  onChange={e => setNewReservation({...newReservation, start_date: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Duration (Months)"
                  type="number"
                  required
                  inputProps={{ min: "1" }}
                  value={newReservation.duration_months}
                  onChange={e => setNewReservation({...newReservation, duration_months: Number(e.target.value)})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount ($)"
                  type="number"
                  required
                  inputProps={{ step: "0.01", min: "0" }}
                  value={newReservation.amount}
                  onChange={e => setNewReservation({...newReservation, amount: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Pay Via</InputLabel>
                  <Select
                    value={newReservation.pay_via}
                    label="Pay Via"
                    onChange={e => setNewReservation({...newReservation, pay_via: e.target.value})}
                  >
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="QR Platform">QR Platform</MenuItem>
                    <MenuItem value="Credit Card">Credit Card</MenuItem>
                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Assign Seat</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={!!showQR} onClose={() => setShowQR(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>Scan to Pay</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          {showQR && (
            <>
              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, mb: 2 }}>
                <QRCode value={`upi://pay?pa=merchant@upi&pn=${encodeURIComponent(showQR.customer_name)}&am=${showQR.amount}&cu=USD`} size={200} />
              </Box>
              <Typography variant="h6" fontWeight="bold">${showQR.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
              <Typography color="textSecondary">Seat: {showQR.subsection} - {showQR.seat_number}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQR(null)} fullWidth>Close</Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Seat</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Pay Via</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map((res) => (
              <TableRow key={res.id} hover>
                <TableCell sx={{ fontWeight: 'medium' }}>{res.customer_name}</TableCell>
                <TableCell>{res.subsection}</TableCell>
                <TableCell>
                  <Chip icon={<EventSeatIcon fontSize="small" />} label={res.seat_number} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{format(new Date(res.start_date), 'MMM d, yy')} - {format(new Date(res.end_date), 'MMM d, yy')}</Typography>
                  <Typography variant="caption" color="textSecondary">({res.duration_months} months)</Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  ${res.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>{res.pay_via}</TableCell>
                <TableCell>
                  <Chip 
                    label={res.status.charAt(0).toUpperCase() + res.status.slice(1)} 
                    size="small"
                    icon={res.status === 'paid' ? <CheckCircleIcon /> : undefined}
                    color={getStatusColor(res.status) as any}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    {res.status !== 'paid' && (
                      <>
                        <Tooltip title="Send Notification">
                          <IconButton size="small" color="primary" onClick={() => handleSendNotification(res)}>
                            <NotifyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {res.pay_via === 'QR Platform' && (
                          <Tooltip title="Show QR Code">
                            <IconButton size="small" color="secondary" onClick={() => setShowQR(res)}>
                              <QrCodeIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => handleStatusChange(res.id, 'paid')}
                          sx={{ textTransform: 'none' }}
                        >
                          Mark Paid
                        </Button>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {reservations.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Typography color="textSecondary">No reservations found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
