import React, { useEffect, useState } from 'react';
import { format, addMonths } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Plus, Bell, QrCode, Armchair, User as UserIcon, Calendar as CalendarIcon, CheckCircle2, MoreVertical, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const reservationSchema = z.object({
  customer_id: z.string().min(1, { message: "Please select a customer." }),
  subsection: z.string().min(1, { message: "Please select a subsection." }),
  seat_number: z.string().min(1, { message: "Seat number is required." }),
  start_date: z.date({ required_error: "Start date is required." }),
  duration_months: z.coerce.number().min(1, { message: "Duration must be at least 1 month." }),
  amount: z.coerce.number().min(0, { message: "Amount must be a positive number." }),
  pay_via: z.string().min(1, { message: "Please select a payment method." }),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

interface Reservation {
  id: number;
  customer_id: number;
  customer_name: string;
  subsection: string;
  seat_number: string;
  start_date: string;
  end_date: string;
  duration_months: number;
  amount: number;
  pay_via: string;
  status: string;
}

interface Customer {
  id: number;
  name: string;
}

interface User {
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

export function Reservations({ selectedOrg, user }: { selectedOrg?: string, user: User }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showQR, setShowQR] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      customer_id: "",
      subsection: "",
      seat_number: "",
      start_date: new Date(),
      duration_months: 1,
      amount: 0,
      pay_via: "Cash",
    },
  });

  const fetchData = () => {
    setLoading(true);
    const fetchReservations = fetch('http://localhost:8000/api/reservations').then(res => res.json());
    const fetchCustomersList = fetch('http://localhost:8000/api/customers').then(res => res.json());

    Promise.all([fetchReservations, fetchCustomersList])
      .then(([resData, custData]) => {
        setReservations(resData);
        setCustomers(custData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch data:", err);
        setReservations([
          { id: 1, customer_id: 1, customer_name: 'John Doe', subsection: 'Trisha', seat_number: 'A01', start_date: '2025-03-01', end_date: '2025-04-01', duration_months: 1, amount: 50.00, pay_via: 'Cash', status: 'paid' },
        ]);
        setCustomers([{ id: 1, name: 'John Doe' }]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: ReservationFormValues) => {
    const endDate = format(addMonths(data.start_date, data.duration_months), 'yyyy-MM-dd');
    
    try {
      const response = await fetch('http://localhost:8000/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          customer_id: parseInt(data.customer_id),
          start_date: format(data.start_date, 'yyyy-MM-dd'),
          end_date: endDate,
          status: 'paid' // Default as per previous logic
        })
      });
      if (response.ok) {
        setShowAdd(false);
        form.reset();
        fetchData();
      }
    } catch (err) {
      console.error("Failed to add reservation:", err);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await fetch(`http://localhost:8000/api/reservations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleSendNotification = async (res: Reservation) => {
    try {
      await fetch('http://localhost:8000/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customer_id: res.customer_id, 
          message: `Payment Reminder: $${res.amount} for Seat ${res.seat_number} in ${res.subsection} (Valid till ${format(new Date(res.end_date), 'MMM d, yyyy')}).` 
        })
      });
      alert('Notification sent!');
    } catch (err) {
      console.error("Failed to send notification:", err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground">Manage seat assignments and subscription status.</p>
        </div>
        {user.role !== 'staff' && (
          <Button onClick={() => setShowAdd(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Reservation
          </Button>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign New Seat</DialogTitle>
            <DialogDescription>
              Complete the details to create a new seat reservation.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map(c => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="subsection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subsection</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Trisha">Trisha</SelectItem>
                          <SelectItem value="G2 Library">G2 Library</SelectItem>
                          <SelectItem value="Main Hall">Main Hall</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seat_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seat #</FormLabel>
                      <FormControl>
                        <Input placeholder="A101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Months</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="pay_via"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pay Via</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Payment Method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="QR Platform">QR Platform</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button type="submit">Create Reservation</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showQR} onOpenChange={(open) => !open && setShowQR(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold">Scan to Pay</DialogTitle>
            <DialogDescription>
              Scan the QR code below to complete the payment.
            </DialogDescription>
          </DialogHeader>
          {showQR && (
            <div className="flex flex-col items-center justify-center py-6 gap-6">
              <div className="p-4 bg-white rounded-xl shadow-md border border-border">
                <QRCodeSVG 
                  value={`upi://pay?pa=merchant@upi&pn=${encodeURIComponent(showQR.customer_name)}&am=${showQR.amount}&cu=USD`} 
                  size={200} 
                />
              </div>
              <div className="text-center">
                <p className="text-3xl font-extrabold">${showQR.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-muted-foreground mt-1">Seat: {showQR.subsection} - {showQR.seat_number}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button className="w-full" onClick={() => setShowQR(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-sm shadow-black/5">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Identifier</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Customer</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Location</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Duration</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Amount</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : reservations.length > 0 ? (
                reservations.map((res) => (
                  <TableRow key={res.id} className="hover:bg-muted/30 transition-colors group border-b border-dashed">
                    <TableCell className="font-bold text-muted-foreground">
                      #{res.id.toString().padStart(4, '0')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold uppercase">
                            {res.customer_name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold">{res.customer_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{res.subsection}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1">
                          <Armchair className="h-3 w-3" /> Seat {res.seat_number}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">
                          {format(new Date(res.start_date), 'MMM d, yy')} - {format(new Date(res.end_date), 'MMM d, yy')}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">{res.duration_months} months</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold">${res.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold italic">via {res.pay_via}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "text-[10px] uppercase font-extrabold px-2 py-0.5",
                        res.status === 'paid' ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 shadow-none border-none" : "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 shadow-none border-none"
                      )}>
                        {res.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {res.status !== 'paid' && (
                          <>
                            <Button size="icon" variant="ghost" onClick={() => handleSendNotification(res)} className="h-8 w-8 text-blue-500">
                              <Bell className="h-4 w-4" />
                            </Button>
                            {res.pay_via === 'QR Platform' && (
                              <Button size="icon" variant="ghost" onClick={() => setShowQR(res)} className="h-8 w-8 text-orange-500">
                                <QrCode className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusChange(res.id, 'paid')}
                              className="bg-green-500/10 text-green-600 hover:bg-green-500 text-[10px] font-bold h-7 px-3 uppercase transition-all"
                            >
                              Paid
                            </Button>
                          </>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    <UserIcon className="h-12 w-12 mb-4 opacity-10 mx-auto" />
                    <p className="font-bold">No reservations active</p>
                    <p className="text-sm">Start by assigning a new seat to a customer.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
