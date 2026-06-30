import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, Toolbar, AppBar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadResume from './pages/UploadResume';
import ReviewPage from './pages/ReviewPage';
import CandidatesDatabase from './pages/CandidatesDatabase';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import AiMatchCenter from './pages/AiMatchCenter';
import AdminDashboard from './pages/AdminDashboard';
import HRManagement from './pages/HRManagement';
import HRLoginDetails from './pages/HRLoginDetails';

const AdminRoute = () => {
    const { user, isAuthenticated, loading } = useAuth();
    const context = useOutletContext();
    if (loading) return null;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
    return <Outlet context={context} />;
};

const HrRoute = () => {
    const { user, isAuthenticated, loading } = useAuth();
    const context = useOutletContext();
    if (loading) return null;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role !== 'HR') return <Navigate to="/admin/dashboard" replace />;
    return <Outlet context={context} />;
};

const FallbackRedirect = () => {
    const { user, isAuthenticated, loading } = useAuth();
    if (loading) return null;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role === 'ADMIN') {
        return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
};

const ProtectedLayout = ({ mode, toggleTheme }) => {
    const { isAuthenticated, loading } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Persisted states for UploadResume page
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [globalError, setGlobalError] = useState('');
    const [globalSuccess, setGlobalSuccess] = useState('');
    const [parsedCount, setParsedCount] = useState(0);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography variant="body1" color="text.secondary">Loading Workspace...</Typography>
            </Box>
        );
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Topbar for mobile screens */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - 260px)` },
                    ml: { md: `260px` },
                    display: { md: 'none' },
                    boxShadow: 'none',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    color: 'text.primary'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                        CV Parser AI
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Navigation Drawer Sidebar */}
            <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

            {/* Content main frame */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 4,
                    width: { md: `calc(100% - 260px)` },
                    mt: { xs: 8, md: 0 },
                    bgcolor: 'background.default',
                    minHeight: '100vh',
                    overflowX: 'hidden'
                }}
            >
                <Outlet context={{
                    files,
                    setFiles,
                    uploading,
                    setUploading,
                    globalError,
                    setGlobalError,
                    globalSuccess,
                    setGlobalSuccess,
                    parsedCount,
                    setParsedCount
                }} />
            </Box>
        </Box>
    );
};

const AppContent = () => {
    const savedMode = localStorage.getItem('mode');
    const initialMode = (savedMode === 'light' || savedMode === 'dark') ? savedMode : 'light';
    const [mode, setMode] = useState(initialMode);

    const toggleTheme = () => {
        const nextMode = mode === 'light' ? 'dark' : 'light';
        setMode(nextMode);
        localStorage.setItem('mode', nextMode);
    };

    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            primary: {
                main: mode === 'light' ? '#4f46e5' : '#6366f1',
                light: mode === 'light' ? '#e0e7ff' : '#2e3056',
                dark: mode === 'light' ? '#3730a3' : '#4f46e5',
            },
            secondary: {
                main: mode === 'light' ? '#0d9488' : '#14b8a6',
            },
            background: {
                default: mode === 'light' ? '#f8fafc' : '#0f172a',
                paper: mode === 'light' ? '#ffffff' : '#1e293b',
            },
            text: {
                primary: mode === 'light' ? '#0f172a' : '#f8fafc',
                secondary: mode === 'light' ? '#475569' : '#94a3b8',
            },
            divider: mode === 'light' ? '#e2e8f0' : '#334155',
            action: {
                hover: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
            }
        },
        typography: {
            fontFamily: "'Outfit', sans-serif",
            h4: { fontWeight: 700 },
            h5: { fontWeight: 700 },
            h6: { fontWeight: 700 },
            subtitle1: { fontWeight: 600 },
            subtitle2: { fontWeight: 600 },
            body1: { fontSize: '0.95rem' },
            body2: { fontSize: '0.875rem' },
        },
        shape: {
            borderRadius: 12,
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        textTransform: 'none',
                        fontWeight: 600,
                    }
                }
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        border: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #334155',
                        boxShadow: 'none'
                    }
                }
            }
        }
    }), [mode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    <Route element={<ProtectedLayout mode={mode} toggleTheme={toggleTheme} />}>
                        {/* Shared Routes */}
                        <Route path="/candidates" element={<CandidatesDatabase />} />

                        {/* HR-Only Routes */}
                        <Route element={<HrRoute />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/upload" element={<UploadResume />} />
                            <Route path="/review/:id" element={<ReviewPage />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/match" element={<AiMatchCenter />} />
                            <Route path="/settings" element={<Settings mode={mode} toggleTheme={toggleTheme} />} />
                            <Route path="/profile" element={<Profile />} />
                        </Route>

                        {/* Admin-Only Routes */}
                        <Route element={<AdminRoute />}>
                            <Route path="/admin/dashboard" element={<AdminDashboard />} />
                            <Route path="/admin/hr-management" element={<HRManagement />} />
                            <Route path="/admin/hr-login-details" element={<HRLoginDetails />} />
                        </Route>

                        <Route path="*" element={<FallbackRedirect />} />
                    </Route>
                    
                    <Route path="/" element={<FallbackRedirect />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
