import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { 
  Box, Typography, Button, TextField, Card, CardContent, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, Grid, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { 
  Add as AddIcon, CheckCircle as CheckCircleIcon, 
  AccessTime as ClockIcon, CalendarMonth as CalendarIcon 
} from '@mui/icons-material';

export function Billing() {
  const [bills, setBills] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newBill, setNewBill] = useState({ customer_id: '', amount: '', due_date: '' });

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
    setNewBill({ customer_id: '', amount: '', due_date: '' });
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

      {/* Desktop Table View */}
      <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' }, borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Invoice ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id} hover>
                <TableCell sx={{ fontWeight: 'medium' }}>
                  INV-{bill.id.toString().padStart(4, '0')}
                </TableCell>
                <TableCell>{bill.customer_name}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  ${bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={bill.status.charAt(0).toUpperCase() + bill.status.slice(1)} 
                    size="small"
                    icon={bill.status === 'paid' ? <CheckCircleIcon /> : undefined}
                    color={bill.status === 'paid' ? 'success' : bill.status === 'overdue' ? 'error' : 'warning'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                    {format(new Date(bill.due_date), 'MMM d, yyyy')}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  {bill.status !== 'paid' && (
                    <Button 
                      size="small" 
                      onClick={() => handleStatusChange(bill.id, 'paid')}
                      sx={{ textTransform: 'none' }}
                    >
                      Mark as Paid
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {bills.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <Typography color="textSecondary">No bills generated yet.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mobile Card View */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
        {bills.map((bill) => (
          <Card key={bill.id} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                    INV-{bill.id.toString().padStart(4, '0')}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {bill.customer_name}
                  </Typography>
                </Box>
                <Chip 
                  label={bill.status.charAt(0).toUpperCase() + bill.status.slice(1)} 
                  size="small"
                  color={bill.status === 'paid' ? 'success' : bill.status === 'overdue' ? 'error' : 'warning'}
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    ${bill.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <CalendarIcon sx={{ fontSize: 14, mr: 0.5 }} />
                    Due: {format(new Date(bill.due_date), 'MMM d, yyyy')}
                  </Typography>
                </Box>
                {bill.status !== 'paid' && (
                  <Button 
                    variant="outlined"
                    size="small" 
                    onClick={() => handleStatusChange(bill.id, 'paid')}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Mark as Paid
                  </Button>
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
