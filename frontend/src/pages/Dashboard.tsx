import React, { useEffect, useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Users, CalendarDays, Wallet, TrendingUp,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ['#00AB55', '#3366FF', '#FFC107', '#FF4842', '#1890FF'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-lg">
        <p className="text-xs font-bold text-muted-foreground mb-2">{label}</p>
        <div className="border-t border-dashed border-border pt-2 space-y-1">
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Revenue' ? '$' : ''}{entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

interface User {
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

interface Stats {
  total_customers: number;
  active_reservations: number;
  total_revenue: number;
  usage_rate: number;
}

export function Dashboard({ selectedOrg, user }: { selectedOrg?: string, user: User }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch stats:", err);
        setStats({
          total_customers: 48,
          active_reservations: 256,
          total_revenue: 45231.89,
          usage_rate: 82
        });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const multiplier = selectedOrg === 'Trisha Library' ? 0.6 : selectedOrg === 'G2 Library' ? 0.4 : 1;

  const cards = [
    { 
      name: 'Total Revenue', 
      value: (stats?.total_revenue || 0) * multiplier, 
      displayValue: `$${((stats?.total_revenue || 0) * multiplier).toLocaleString(undefined, {minimumFractionDigits: 2})}`,
      change: '+20.1%', 
      icon: <Wallet className="h-5 w-5" />, 
      color: 'text-primary', 
      bg: 'bg-primary/10' 
    },
    { 
      name: 'Active Reservations', 
      value: (stats?.active_reservations || 0) * multiplier, 
      displayValue: Math.floor((stats?.active_reservations || 0) * multiplier).toString(),
      change: '+15%', 
      icon: <CalendarDays className="h-5 w-5" />, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10' 
    },
    { 
      name: 'New Customers', 
      value: (stats?.total_customers || 0) * multiplier, 
      displayValue: Math.floor((stats?.total_customers || 0) * multiplier).toString(),
      change: '-2%', 
      icon: <Users className="h-5 w-5" />, 
      color: 'text-yellow-500', 
      bg: 'bg-yellow-500/10' 
    },
    { 
      name: 'Usage Rate', 
      value: stats?.usage_rate || 0, 
      displayValue: `${stats?.usage_rate || 0}%`,
      change: '+8%', 
      icon: <TrendingUp className="h-5 w-5" />, 
      color: 'text-rose-500', 
      bg: 'bg-rose-500/10' 
    }
  ];

  const revenueData = [
    { name: 'Mon', Revenue: 4000 * multiplier },
    { name: 'Tue', Revenue: 3000 * multiplier },
    { name: 'Wed', Revenue: 2000 * multiplier },
    { name: 'Thu', Revenue: 2780 * multiplier },
    { name: 'Fri', Revenue: 1890 * multiplier },
    { name: 'Sat', Revenue: 2390 * multiplier },
    { name: 'Sun', Revenue: 3490 * multiplier },
  ];

  const paymentMethodData = [
    { name: 'Credit Card', value: 400 * multiplier },
    { name: 'UPI', value: 300 * multiplier },
    { name: 'Cash', value: 300 * multiplier },
    { name: 'Bank Transfer', value: 200 * multiplier },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hi, Welcome back 👋</h1>
        <p className="text-muted-foreground">Overview for {selectedOrg || 'All Organizations'}</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.name} className="border-none shadow-sm shadow-black/5">
            <CardContent className="flex items-center p-6">
              <div className={cn("p-3 rounded-full mr-4 flex items-center justify-center", card.bg, card.color)}>
                {card.icon}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{card.name}</p>
                <p className="text-2xl font-bold">{card.displayValue}</p>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "text-xs font-bold",
                    card.change.startsWith('+') ? "text-green-500" : "text-rose-500"
                  )}>
                    {card.change}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">vs last month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-sm shadow-black/5">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Revenue Analytics</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00AB55" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#00AB55" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    className="text-[10px] font-bold fill-muted-foreground"
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    className="text-[10px] font-bold fill-muted-foreground"
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="Revenue" 
                    stroke="#00AB55" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-sm shadow-black/5">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Payments Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="45%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    className="text-[10px] uppercase font-bold text-muted-foreground"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
