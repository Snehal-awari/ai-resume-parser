import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, TextField, MenuItem, Grid, Divider, CircularProgress, Alert, Chip, Paper } from '@mui/material';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarsIcon from '@mui/icons-material/Stars';

const AiMatchCenter = () => {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandId, setSelectedCandId] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [loadingList, setLoadingList] = useState(true);
    const [loadingMatch, setLoadingMatch] = useState(false);
    const [error, setError] = useState('');
    const [matchResult, setMatchResult] = useState(null);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const response = await axios.get('/api/candidates?page=0&size=1000&sortBy=name&direction=ASC');
                setCandidates(response.data.content || []);
            } catch (err) {
                console.error("Error loading candidates: ", err);
                setError('Failed to load candidates dropdown.');
            } finally {
                setLoadingList(false);
            }
        };

        fetchCandidates();
    }, []);

    const handleMatch = async (e) => {
        e.preventDefault();
        if (!selectedCandId) {
            setError('Please select a candidate first.');
            return;
        }
        if (!jobDescription.trim()) {
            setError('Please enter a job description.');
            return;
        }

        setLoadingMatch(true);
        setError('');
        setMatchResult(null);

        try {
            const response = await axios.post(`/api/candidates/${selectedCandId}/match`, { jobDescription });
            // The controller returns a JSON string, which Axios automatically parses if it is valid JSON
            // If it is a string representation of JSON, we might need to parse it ourselves
            let resultData = response.data;
            if (typeof resultData === 'string') {
                resultData = JSON.parse(resultData);
            }
            setMatchResult(resultData);
        } catch (err) {
            console.error("Error calculating candidate match: ", err);
            setError(err.response?.data?.message || 'Error occurred while analyzing candidates match score.');
        } finally {
            setLoadingMatch(false);
        }
    };

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                    AI Match Center
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Evaluate candidate CV profiles against specific job specifications using Google Gemini AI
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

            <Grid container spacing={4}>
                {/* Form Input Card */}
                <Grid item xs={12} md={5}>
                    <Card sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                                Match Specification
                            </Typography>

                            <form onSubmit={handleMatch}>
                                <TextField
                                    select
                                    label="Select Candidate"
                                    fullWidth
                                    variant="outlined"
                                    value={selectedCandId}
                                    onChange={(e) => setSelectedCandId(e.target.value)}
                                    disabled={loadingList || loadingMatch}
                                    sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                >
                                    {loadingList ? (
                                        <MenuItem value="">Loading candidates...</MenuItem>
                                    ) : candidates.length === 0 ? (
                                        <MenuItem value="">No candidates available</MenuItem>
                                    ) : (
                                        candidates.map(cand => (
                                            <MenuItem key={cand.id} value={cand.id}>
                                                {cand.name} ({cand.email})
                                            </MenuItem>
                                        ))
                                    )}
                                </TextField>

                                <TextField
                                    label="Job Description"
                                    fullWidth
                                    multiline
                                    rows={8}
                                    variant="outlined"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    disabled={loadingMatch}
                                    placeholder="Paste job responsibilities, required skills, tools, and experience level here..."
                                    sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    fullWidth
                                    disabled={loadingMatch || loadingList}
                                    sx={{
                                        py: 1.5,
                                        borderRadius: '10px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)'
                                    }}
                                >
                                    {loadingMatch ? <CircularProgress size={24} color="inherit" /> : 'Analyze Match'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Match Results Display */}
                <Grid item xs={12} md={7}>
                    {loadingMatch ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 350 }}>
                            <CircularProgress size={50} sx={{ mb: 2 }} />
                            <Typography variant="body1" color="text.secondary">
                                Analyzing candidate profile against requirements...
                            </Typography>
                        </Box>
                    ) : matchResult ? (
                        <Card sx={{ borderRadius: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        AI Evaluation Report
                                    </Typography>
                                    
                                    {/* Score Display Circle */}
                                    <Box sx={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                                        color: 'white',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 8px 16px rgba(79, 70, 229, 0.2)'
                                    }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>
                                            {matchResult.matchScore}%
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 700 }}>
                                            MATCH
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ mb: 3 }} />

                                {/* Matched Skills */}
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                        <CheckCircleIcon color="success" />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            Matched Skills
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {matchResult.matchedSkills && matchResult.matchedSkills.map((skill, idx) => (
                                            <Chip key={idx} label={skill} color="success" variant="outlined" sx={{ fontWeight: 550 }} />
                                        ))}
                                        {(!matchResult.matchedSkills || matchResult.matchedSkills.length === 0) && (
                                            <Typography variant="body2" color="text.secondary">No matching skills identified.</Typography>
                                        )}
                                    </Box>
                                </Box>

                                {/* Missing Skills */}
                                <Box sx={{ mb: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                        <CancelIcon color="error" />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            Missing Requirements
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {matchResult.missingSkills && matchResult.missingSkills.map((skill, idx) => (
                                            <Chip key={idx} label={skill} color="error" variant="outlined" sx={{ fontWeight: 550 }} />
                                        ))}
                                        {(!matchResult.missingSkills || matchResult.missingSkills.length === 0) && (
                                            <Typography variant="body2" color="text.secondary">All core requirements appear to be met.</Typography>
                                        )}
                                    </Box>
                                </Box>

                                {/* Final Recommendation */}
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                        <StarsIcon color="primary" />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                            AI Recommendation
                                        </Typography>
                                    </Box>
                                    <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                                        <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'text.secondary', whiteSpace: 'pre-line' }}>
                                            {matchResult.recommendation}
                                        </Typography>
                                    </Paper>
                                </Box>
                            </CardContent>
                        </Card>
                    ) : (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            minHeight: 350,
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: '20px',
                            color: 'text.secondary',
                            p: 4,
                            textAlign: 'center'
                        }}>
                            <StarsIcon sx={{ fontSize: 48, mb: 2, color: 'action.disabled' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                Match Report Preview
                            </Typography>
                            <Typography variant="body2">
                                Select a candidate and specify the job requirements to generate a complete match report.
                            </Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default AiMatchCenter;
