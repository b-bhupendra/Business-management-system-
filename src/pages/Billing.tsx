import React, { useEffect, useState } from 'react';
import { format, differenceInDays } from 'date-fns';
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
  CalendarMonth as CalendarIcon, NotificationsActive as NotifyIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';

export function Billing() {
  const [bills, setBills] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showQR, setShowQR] = useState<any>(null);
  const [newBill, setNewBill] = useState({ customer_id: '', amount: '', due_date: '', month_ending: '', pay_via: '' });

  const fetchData = () => {
    fetch('/api/bills').then(res => res.json()).then(data => setBills(data));
    fetch('/api/customers').then(res => res.json()).then(data => setCustomers(data));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newBill,
        amount: parseFloat(newBill.amount)
      })
    });
    setNewBill({ customer_id: '', amount: '', due_date: '', month_ending: '', pay_via: '' });
    setShowAdd(false);
    fetchData();
  };

  const handleStatusChange = async (id: number, status: string) => {
    await fetch(`/api/bills/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  const handleSendNotification = async (bill: any) => {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        customer_id: bill.customer_id, 
        message: `Reminder: Payment of $${bill.amount} for month ending ${bill.month_ending} is due on ${bill.due_date}.` 
      })
    });
    alert('Notification sent!');
  };

  const getDueDays = (dueDate: string, status: string) => {
    if (status === 'paid') return '-';
    const days = differenceInDays(new Date(dueDate), new Date());
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    return `In ${days} days`;
  };

  return (
    <Box sx={{ spaceY: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Billing & Invoices
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setShowAdd(true)}
          sx={{ borderRadius: 2 }}
        >
          Generate Bill
        </Button>
      </Box>

      <Dialog open={showAdd} onClose={() => setShowAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>Generate New Bill</DialogTitle>
        <form onSubmit={handleAdd}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required>
                  <InputLabel>Customer</InputLabel>
                  <Select
                    value={newBill.customer_id}
                    label="Customer"
                    onChange={e => setNewBill({...newBill, customer_id: e.target.value})}
                  >
                    {customers.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Amount ($)"
                  type="number"
                  required
                  inputProps={{ step: "0.01", min: "0" }}
                  value={newBill.amount}
                  onChange={e => setNewBill({...newBill, amount: e.target.value})}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Pay Via</InputLabel>
                  <Select
                    value={newBill.pay_via}
                    label="Pay Via"
                    onChange={e => setNewBill({...newBill, pay_via: e.target.value})}
                  >
                    <MenuItem value="Credit Card">Credit Card</MenuItem>
                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Month Ending"
                  type="date"
                  required
                  InputLabelProps={{ shrink: true }}
                  value={newBill.month_ending}
                  onChange={e => setNewBill({...newBill, month_ending: e.target.value})}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  required
                  InputLabelProps={{ shrink: true }}
                  value={newBill.due_date}
                  onChange={e => setNewBill({...newBill, due_date: e.target.value})}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Generate</Button>
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
              <Typography color="textSecondary">Invoice: INV-{showQR.id.toString().padStart(4, '0')}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQR(null)} fullWidth>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Desktop Table View */}
      <TableContainer component={Paper} sx={{ display: { xs: 'none', lg: 'block' }, borderRadius: 3, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Number</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Month Ending</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Pay Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Due For Days</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Pay Via</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id} hover>
                <TableCell sx={{ fontWeight: 'medium' }}>{bill.customer_name}</TableCell>
                <TableCell>{bill.customer_phone}</TableCell>
                <TableCell>{bill.month_ending ? format(new Date(bill.month_ending), 'MMM yyyy') : '-'}</TableCell>
                <TableCell>{bill.pay_date ? format(new Date(bill.pay_date), 'MMM d, yyyy') : '-'}</TableCell>
                <TableCell>
                  <Typography color={bill.status === 'overdue' ? 'error.main' : 'text.secondary'} variant="body2">
                    {getDueDays(bill.due_date, bill.status)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  ${bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>{bill.pay_via}</TableCell>
                <TableCell>
                  <Chip 
                    label={bill.status.charAt(0).toUpperCase() + bill.status.slice(1)} 
                    size="small"
                    icon={bill.status === 'paid' ? <CheckCircleIcon /> : undefined}
                    color={bill.status === 'paid' ? 'success' : bill.status === 'overdue' ? 'error' : 'warning'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    {bill.status !== 'paid' && (
                      <>
                        <Tooltip title="Send Notification">
                          <IconButton size="small" color="primary" onClick={() => handleSendNotification(bill)}>
                            <NotifyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Show QR Code">
                          <IconButton size="small" color="secondary" onClick={() => setShowQR(bill)}>
                            <QrCodeIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => handleStatusChange(bill.id, 'paid')}
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
            {bills.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                  <Typography color="textSecondary">No bills generated yet.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mobile Card View */}
      <Box sx={{ display: { xs: 'flex', lg: 'none' }, flexDirection: 'column', gap: 2 }}>
        {bills.map((bill) => (
          <Card key={bill.id} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {bill.customer_name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {bill.customer_phone}
                  </Typography>
                </Box>
                <Chip 
                  label={bill.status.charAt(0).toUpperCase() + bill.status.slice(1)} 
                  size="small"
                  color={bill.status === 'paid' ? 'success' : bill.status === 'overdue' ? 'error' : 'warning'}
                />
              </Box>
              
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="textSecondary">Month Ending</Typography>
                  <Typography variant="body2">{bill.month_ending ? format(new Date(bill.month_ending), 'MMM yyyy') : '-'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="textSecondary">Pay Via</Typography>
                  <Typography variant="body2">{bill.pay_via}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="textSecondary">Due Days</Typography>
                  <Typography variant="body2" color={bill.status === 'overdue' ? 'error.main' : 'text.primary'}>
                    {getDueDays(bill.due_date, bill.status)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="textSecondary">Amount</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ${bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                {bill.status !== 'paid' && (
                  <>
                    <IconButton size="small" color="primary" onClick={() => handleSendNotification(bill)}>
                      <NotifyIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="secondary" onClick={() => setShowQR(bill)}>
                      <QrCodeIcon fontSize="small" />
                    </IconButton>
                    <Button 
                      variant="outlined"
                      size="small" 
                      onClick={() => handleStatusChange(bill.id, 'paid')}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Mark Paid
                    </Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
        {bills.length === 0 && (
          <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
            No bills generated yet.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
