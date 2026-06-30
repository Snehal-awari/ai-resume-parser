import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, CircularProgress, Alert, Chip 
} from '@mui/material';
import axios from 'axios';

const HRLoginDetails = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8085/api/admin/users', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsers(response.data);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch user login details.');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === 'N/A') return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateStr;
        }
    };

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
                    HR Login Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    View account status, roles, and registration timestamps.
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Email Address</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Account Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Created Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((u) => (
                            <TableRow key={u.id} hover>
                                <TableCell sx={{ fontWeight: 550 }}>{u.username}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={u.role} 
                                        size="small" 
                                        color={u.role === 'ADMIN' ? 'secondary' : 'default'}
                                        sx={{ fontWeight: 600, fontSize: '0.75rem', borderRadius: '6px' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={u.active ? 'Active' : 'Inactive'} 
                                        size="small" 
                                        color={u.active ? 'success' : 'error'}
                                        variant={u.active ? 'filled' : 'outlined'}
                                        sx={{ fontWeight: 600, fontSize: '0.75rem', borderRadius: '6px' }}
                                    />
                                </TableCell>
                                <TableCell color="text.secondary">
                                    {formatDate(u.createdDate)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default HRLoginDetails;
