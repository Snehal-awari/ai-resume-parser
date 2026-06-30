import React, { useState, useRef } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, List, ListItem, ListItemIcon, ListItemText, LinearProgress, Alert, Paper, IconButton } from '@mui/material';
import { useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditNoteIcon from '@mui/icons-material/EditNote';

const UploadResume = () => {
    const navigate = useNavigate();
    const {
        files,
        setFiles,
        uploading,
        setUploading,
        globalError,
        setGlobalError,
        globalSuccess,
        setGlobalSuccess,
        parsedCount,
        setParsedCount
    } = useOutletContext();
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        processSelectedFiles(droppedFiles);
    };

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        processSelectedFiles(selectedFiles);
    };

    const processSelectedFiles = (newFiles) => {
        setGlobalError('');
        setGlobalSuccess('');
        const pdfFiles = newFiles.filter(file => {
            const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
            if (!isPdf) {
                setGlobalError('Only PDF files are supported.');
            }
            return isPdf;
        });

        const formatted = pdfFiles.map(file => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            status: 'Pending', // Pending, Uploading, Success, Error
            progress: 0,
            candidateId: null,
            errorMsg: ''
        }));

        setFiles(prev => [...prev, ...formatted]);
    };

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const triggerFileSelect = () => {
        fileInputRef.current.click();
    };

    const uploadAndParseAll = async () => {
        const pendingFiles = files.filter(f => f.status === 'Pending' || f.status === 'Error');
        if (pendingFiles.length === 0) {
            setGlobalError('No files selected for parsing.');
            return;
        }

        setUploading(true);
        setGlobalError('');
        setGlobalSuccess('');

        // Parse concurrently/sequentially
        for (let item of pendingFiles) {
            updateFileStatus(item.id, { status: 'Uploading', progress: 30 });
            
            const formData = new FormData();
            formData.append('file', item.file);

            try {
                const response = await axios.post('/api/resume/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        updateFileStatus(item.id, { progress: Math.min(percentCompleted, 90) });
                    }
                });

                updateFileStatus(item.id, { 
                    status: 'Success', 
                    progress: 100, 
                    candidateId: response.data.id 
                });
                
                setParsedCount(prev => prev + 1);
            } catch (err) {
                console.error("Failed parsing: ", item.name, err);
                let msg = err.response?.data?.message || "Something went wrong";
                if (err.response?.status === 409) {
                    msg = "Duplicate resume. This candidate already exists.";
                    setGlobalError(msg);
                }
                updateFileStatus(item.id, { 
                    status: 'Error', 
                    progress: 0, 
                    errorMsg: msg 
                });
            }
        }

        setUploading(false);
        setGlobalSuccess('Resume parsing operations completed.');
    };

    const updateFileStatus = (id, updates) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const handleExportExcel = async () => {
        try {
            const candidateIds = files.filter(f => f.status === 'Success' && f.candidateId).map(f => f.candidateId);
            if (candidateIds.length === 0) return;

            const response = await axios.get('/api/resumes/export/excel', {
                params: { ids: candidateIds.join(',') },
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
        setFiles([]);
        setParsedCount(0);
        setGlobalError('');
        setGlobalSuccess('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleResetSelectedFiles = () => {
        setFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleReview = (candidateId) => {
        navigate(`/review/${candidateId}`);
    };

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                        Upload Resumes
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Drop candidate PDF files to extract profile fields instantly using Gemini AI
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                   
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleExportExcel}
                        disabled={parsedCount === 0}
                        sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600 }}
                    >
                        Export All as Excel
                    </Button>
                </Box>
            </Box>

            {globalError && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{globalError}</Alert>}
            {globalSuccess && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{globalSuccess}</Alert>}

            <Grid container spacing={4}>
                {/* Drag and Drop Zone */}
                <Grid item xs={12} md={6}>
                    <Paper
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={triggerFileSelect}
                        sx={{
                            p: 6,
                            textAlign: 'center',
                            cursor: 'pointer',
                            borderRadius: '20px',
                            border: '2px dashed',
                            borderColor: dragging ? 'primary.main' : 'divider',
                            bgcolor: dragging ? 'action.hover' : 'background.paper',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 280,
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: 'action.hover'
                            }
                        }}
                    >
                        <input
                            type="file"
                            multiple
                            accept="application/pdf"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />
                        <Box sx={{
                            p: 2,
                            borderRadius: '50%',
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                            mb: 2,
                            display: 'flex'
                        }}>
                            <CloudUploadIcon sx={{ fontSize: 48 }} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            Drag & drop your files here
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Only PDF documents are supported for resume extraction
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{ borderRadius: '8px', textTransform: 'none', px: 3 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                triggerFileSelect();
                            }}
                        >
                            Select Files
                        </Button>
                    </Paper>
                </Grid>

                {/* Selected Files & Status */}
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: '20px', height: '100%', minHeight: 280 }}>
                        <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                                Selected Files ({files.length})
                            </Typography>

                            {files.length === 0 ? (
                                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', py: 4 }}>
                                    No files selected. Drag files or click "Select Files".
                                </Box>
                            ) : (
                                <>
                                    <List sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 260, mb: 2 }}>
                                        {files.map((item) => (
                                            <ListItem
                                                key={item.id}
                                                secondaryAction={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {item.status === 'Success' && (
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                color="primary"
                                                                startIcon={<EditNoteIcon />}
                                                                onClick={() => handleReview(item.candidateId)}
                                                                sx={{ borderRadius: '6px', textTransform: 'none' }}
                                                            >
                                                                Review
                                                            </Button>
                                                        )}
                                                        <IconButton 
                                                            disabled={uploading} 
                                                            onClick={() => removeFile(item.id)}
                                                            color="error"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </Box>
                                                }
                                                sx={{
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    borderRadius: '12px',
                                                    mb: 1,
                                                    px: 2
                                                }}
                                            >
                                                <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                                                    {item.status === 'Success' ? (
                                                        <CheckCircleIcon color="success" />
                                                    ) : item.status === 'Error' ? (
                                                        <CancelIcon color="error" />
                                                    ) : (
                                                        <InsertDriveFileIcon />
                                                    )}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={item.name}
                                                    secondary={
                                                        <Box sx={{ width: '80%', mt: 0.5 }}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {item.size} | {item.status === 'Error' ? `Error: ${item.errorMsg}` : item.status}
                                                            </Typography>
                                                            {(item.status === 'Uploading' || item.status === 'Pending' && uploading) && (
                                                                <LinearProgress variant="determinate" value={item.progress} sx={{ mt: 1, height: 4, borderRadius: 2 }} />
                                                            )}
                                                        </Box>
                                                    }
                                                    primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 600, noWrap: true }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        fullWidth
                                        onClick={uploadAndParseAll}
                                        disabled={uploading || files.filter(f => f.status === 'Pending').length === 0}
                                        sx={{
                                            py: 1.5,
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 600
                                        }}
                                    >
                                        {uploading ? 'Processing Resume Parser...' : 'Upload & Parse'}
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="large"
                                        fullWidth
                                        onClick={handleResetSelectedFiles}
                                        disabled={uploading}
                                        sx={{
                                            mt: 1.5,
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontWeight: 600
                                        }}
                                    >
                                        Reset Selected Files
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UploadResume;
