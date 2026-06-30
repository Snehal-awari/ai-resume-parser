import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Skeleton, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalCandidates: 0, recentCandidates: [], uniqueSkillsCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('/api/candidates?page=0&size=5&sortBy=createdDate&direction=DESC');
                const data = response.data;
                
                // Aggregate some statistics locally
                const allCandidatesResponse = await axios.get('/api/candidates?page=0&size=1000');
                const allCandidates = allCandidatesResponse.data?.content || [];
                
                const uniqueSkills = new Set();
                allCandidates.forEach(cand => {
                    if (cand.skills && Array.isArray(cand.skills)) {
                        cand.skills.forEach(skill => {
                            if (skill) {
                                uniqueSkills.add(skill.toLowerCase().trim());
                            }
                        });
                    }
                });

                setStats({
                    totalCandidates: data?.totalElements || 0,
                    recentCandidates: data?.content || [],
                    uniqueSkillsCount: uniqueSkills.size
                });
            } catch (err) {
                console.error("Error fetching dashboard statistics", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleExportExcel = async () => {
        try {
            const response = await axios.get('/api/resumes/export/excel', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'resumes.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error("Failed to export Excel: ", err);
        }
    };

    const handleReset = () => {
        setStats({
            totalCandidates: 0,
            recentCandidates: [],
            uniqueSkillsCount: 0
        });
    };

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                        Dashboard Overview
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Welcome to your AI resume parsing and recruitment intelligence workspace
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  
                    <Button
                        variant="contained"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => navigate('/upload')}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                    >
                        Upload Resume
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleExportExcel}
                        disabled={stats.totalCandidates === 0}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                    >
                        Export Excel
                    </Button>
                </Box>
            </Box>

            {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Box sx={{
                                p: 1.5,
                                borderRadius: '12px',
                                bgcolor: 'primary.light',
                                color: 'primary.main',
                                mr: 2,
                                display: 'flex'
                            }}>
                                <PeopleIcon fontSize="large" />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                    Total Candidates
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {loading ? <Skeleton width={60} /> : stats.totalCandidates}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Box sx={{
                                p: 1.5,
                                borderRadius: '12px',
                                bgcolor: 'success.light',
                                color: 'success.main',
                                mr: 2,
                                display: 'flex'
                            }}>
                                <ListAltIcon fontSize="large" />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                    Unique Skills Extracted
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {loading ? <Skeleton width={60} /> : stats.uniqueSkillsCount}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Box sx={{
                                p: 1.5,
                                borderRadius: '12px',
                                bgcolor: 'warning.light',
                                color: 'warning.main',
                                mr: 2,
                                display: 'flex'
                            }}>
                                <CloudUploadIcon fontSize="large" />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                                    Recent Uploads
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {loading ? <Skeleton width={60} /> : stats.recentCandidates.length}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Recent Candidates Table */}
            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 4 }}>
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Recently Parsed Resumes
                        </Typography>
                        <Button 
                            variant="text" 
                            onClick={() => navigate('/candidates')}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            View All Database
                        </Button>
                    </Box>

                    {loading ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Skeleton height={40} />
                            <Skeleton height={40} />
                            <Skeleton height={40} />
                        </Box>
                    ) : stats.recentCandidates.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 5 }}>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                No resumes uploaded yet.
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<CloudUploadIcon />}
                                onClick={() => navigate('/upload')}
                                sx={{ borderRadius: '8px', textTransform: 'none' }}
                            >
                                Parse First CV
                            </Button>
                        </Box>
                    ) : (
                        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                            <Table>
                                <TableHead sx={{ bgcolor: 'action.hover' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Experience</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stats.recentCandidates.map((candidate) => (
                                        <TableRow key={candidate.id} hover>
                                            <TableCell sx={{ fontWeight: 550 }}>{candidate.name || 'Unknown'}</TableCell>
                                            <TableCell>{candidate.email || 'N/A'}</TableCell>
                                            <TableCell>{candidate.phone || 'N/A'}</TableCell>
                                            <TableCell>{candidate.experience || 'N/A'}</TableCell>
                                            <TableCell align="right">
                                                <IconButton 
                                                    color="primary"
                                                    onClick={() => navigate(`/candidates?view=${candidate.id}`)}
                                                >
                                                    <PlayArrowIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default Dashboard;
