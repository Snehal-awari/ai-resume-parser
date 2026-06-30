import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, TextField, Alert, CircularProgress, Divider, Snackbar } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ReviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    
    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [github, setGithub] = useState('');
    const [skills, setSkills] = useState('');
    const [experience, setExperience] = useState('');
    const [education, setEducation] = useState('');
    const [projects, setProjects] = useState('');
    const [summary, setSummary] = useState('');
    const [resumeFileName, setResumeFileName] = useState('');

    useEffect(() => {
        const fetchCandidate = async () => {
            try {
                const response = await axios.get(`/api/candidates/${id}`);
                const data = response.data;
                setName(data.name || '');
                setEmail(data.email || '');
                setPhone(data.phone || '');
                setLinkedin(data.linkedin || '');
                setGithub(data.github || '');
                setSkills(data.skills ? data.skills.join(', ') : '');
                setExperience(data.experience || '');
                setEducation(data.education || '');
                setProjects(data.projects ? data.projects.join(', ') : '');
                setSummary(data.summary || '');
                setResumeFileName(data.resumeFileName || '');
            } catch (err) {
                console.error("Failed to load candidate: ", err);
                setError('Failed to fetch candidate details.');
            } finally {
                setLoading(false);
            }
        };

        fetchCandidate();
    }, [id]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        // Parse comma-separated text back into arrays of strings
        const parsedSkills = skills.split(',').map(s => s.trim()).filter(s => s !== '');
        const parsedProjects = projects.split(',').map(p => p.trim()).filter(p => p !== '');

        const payload = {
            id,
            name,
            email,
            phone,
            linkedin,
            github,
            skills: parsedSkills,
            experience,
            education,
            projects: parsedProjects,
            summary,
            resumeFileName
        };

        try {
            await axios.put(`/api/candidates/${id}`, payload);
            setToast({ open: true, message: 'Candidate details saved successfully.', severity: 'success' });
            setTimeout(() => {
                navigate('/candidates');
            }, 1000);
        } catch (err) {
            console.error("Failed to save candidate: ", err);
            setError(err.response?.data?.message || 'Error occurred while saving candidate.');
            setToast({ open: true, message: 'Failed to save changes.', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = async () => {
        if (window.confirm('Are you sure you want to discard this candidate record? This will permanently delete it.')) {
            try {
                await axios.delete(`/api/candidates/${id}`);
                setToast({ open: true, message: 'Candidate record discarded.', severity: 'info' });
                setTimeout(() => {
                    navigate('/upload');
                }, 1000);
            } catch (err) {
                console.error("Failed to discard candidate: ", err);
                setError('Failed to discard/delete the record.');
            }
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Button 
                    variant="text" 
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/upload')}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    Back to Upload
                </Button>
                <Divider orientation="vertical" flexItem />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Review Extracted Profile
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

            <Card sx={{ borderRadius: '20px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        File: {resumeFileName || 'resume.pdf'}
                    </Typography>

                    <form onSubmit={handleSave}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Candidate Name"
                                    fullWidth
                                    variant="outlined"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Email Address"
                                    type="email"
                                    fullWidth
                                    variant="outlined"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Phone Number"
                                    fullWidth
                                    variant="outlined"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="LinkedIn Profile"
                                    fullWidth
                                    variant="outlined"
                                    value={linkedin}
                                    onChange={(e) => setLinkedin(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="GitHub Profile"
                                    fullWidth
                                    variant="outlined"
                                    value={github}
                                    onChange={(e) => setGithub(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Technical Skills (Comma Separated)"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    variant="outlined"
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    placeholder="Java, React, MySQL, AWS, Docker"
                                    helperText="Separate skills with commas"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                            
                            <Grid item xs={12}>
                                <TextField
                                    label="Project Titles (Comma Separated)"
                                    fullWidth
                                    variant="outlined"
                                    value={projects}
                                    onChange={(e) => setProjects(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    placeholder="Resume Parser Application, E-Commerce Platform"
                                    helperText="Separate projects with commas"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Experience Details"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    variant="outlined"
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Education Details"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                    value={education}
                                    onChange={(e) => setEducation(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Professional Summary"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    variant="outlined"
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                                />
                            </Grid>

                            {/* Action Buttons */}
                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteIcon />}
                                    onClick={handleDiscard}
                                    sx={{ borderRadius: '10px', textTransform: 'none', px: 3 }}
                                >
                                    Discard
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    startIcon={<SaveIcon />}
                                    disabled={saving}
                                    sx={{ borderRadius: '10px', textTransform: 'none', px: 4 }}
                                >
                                    {saving ? 'Saving...' : 'Save Candidate'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>

            <Snackbar
                open={toast.open}
                autoHideDuration={4000}
                onClose={() => setToast({ ...toast, open: false })}
                message={toast.message}
            />
        </Box>
    );
};

export default ReviewPage;
