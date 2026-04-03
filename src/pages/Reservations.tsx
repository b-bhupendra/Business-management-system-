import React, { useEffect, useState } from 'react';
import { format, addMonths } from 'date-fns';
import QRCode from 'react-qr-code';
import {
  Box, Typography, Button, TextField, Card, CardContent, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, MenuItem, Select, FormControl, InputLabel,
  IconButton, Tooltip, Stack, Avatar
} from '@mui/material';
import {
  Add as AddIcon, CheckCircle as CheckCircleIcon,
  NotificationsActive as NotifyIcon, QrCode as QrCodeIcon,
  EventSeat as EventSeatIcon, Person as PersonIcon
} from '@mui/icons-material';

interface User {
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

export function Reservations({ selectedOrg, user }: { selectedOrg?: string, user: User }) {
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
    <Box sx={{ pb: 6 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Reservations
        </Typography>
        {user.role !== 'staff' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAdd(true)}
          >
            New Reservation
          </Button>
        )}
      </Stack>

      <Dialog open={showAdd} onClose={() => setShowAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700, px: 3, pt: 3 }}>Assign Seat</DialogTitle>
        <form onSubmit={handleAdd}>
          <DialogContent sx={{ px: 3 }}>
            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Customer</InputLabel>
                  <Select
                    value={newReservation.customer_id}
                    label="Customer"
                    onChange={e => setNewReservation({ ...newReservation, customer_id: e.target.value })}
                  >
                    {customers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Subsection</InputLabel>
                  <Select
                    value={newReservation.subsection}
                    label="Subsection"
                    onChange={e => setNewReservation({ ...newReservation, subsection: e.target.value })}
                  >
                    <MenuItem value="Trisha">Trisha</MenuItem>
                    <MenuItem value="G2 Library">G2 Library</MenuItem>
                    <MenuItem value="Main Hall">Main Hall</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Seat Number"
                  required
                  value={newReservation.seat_number}
                  onChange={e => setNewReservation({ ...newReservation, seat_number: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  required
                  InputLabelProps={{ shrink: true }}
                  value={newReservation.start_date}
                  onChange={e => setNewReservation({ ...newReservation, start_date: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Months"
                  type="number"
                  required
                  inputProps={{ min: "1" }}
                  value={newReservation.duration_months}
                  onChange={e => setNewReservation({ ...newReservation, duration_months: Number(e.target.value) })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Amount ($)"
                  type="number"
                  required
                  inputProps={{ step: "0.01", min: "0" }}
                  value={newReservation.amount}
                  onChange={e => setNewReservation({ ...newReservation, amount: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Pay Via</InputLabel>
                  <Select
                    value={newReservation.pay_via}
                    label="Pay Via"
                    onChange={e => setNewReservation({ ...newReservation, pay_via: e.target.value })}
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
            <Button onClick={() => setShowAdd(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">Assign Seat</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={!!showQR} onClose={() => setShowQR(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pt: 4, fontWeight: 700 }}>Scan to Pay</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          {showQR && (
            <>
              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, mb: 3, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                <QRCode value={`upi://pay?pa=merchant@upi&pn=${encodeURIComponent(showQR.customer_name)}&am=${showQR.amount}&cu=USD`} size={200} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>${showQR.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>Seat: {showQR.subsection} - {showQR.seat_number}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ pb: 4, px: 4 }}>
          <Button onClick={() => setShowQR(null)} fullWidth variant="outlined" color="inherit">Close</Button>
        </DialogActions>
      </Dialog>

      <Card sx={{ border: 'none' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'background.neutral' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>IDENTIFIER</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>CUSTOMER</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>LOCATION</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>DURATION</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>AMOUNT</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>STATUS</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((res) => (
                <TableRow key={res.id} hover sx={{ borderBottomStyle: 'dashed' }}>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>#{res.id.toString().padStart(4, '0')}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'primary.soft', color: 'primary.main', width: 36, height: 36 }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{res.customer_name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{res.subsection}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                      <EventSeatIcon fontSize="inherit" sx={{ mr: 0.5 }} /> Seat {res.seat_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{format(new Date(res.start_date), 'MMM d, yy')} - {format(new Date(res.end_date), 'MMM d, yy')}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{res.duration_months} months</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      ${res.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>via {res.pay_via}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={res.status}
                      size="small"
                      color={getStatusColor(res.status) as any}
                      variant="filled"
                      sx={{
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        fontSize: '0.65rem',
                        bgcolor: res.status === 'paid' ? 'rgba(0, 171, 85, 0.16)' : 'rgba(255, 171, 0, 0.16)',
                        color: res.status === 'paid' ? 'success.dark' : 'warning.dark'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {res.status !== 'paid' && (
                        <>
                          <Tooltip title="Send Reminder">
                            <IconButton size="small" onClick={() => handleSendNotification(res)} sx={{ color: 'info.main' }}>
                              <NotifyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {res.pay_via === 'QR Platform' && (
                            <Tooltip title="Show QR">
                              <IconButton size="small" onClick={() => setShowQR(res)} sx={{ color: 'warning.main' }}>
                                <QrCodeIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleStatusChange(res.id, 'paid')}
                            sx={{ bgcolor: 'rgba(0, 171, 85, 0.16)', color: 'success.dark', '&:hover': { bgcolor: 'rgba(0, 171, 85, 0.24)' } }}
                          >
                            Paid
                          </Button>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {reservations.length === 0 && (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">No reservations active</Typography>
            <Typography variant="body2" color="text.disabled">Start by assigning a new seat to a customer.</Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
}
