import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TableSortLabel, Paper, IconButton, Button, InputAdornment, Drawer, Divider, Chip, Grid, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LinkIcon from '@mui/icons-material/Link';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import SchoolIcon from '@mui/icons-material/School';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const CandidatesDatabase = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const viewIdParam = searchParams.get('view');

    const [candidates, setCandidates] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [sortBy, setSortBy] = useState('createdDate');
    const [direction, setDirection] = useState('DESC');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Slide-out View Drawer State
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/candidates', {
                params: {
                    search,
                    page,
                    size,
                    sortBy,
                    direction
                }
            });
            setCandidates(response.data.content);
            setTotalElements(response.data.totalElements);
        } catch (err) {
            console.error("Error loading candidates: ", err);
            setError('Failed to load candidate database.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [search, page, size, sortBy, direction]);

    // Handle view param from other pages
    useEffect(() => {
        if (viewIdParam) {
            handleViewDetails(viewIdParam);
            searchParams.delete('view');
            setSearchParams(searchParams);
        }
    }, [viewIdParam, candidates]);

    const handleSort = (property) => {
        const isAsc = sortBy === property && direction === 'ASC';
        setDirection(isAsc ? 'DESC' : 'ASC');
        setSortBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setSize(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewDetails = async (id) => {
        try {
            const response = await axios.get(`/api/candidates/${id}`);
            setSelectedCandidate(response.data);
            setDrawerOpen(true);
        } catch (err) {
            console.error("Error loading candidate profile details", err);
            setError("Failed to fetch detailed profile.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to permanently delete this candidate from the database?")) {
            try {
                await axios.delete(`/api/candidates/${id}`);
                fetchCandidates();
                if (selectedCandidate && selectedCandidate.id === id) {
                    setDrawerOpen(false);
                }
            } catch (err) {
                console.error("Failed to delete: ", err);
                setError('Failed to delete candidate.');
            }
        }
    };

    const handleExportExcel = async () => {
        try {
            const response = await axios.get('/api/resumes/export/excel', {
                params: { search },
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const d = new Date(dateString);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                        Candidates Database
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Search, filter, examine, and manage all parsed candidate CV profiles in the system
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportExcel}
                    disabled={totalElements === 0}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                >
                    Export All Excel
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

            <Card sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 3 }}>
                    {/* Search filter row */}
                    <Box sx={{ display: 'flex', mb: 3 }}>
                        <TextField
                            placeholder="Search by Name, Email, Skills, Phone, or Experience..."
                            fullWidth
                            variant="outlined"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(0);
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>

                    {/* Data Table */}
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'action.hover' }}>
                                <TableRow>
                                    <TableCell>
                                        <TableSortLabel
                                            active={sortBy === 'name'}
                                            direction={sortBy === 'name' ? direction.toLowerCase() : 'asc'}
                                            onClick={() => handleSort('name')}
                                            sx={{ fontWeight: 600 }}
                                        >
                                            Name
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>LinkedIn</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>GitHub</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Skills</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Experience</TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={sortBy === 'createdDate'}
                                            direction={sortBy === 'createdDate' ? direction.toLowerCase() : 'asc'}
                                            onClick={() => handleSort('createdDate')}
                                            sx={{ fontWeight: 600 }}
                                        >
                                            Upload Date
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {candidates.map((cand) => (
                                    <TableRow key={cand.id} hover>
                                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{cand.name || 'Unknown'}</TableCell>
                                        <TableCell>{cand.phone || 'N/A'}</TableCell>
                                        <TableCell>{cand.email || 'N/A'}</TableCell>
                                        <TableCell>
                                            {cand.linkedin ? (
                                                <IconButton href={cand.linkedin} target="_blank" size="small" color="primary">
                                                    <LinkIcon fontSize="small" />
                                                </IconButton>
                                            ) : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {cand.github ? (
                                                <IconButton href={cand.github} target="_blank" size="small" color="secondary">
                                                    <LinkIcon fontSize="small" />
                                                </IconButton>
                                            ) : 'N/A'}
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 200 }}>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {cand.skills && cand.skills.slice(0, 3).map((skill, idx) => (
                                                    <Chip key={idx} label={skill} size="small" variant="outlined" />
                                                ))}
                                                {cand.skills && cand.skills.length > 3 && (
                                                    <Chip label={`+${cand.skills.length - 3}`} size="small" />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 150, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                            {cand.experience || 'N/A'}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem' }}>{formatDate(cand.createdDate)}</TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                <IconButton color="primary" onClick={() => handleViewDetails(cand.id)} size="small">
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => handleDelete(cand.id)} size="small">
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {candidates.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                            No candidates found matching the search criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={totalElements}
                        rowsPerPage={size}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </CardContent>
            </Card>

            {/* Profile Detail Slide Drawer */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 600 }, p: 4, boxSizing: 'border-box' } }}
            >
                {selectedCandidate && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                Candidate Profile
                            </Typography>
                            <IconButton onClick={() => setDrawerOpen(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                            Parsed file: {selectedCandidate.resumeFileName} | Uploaded: {formatDate(selectedCandidate.createdDate)}
                        </Typography>
                        <Divider />

                        <Box sx={{ overflowY: 'auto', flexGrow: 1, py: 3, pr: 1 }}>
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                                    {selectedCandidate.name || 'Unknown Candidate'}
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 550, color: 'text.secondary', mb: 2 }}>
                                    {selectedCandidate.email} {selectedCandidate.phone && `• ${selectedCandidate.phone}`}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                                    {selectedCandidate.linkedin && (
                                        <Button size="small" variant="outlined" startIcon={<LinkIcon />} href={selectedCandidate.linkedin} target="_blank" sx={{ textTransform: 'none', borderRadius: '6px' }}>
                                            LinkedIn
                                        </Button>
                                    )}
                                    {selectedCandidate.github && (
                                        <Button size="small" variant="outlined" startIcon={<LinkIcon />} color="secondary" href={selectedCandidate.github} target="_blank" sx={{ textTransform: 'none', borderRadius: '6px' }}>
                                            GitHub
                                        </Button>
                                    )}
                                </Box>
                            </Box>

                            {selectedCandidate.summary && (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, textTransform: 'uppercase', color: 'text.primary', letterSpacing: 0.5 }}>
                                        Professional Summary
                                    </Typography>
                                    <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.secondary', whiteSpace: 'pre-line' }}>
                                        {selectedCandidate.summary}
                                    </Typography>
                                </Box>
                            )}

                            <Box sx={{ mb: 4 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, textTransform: 'uppercase', color: 'text.primary', letterSpacing: 0.5 }}>
                                    Skills
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                                    {selectedCandidate.skills && selectedCandidate.skills.map((skill, idx) => (
                                        <Chip key={idx} label={skill} color="primary" variant="outlined" sx={{ fontWeight: 500 }} />
                                    ))}
                                </Box>
                            </Box>

                            {selectedCandidate.experience && (
                                <Box sx={{ mb: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                        <BusinessCenterIcon color="action" />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.primary', letterSpacing: 0.5 }}>
                                            Experience
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.secondary', whiteSpace: 'pre-line' }}>
                                        {selectedCandidate.experience}
                                    </Typography>
                                </Box>
                            )}

                            {selectedCandidate.education && (
                                <Box sx={{ mb: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                        <SchoolIcon color="action" />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.primary', letterSpacing: 0.5 }}>
                                            Education
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.secondary', whiteSpace: 'pre-line' }}>
                                        {selectedCandidate.education}
                                    </Typography>
                                </Box>
                            )}

                            {selectedCandidate.projects && selectedCandidate.projects.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, textTransform: 'uppercase', color: 'text.primary', letterSpacing: 0.5 }}>
                                        Extracted Projects
                                    </Typography>
                                    <Grid container spacing={1.5}>
                                        {selectedCandidate.projects.map((proj, idx) => (
                                            <Grid item xs={12} sm={6} key={idx}>
                                                <Card variant="outlined" sx={{ borderRadius: '8px', p: 1.5 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {proj}
                                                    </Typography>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}
                        </Box>
                        
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button 
                                variant="contained" 
                                color="error" 
                                startIcon={<DeleteIcon />}
                                onClick={() => handleDelete(selectedCandidate.id)}
                                sx={{ borderRadius: '8px', textTransform: 'none' }}
                            >
                                Delete Candidate
                            </Button>
                        </Box>
                    </Box>
                )}
            </Drawer>
        </Box>
    );
};

export default CandidatesDatabase;
