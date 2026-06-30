import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Button, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, IconButton, Switch, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, CircularProgress, Alert, Tooltip 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import axios from 'axios';

const HRManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Dialog states
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openReset, setOpenReset] = useState(false);

    // Form states
    const [selectedUser, setSelectedUser] = useState(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const token = localStorage.getItem('token');
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:8085/api/admin/users', authHeader);
            // Filter to show only HR accounts
            setUsers(response.data.filter(u => u.role === 'HR'));
        } catch (err) {
            console.error(err);
            setError('Failed to fetch HR accounts.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 4000);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post('http://localhost:8085/api/admin/users', { username, email, password }, authHeader);
            showSuccess('HR account created successfully.');
            setOpenCreate(false);
            setUsername('');
            setEmail('');
            setPassword('');
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create HR account.');
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.put(`http://localhost:8085/api/admin/users/${selectedUser.id}`, { email }, authHeader);
            showSuccess('HR account updated successfully.');
            setOpenEdit(false);
            setEmail('');
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update HR account.');
        }
    };

    const handleDelete = async () => {
        setError('');
        try {
            await axios.delete(`http://localhost:8085/api/admin/users/${selectedUser.id}`, authHeader);
            showSuccess('HR account deleted successfully.');
            setOpenDelete(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete HR account.');
        }
    };

    const handleToggleActive = async (user) => {
        try {
            const response = await axios.post(`http://localhost:8085/api/admin/users/${user.id}/toggle`, {}, authHeader);
            showSuccess(response.data.message);
            fetchUsers();
        } catch (err) {
            setError('Failed to toggle account activation.');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post(`http://localhost:8085/api/admin/users/${selectedUser.id}/reset-password`, { password }, authHeader);
            showSuccess('Password reset successfully.');
            setOpenReset(false);
            setPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                        HR Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Create, modify, suspend, or delete HR accounts.
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={() => setOpenCreate(true)}
                    sx={{ borderRadius: '10px' }}
                >
                    Create HR
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Email Address</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    No HR accounts found. Click "Create HR" to add one.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((u) => (
                                <TableRow key={u.id} hover>
                                    <TableCell sx={{ fontWeight: 550 }}>{u.username}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Switch 
                                                checked={u.active} 
                                                onChange={() => handleToggleActive(u)}
                                                color="primary"
                                            />
                                            <Typography variant="body2" sx={{ fontWeight: 500, color: u.active ? 'success.main' : 'text.secondary' }}>
                                                {u.active ? 'Active' : 'Inactive'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                            <Tooltip title="Edit HR Account">
                                                <IconButton color="primary" onClick={() => { setSelectedUser(u); setEmail(u.email); setOpenEdit(true); }}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Reset Password">
                                                <IconButton color="warning" onClick={() => { setSelectedUser(u); setOpenReset(true); }}>
                                                    <LockResetIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete HR Account">
                                                <IconButton color="error" onClick={() => { setSelectedUser(u); setOpenDelete(true); }}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create HR Dialog */}
            <Dialog open={openCreate} onClose={() => setOpenCreate(false)} PaperProps={{ sx: { borderRadius: '16px', p: 1.5 } }}>
                <form onSubmit={handleCreate}>
                    <DialogTitle sx={{ fontWeight: 700 }}>Create HR Account</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            label="Username"
                            fullWidth
                            variant="outlined"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                        <TextField
                            margin="dense"
                            label="Email Address"
                            type="email"
                            fullWidth
                            variant="outlined"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                        <TextField
                            margin="dense"
                            label="Password"
                            type="password"
                            fullWidth
                            variant="outlined"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5 }}>
                        <Button onClick={() => setOpenCreate(false)} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained">Create</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Edit HR Dialog */}
            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} PaperProps={{ sx: { borderRadius: '16px', p: 1.5 } }}>
                <form onSubmit={handleEdit}>
                    <DialogTitle sx={{ fontWeight: 700 }}>Edit HR Account</DialogTitle>
                    <DialogContent>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                            Username: <strong>{selectedUser?.username}</strong>
                        </Typography>
                        <TextField
                            margin="dense"
                            label="Email Address"
                            type="email"
                            fullWidth
                            variant="outlined"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5 }}>
                        <Button onClick={() => setOpenEdit(false)} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained">Save Changes</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={openReset} onClose={() => setOpenReset(false)} PaperProps={{ sx: { borderRadius: '16px', p: 1.5 } }}>
                <form onSubmit={handleResetPassword}>
                    <DialogTitle sx={{ fontWeight: 700 }}>Reset HR Password</DialogTitle>
                    <DialogContent>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                            Resetting password for: <strong>{selectedUser?.username}</strong>
                        </Typography>
                        <TextField
                            margin="dense"
                            label="New Password"
                            type="password"
                            fullWidth
                            variant="outlined"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5 }}>
                        <Button onClick={() => setOpenReset(false)} color="inherit">Cancel</Button>
                        <Button type="submit" variant="contained" color="warning">Reset Password</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete HR Dialog */}
            <Dialog open={openDelete} onClose={() => setOpenDelete(false)} PaperProps={{ sx: { borderRadius: '16px', p: 1.5 } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Delete HR Account</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to permanently delete the HR account <strong>{selectedUser?.username}</strong>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpenDelete(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default HRManagement;
