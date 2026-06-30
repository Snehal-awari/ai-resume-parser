import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Avatar } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import BadgeIcon from '@mui/icons-material/Badge';
import axios from 'axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalCandidates: 0, totalHR: 0, totalAdmin: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8085/api/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data);
            } catch (err) {
                console.error('Failed to fetch admin stats', err);
                setError('Failed to load system statistics.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                    Admin Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Overview of the system, HR accounts, and parsed candidate profiles.
                </Typography>
            </Box>

            {error && (
                <Typography color="error" sx={{ mb: 3 }}>
                    {error}
                </Typography>
            )}

            <Grid container spacing={3}>
                {/* Total Candidates */}
                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Avatar sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'primary.light', color: 'primary.main', mr: 2, width: 56, height: 56 }}>
                                <PeopleIcon sx={{ fontSize: 32 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                    Total Candidates
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {stats.totalCandidates}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Total HR Officers */}
                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Avatar sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'success.light', color: 'success.main', mr: 2, width: 56, height: 56 }}>
                                <BadgeIcon sx={{ fontSize: 32 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                    HR Officers
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {stats.totalHR}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Total Administrators */}
                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Avatar sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'warning.light', color: 'warning.main', mr: 2, width: 56, height: 56 }}>
                                <SupervisorAccountIcon sx={{ fontSize: 32 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                    Administrators
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {stats.totalAdmin}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
