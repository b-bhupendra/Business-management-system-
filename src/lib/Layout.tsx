import React, { useState } from 'react';
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { 
  Menu as MenuIcon, Dashboard as DashboardIcon, People as PeopleIcon, 
  Receipt as ReceiptIcon, Notifications as NotificationsIcon, Logout as LogoutIcon,
  DarkMode as DarkModeIcon, LightMode as LightModeIcon,
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
  EventSeat as EventSeatIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'motion/react';

const expandedWidth = 240;
const collapsedWidth = 80;

export function Layout({ 
  children, currentTab, setCurrentTab, onLogout, darkMode, onToggleDarkMode 
}: { 
  children: React.ReactNode, 
  currentTab: string, 
  setCurrentTab: (tab: string) => void, 
  onLogout: () => void,
  darkMode: boolean,
  onToggleDarkMode: () => void
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const drawerWidth = isCollapsed ? collapsedWidth : expandedWidth;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: <DashboardIcon /> },
    { name: 'Reservations', id: 'reservations', icon: <EventSeatIcon /> },
    { name: 'Customers', id: 'customers', icon: <PeopleIcon /> },
    { name: 'Billing', id: 'billing', icon: <ReceiptIcon /> },
    { name: 'Notifications', id: 'notifications', icon: <NotificationsIcon /> },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', px: [1] }}>
        {!isCollapsed && (
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 800, ml: 1, fontFamily: 'Outfit' }} className="text-gradient">
            Lumina Pro
          </Typography>
        )}
        <IconButton onClick={toggleCollapse} sx={{ display: { xs: 'none', sm: 'flex' } }}>
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>
      <Divider sx={{ opacity: 0.1 }} />
      <List sx={{ flexGrow: 1, px: 2, pt: 2 }}>
        {navigation.map((item) => {
          const isSelected = currentTab === item.id;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => { setCurrentTab(item.id); setMobileOpen(false); }}
                sx={{
                  borderRadius: 3,
                  justifyContent: isCollapsed ? 'center' : 'initial',
                  px: isCollapsed ? 1 : 2.5,
                  py: 1.5,
                  transition: 'all 0.3s',
                  background: isSelected ? 'linear-gradient(135deg, rgba(0,242,254,0.15) 0%, rgba(79,172,254,0.15) 100%)' : 'transparent',
                  border: isSelected ? '1px solid rgba(0,242,254,0.3)' : '1px solid transparent',
                  '&:hover': {
                    background: isSelected ? 'linear-gradient(135deg, rgba(0,242,254,0.2) 0%, rgba(79,172,254,0.2) 100%)' : 'rgba(255,255,255,0.05)',
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: isSelected ? '#00f2fe' : 'text.secondary',
                  minWidth: 0,
                  mr: isCollapsed ? 0 : 2,
                  justifyContent: 'center'
                }}>
                  {item.icon}
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText 
                    primary={item.name} 
                    sx={{ 
                      opacity: isCollapsed ? 0 : 1,
                      '& span': { 
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? 'text.primary' : 'text.secondary' 
                      }
                    }} 
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        className="glass-panel"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: darkMode ? 'rgba(11, 15, 25, 0.8)' : 'rgba(255,255,255,0.8)',
          borderBottom: '1px solid',
          borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          color: 'text.primary',
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600, fontFamily: 'Outfit' }}>
            {navigation.find(n => n.id === currentTab)?.name || 'Lumina Pro'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit" onClick={onToggleDarkMode}>
              {darkMode ? <LightModeIcon sx={{ color: '#fbc2eb' }} /> : <DarkModeIcon sx={{ color: '#4facfe' }} />}
            </IconButton>
            <IconButton color="inherit" onClick={onLogout} title="Logout" sx={{ color: 'error.main' }}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ 
          width: { sm: drawerWidth }, 
          flexShrink: { sm: 0 },
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: expandedWidth, borderRight: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth, 
              borderRight: '1px solid',
              borderColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              transition: (theme) => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 4 }, 
          width: { sm: `calc(100% - ${drawerWidth}px)` }, 
          mt: 8,
          minHeight: '100vh',
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ height: '100%' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
