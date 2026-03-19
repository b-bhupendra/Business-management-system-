import React, { useState } from 'react';
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { 
  Menu as MenuIcon, Dashboard as DashboardIcon, People as PeopleIcon, 
  Receipt as ReceiptIcon, Notifications as NotificationsIcon, Logout as LogoutIcon,
  DarkMode as DarkModeIcon, LightMode as LightModeIcon,
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

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
  const [isCollapsed, setIsCollapsed] = useState(true);

  const drawerWidth = isCollapsed ? collapsedWidth : expandedWidth;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: <DashboardIcon /> },
    { name: 'Customers', id: 'customers', icon: <PeopleIcon /> },
    { name: 'Billing', id: 'billing', icon: <ReceiptIcon /> },
    { name: 'Notifications', id: 'notifications', icon: <NotificationsIcon /> },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', px: [1] }}>
        {!isCollapsed && (
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: 'primary.main', ml: 1 }}>
            BizManage
          </Typography>
        )}
        <IconButton onClick={toggleCollapse} sx={{ display: { xs: 'none', sm: 'flex' } }}>
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {navigation.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton 
              selected={currentTab === item.id}
              onClick={() => { setCurrentTab(item.id); setMobileOpen(false); }}
              sx={{
                mx: isCollapsed ? 1 : 1,
                borderRadius: 2,
                mb: 0.5,
                justifyContent: isCollapsed ? 'center' : 'initial',
                px: isCollapsed ? 1 : 2.5,
                '&.Mui-selected': {
                  bgcolor: 'rgba(37, 99, 235, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(37, 99, 235, 0.2)',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ 
                color: currentTab === item.id ? 'primary.main' : 'inherit', 
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
                    color: currentTab === item.id ? 'primary.main' : 'inherit',
                    opacity: isCollapsed ? 0 : 1
                  }} 
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'primary.main',
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
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigation.find(n => n.id === currentTab)?.name || 'BizManage'}
          </Typography>
          <IconButton color="inherit" onClick={onToggleDarkMode} sx={{ mr: 1 }}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <IconButton color="inherit" onClick={onLogout} title="Logout">
            <LogoutIcon />
          </IconButton>
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
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: expandedWidth },
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
              borderRight: '1px solid rgba(0, 0, 0, 0.08)',
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
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
