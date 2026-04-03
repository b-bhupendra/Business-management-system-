import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Send, Bell, CheckCircle2, MoreVertical, Loader2, User as UserIcon, MessageSquare
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
import { Textarea } from "@/components/ui/textarea";

const notificationSchema = z.object({
  customer_id: z.string().min(1, "Please select a recipient."),
  message: z.string().min(1, "Message cannot be empty."),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

interface Notification {
  id: number;
  customer_id: number;
  customer_name: string;
  message: string;
  sent_at: string;
}

interface Customer {
  id: number;
  name: string;
}

interface User {
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

export function Notifications({ selectedOrg, user }: { selectedOrg?: string, user: User }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      customer_id: "",
      message: "",
    },
  });

  const fetchData = () => {
    setLoading(true);
    const fetchNotifs = fetch('http://localhost:8000/api/notifications').then(res => res.json());
    const fetchCustomersList = fetch('http://localhost:8000/api/customers').then(res => res.json());

    Promise.all([fetchNotifs, fetchCustomersList])
      .then(([notifData, custData]) => {
        setNotifications(notifData);
        setCustomers(custData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch data:", err);
        setNotifications([
          { id: 1, customer_id: 1, customer_name: 'John Doe', message: 'Your subscription is about to expire.', sent_at: new Date().toISOString() }
        ]);
        setCustomers([{ id: 1, name: 'John Doe' }]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: NotificationFormValues) => {
    try {
      const response = await fetch('http://localhost:8000/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          customer_id: parseInt(data.customer_id)
        })
      });
      if (response.ok) {
        setShowAdd(false);
        form.reset();
        fetchData();
      }
    } catch (err) {
      console.error("Failed to send notification:", err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Broadcast updates and reminders to your customers.</p>
        </div>
        {user.role !== 'staff' && (
          <Button onClick={() => setShowAdd(true)} className="gap-2">
            <Send className="h-4 w-4" /> Send Notification
          </Button>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
            <DialogDescription>
              Write a personalized message for your customer.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a recipient" />
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
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Type your message here..." 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button type="submit">Send Message</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-sm shadow-black/5">
        <CardHeader className="bg-muted/30 border-b border-dashed py-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Bell className="h-4 w-4" /> Recent Communication
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-dashed">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => (
                <div key={notif.id} className="p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center group">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-10 w-10 mt-1">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {notif.customer_name.substring(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">To: {notif.customer_name}</span>
                        <Badge variant="outline" className="text-[10px] font-extrabold uppercase bg-green-500/5 text-green-600 border-none px-1 h-5 gap-1 shadow-none">
                          <CheckCircle2 className="h-3 w-3" /> Sent
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/80">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">
                        {format(new Date(notif.sent_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-16 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4 opacity-10 mx-auto" />
                <p className="font-bold">No history available</p>
                <p className="text-sm">Broadcasted messages will appear here.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
