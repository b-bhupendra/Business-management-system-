import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, Users, Receipt, Bell, LogOut, 
  Menu, ChevronLeft, ChevronRight, Moon, Sun,
  CalendarDays, Settings, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger 
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface User {
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

export function Layout({ 
  children, currentTab, setCurrentTab, onLogout, darkMode, onToggleDarkMode, selectedOrg, setSelectedOrg, user
}: { 
  children: React.ReactNode, 
  currentTab: string, 
  setCurrentTab: (tab: string) => void, 
  onLogout: () => void,
  darkMode: boolean,
  onToggleDarkMode: () => void,
  selectedOrg: string,
  setSelectedOrg: (org: string) => void,
  user: User
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: <LayoutDashboard className="h-4 w-4" />, roles: ['admin', 'manager'] },
    { name: 'Reservations', id: 'reservations', icon: <CalendarDays className="h-4 w-4" />, roles: ['admin', 'manager', 'staff'] },
    { name: 'Customers', id: 'customers', icon: <Users className="h-4 w-4" />, roles: ['admin', 'manager', 'staff'] },
    { name: 'Billing', id: 'billing', icon: <Receipt className="h-4 w-4" />, roles: ['admin', 'manager'] },
    { name: 'Roles', id: 'roles', icon: <ShieldCheck className="h-4 w-4" />, roles: ['admin'] },
    { name: 'Notifications', id: 'notifications', icon: <Bell className="h-4 w-4" />, roles: ['admin', 'manager', 'staff'] },
  ].filter(item => item.roles.includes(user.role));

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className={cn(
        "flex items-center h-16 px-6 border-b border-border transition-all duration-300",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <span className="font-extrabold text-xl text-primary tracking-tighter">LUMINA PRO</span>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="p-4">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg bg-muted/50",
          isCollapsed ? "justify-center" : ""
        )}>
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarFallback>{user.role.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold capitalize truncate">{user.role} User</span>
              <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 py-4">
        {navigation.map((item) => {
          const isSelected = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group",
                isSelected 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isCollapsed ? "justify-center" : ""
              )}
            >
              <div className={cn(
                "transition-transform",
                isSelected ? "scale-110" : "group-hover:scale-110"
              )}>
                {item.icon}
              </div>
              {!isCollapsed && <span>{item.name}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
            isCollapsed && "justify-center p-0"
          )}
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar for Desktop */}
      <aside className={cn(
        "hidden md:block transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-none">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger className="w-[180px] border-none bg-transparent font-bold text-lg focus:ring-0 shadow-none">
                <SelectValue placeholder="Organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Organizations">All Organizations</SelectItem>
                <SelectItem value="Trisha Library">Trisha Library</SelectItem>
                <SelectItem value="G2 Library">G2 Library</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-destructive text-[10px]">3</Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="p-4 font-bold border-b border-border">Notifications</div>
                <div className="max-h-[300px] overflow-y-auto">
                  {[1, 2].map((i) => (
                    <DropdownMenuItem key={i} className="p-4 border-b border-border last:border-0 flex flex-col items-start gap-1 cursor-pointer">
                      <span className="font-bold text-sm">Payment Pending</span>
                      <span className="text-xs text-muted-foreground leading-tight">Customer #1289 has a pending payment of $120.</span>
                    </DropdownMenuItem>
                  ))}
                </div>
                <Button variant="ghost" className="w-full text-xs font-bold py-3 hover:bg-accent" onClick={() => setCurrentTab('notifications')}>
                  View All
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={onToggleDarkMode}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Avatar className="h-8 w-8 cursor-pointer border-2 border-primary ring-2 ring-primary/20" onClick={onLogout}>
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">A</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
