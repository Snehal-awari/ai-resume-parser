import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Switch, FormControlLabel, Divider, Alert, Snackbar, Grid } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LockIcon from '@mui/icons-material/Lock';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

const Settings = ({ mode, toggleTheme }) => {
    const { user, updateProfile } = useAuth();
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(false);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password && password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        const result = await updateProfile(email, password);
        setLoading(false);

        if (result.success) {
            setSuccess('Profile updated successfully.');
            setToast(true);
            setPassword('');
            setConfirmPassword('');
        } else {
            setError(result.message);
        }
    };

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                    Application Settings
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Configure your display preferences, edit user profile details, or change authentication passwords
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}

            <Grid container spacing={4}>
                {/* Visual Settings */}
                <Grid item xs={12} md={5}>
                    <Card sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                <DarkModeIcon color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Appearance
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Toggle system themes between Light and Dark mode. Theme is persisted locally in this browser.
                            </Typography>

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={mode === 'dark'}
                                        onChange={toggleTheme}
                                        color="primary"
                                    />
                                }
                                label={mode === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
                                sx={{
                                    '& .MuiTypography-root': {
                                        fontWeight: 600,
                                        fontSize: '0.95rem'
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Profile Settings */}
                <Grid item xs={12} md={7}>
                    <Card sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                <AccountBoxIcon color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    User Profile & Password
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            <form onSubmit={handleProfileSubmit}>
                                <TextField
                                    label="Username (Read-Only)"
                                    fullWidth
                                    variant="outlined"
                                    margin="normal"
                                    value={user?.username || ''}
                                    disabled
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />

                                <TextField
                                    label="Email Address"
                                    type="email"
                                    fullWidth
                                    variant="outlined"
                                    margin="normal"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 4, mb: 2 }}>
                                    <LockIcon color="primary" fontSize="small" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        Change Password
                                    </Typography>
                                </Box>
                                <Divider sx={{ mb: 2 }} />

                                <TextField
                                    label="New Password"
                                    type="password"
                                    fullWidth
                                    variant="outlined"
                                    margin="normal"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    placeholder="Leave blank to keep current"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />

                                <TextField
                                    label="Confirm New Password"
                                    type="password"
                                    fullWidth
                                    variant="outlined"
                                    margin="normal"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    placeholder="Leave blank to keep current"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' }, mb: 3 }}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    sx={{
                                        py: 1.2,
                                        px: 4,
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        fontWeight: 600
                                    }}
                                >
                                    {loading ? 'Saving Changes...' : 'Save Profile'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Snackbar
                open={toast}
                autoHideDuration={4000}
                onClose={() => setToast(false)}
                message="Profile settings successfully saved!"
            />
        </Box>
    );
};

export default Settings;
