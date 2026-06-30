import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Avatar, Grid, Divider, List, ListItem, ListItemText, Chip } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import axios from 'axios';

const Profile = () => {
    const { user } = useAuth();
    const [parsedCount, setParsedCount] = useState(0);

    useEffect(() => {
        const fetchParsedCount = async () => {
            try {
                const response = await axios.get('/api/candidates?page=0&size=1');
                setParsedCount(response.data.totalElements || 0);
            } catch (err) {
                console.error("Error fetching total candidates: ", err);
            }
        };

        fetchParsedCount();
    }, []);

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                    User Profile
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    View your identity credentials, access scopes, and repository parsing stats
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Profile Overview Card */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center', p: 4 }}>
                        <CardContent>
                            <Avatar sx={{
                                width: 96,
                                height: 96,
                                mx: 'auto',
                                mb: 2.5,
                                bgcolor: 'primary.main',
                                fontSize: '2.5rem',
                                fontWeight: 700,
                                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
                            }}>
                                {user?.username?.charAt(0).toUpperCase()}
                            </Avatar>
                            
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                {user?.username}
                            </Typography>
                            
                            <Chip
                                label={user?.role}
                                color={user?.role === 'ADMIN' ? 'error' : 'primary'}
                                icon={<VerifiedUserIcon />}
                                sx={{ fontWeight: 700, borderRadius: '8px', mb: 3 }}
                            />

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, textAlign: 'left', mt: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <MailOutlineIcon color="action" fontSize="small" />
                                    <Typography variant="body2" color="text.secondary" sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                        {user?.email || 'N/A'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <CalendarTodayIcon color="action" fontSize="small" />
                                    <Typography variant="body2" color="text.secondary">
                                        Session Status: Active
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Profile Analytics details */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                <AccountCircleIcon color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    Account Details & Statistics
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Details concerning permissions and actions completed on the platform.
                            </Typography>

                            <List sx={{ bgcolor: 'action.hover', borderRadius: '12px', p: 1 }}>
                                <ListItem divider>
                                    <ListItemText
                                        primary="Username"
                                        secondary={user?.username}
                                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
                                    />
                                </ListItem>
                                <ListItem divider>
                                    <ListItemText
                                        primary="Email Address"
                                        secondary={user?.email || 'Not configured'}
                                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
                                    />
                                </ListItem>
                                <ListItem divider>
                                    <ListItemText
                                        primary="System Security Role"
                                        secondary={user?.role === 'ADMIN' ? 'Administrator (Full CRUD and export access)' : 'HR Officer (Upload, review, and viewing access)'}
                                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Resumes in Database"
                                        secondary={`${parsedCount} resumes successfully processed in MySQL.`}
                                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Profile;
