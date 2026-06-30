import React, { useState } from 'react';
import { Container, Box, Card, CardContent, Typography, TextField, Button, Alert, InputAdornment, IconButton, CircularProgress, MenuItem } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('HR');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!username || !email || !password || !role) {
            setError('All fields are required.');
            return;
        }

        setLoading(true);
        const result = await register(username, email, password, role);
        setLoading(false);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
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
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                mb: 2,
                                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)'
                            }}>
                                <PersonAddIcon fontSize="large" />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1, fontSize: '1.75rem' }}>
                                Create Account
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Sign up to access candidate hub
                            </Typography>
                        </Box>

                        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>Account created! Redirecting to login...</Alert>}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Username"
                                fullWidth
                                variant="outlined"
                                margin="normal"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                placeholder="Choose a username"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                            <TextField
                                label="Email"
                                type="email"
                                fullWidth
                                variant="outlined"
                                margin="normal"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                placeholder="Enter email address"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
                                placeholder="Choose a password"
                                sx={{
                                    '& .MuiOutlinedInput-root': { borderRadius: '12px' }
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
                            <TextField
                                select
                                label="System Role"
                                fullWidth
                                variant="outlined"
                                margin="normal"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': { borderRadius: '12px' }
                                }}
                            >
                                <MenuItem value="HR">HR Officer</MenuItem>
                                <MenuItem value="ADMIN">Administrator</MenuItem>
                            </TextField>

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
                                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
                                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
                                    }
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                            </Button>
                        </form>

                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <Link to="/login" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>
                                    Sign In here
                                </Link>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default Register;
