import React, { useState } from 'react';
import { Container, Box, Card, CardContent, Typography, TextField, Button, Alert, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }
        setLoading(true);
        const result = await login(username, password);
        setLoading(false);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            px: 2
        }}>
            <Container maxWidth="xs">
                <Card sx={{
                    borderRadius: '24px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    overflow: 'hidden',
                    backdropFilter: 'blur(20px)',
                    backgroundColor: 'background.paper',
                    border: '1px solid rgba(255, 255, 255, 0.12)'
                }}>
                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Box sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                mb: 2,
                                boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)'
                            }}>
                                <LockOpenIcon fontSize="large" />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1, fontSize: '1.75rem' }}>
                                Welcome Back
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Sign in to manage and parse candidate resumes
                            </Typography>
                        </Box>

                        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Username"
                                fullWidth
                                variant="outlined"
                                margin="normal"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                placeholder="Enter username"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px'
                                    }
                                }}
                            />
                            <TextField
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                fullWidth
                                variant="outlined"
                                margin="normal"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                placeholder="Enter password"
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px'
                                    }
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                                sx={{
                                    py: 1.5,
                                    borderRadius: '12px',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
                                    background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(90deg, #1d4ed8 0%, #1e40af 100%)',
                                    }
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                            </Button>
                        </form>

                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Don't have an account?{' '}
                                <Link to="/register" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                                    Register here
                                </Link>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default Login;
