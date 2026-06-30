import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Divider, Box, Avatar } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PsychologyIcon from '@mui/icons-material/Psychology';

const drawerWidth = 260;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = React.useMemo(() => {
        if (user?.role === 'ADMIN') {
            return [
                { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
                { text: 'Candidate Database', icon: <PeopleIcon />, path: '/candidates' },
                { text: 'HR Management', icon: <PeopleIcon />, path: '/admin/hr-management' },
                { text: 'HR Login Details', icon: <SettingsIcon />, path: '/admin/hr-login-details' },
            ];
        }
        return [
            { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
            { text: 'Upload Resume', icon: <CloudUploadIcon />, path: '/upload' },
            { text: 'Candidates Database', icon: <PeopleIcon />, path: '/candidates' },
            { text: 'AI Match Center', icon: <PsychologyIcon />, path: '/match' },
            { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
            { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
            { text: 'Profile', icon: <AccountCircleIcon />, path: '/profile' },
        ];
    }, [user?.role]);

    const handleNavigation = (path) => {
        navigate(path);
        if (handleDrawerToggle) {
            handleDrawerToggle();
        }
    };

    const handleLogoutClick = () => {
        logout();
        navigate('/login');
    };

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.5, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    CV PARSER AI
                </Typography>
            </Toolbar>
            <Divider />
            
            {/* User Profile Card */}
            {user && (
                <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, fontWeight: 'bold' }}>
                        {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {user.username || 'User'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.65rem' }}>
                            {user.role || 'HR'}
                        </Typography>
                    </Box>
                </Box>
            )}
            
            <Divider sx={{ mb: 1 }} />

            <List sx={{ px: 1, flexGrow: 1 }}>
                {menuItems.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => handleNavigation(item.path)}
                                sx={{
                                    borderRadius: '12px',
                                    py: 1.2,
                                    px: 2,
                                    backgroundColor: active ? 'primary.light' : 'transparent',
                                    color: active ? 'primary.main' : 'text.primary',
                                    '&:hover': {
                                        backgroundColor: active ? 'primary.light' : 'action.hover',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ color: active ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={item.text} 
                                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: active ? 600 : 500 }} 
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Divider />
            <List sx={{ p: 1 }}>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={handleLogoutClick}
                        sx={{
                            borderRadius: '12px',
                            py: 1.2,
                            px: 2,
                            color: 'error.main',
                            '&:hover': {
                                backgroundColor: 'error.light',
                                color: 'error.main',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
                            <ExitToAppIcon />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Logout" 
                            primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600 }} 
                        />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' },
                }}
            >
                {drawerContent}
            </Drawer>
            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar;
