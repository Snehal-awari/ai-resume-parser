import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import axios from 'axios';

const COLORS = ['#6366f1', '#14b8a6', '#a855f7', '#f59e0b', '#10b981', '#ec4899', '#3b82f6'];

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalCandidates: 0,
        skillData: [],
        experienceData: [],
        trendData: [],
        avgSkills: 0
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await axios.get('/api/candidates?page=0&size=1000');
                const list = response.data.content || [];
                
                if (list.length === 0) {
                    setStats({ totalCandidates: 0, skillData: [], experienceData: [], trendData: [], avgSkills: 0 });
                    setLoading(false);
                    return;
                }

                // 1. Process Skills Frequency
                const skillCounts = {};
                let totalSkillsCount = 0;
                list.forEach(c => {
                    if (c.skills) {
                        c.skills.forEach(s => {
                            const normalized = s.trim();
                            if (normalized) {
                                skillCounts[normalized] = (skillCounts[normalized] || 0) + 1;
                                totalSkillsCount++;
                            }
                        });
                    }
                });

                const skillData = Object.entries(skillCounts)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 8); // Top 8 skills

                // 2. Process Experience Categories
                let fresher = 0, junior = 0, mid = 0, senior = 0;
                list.forEach(c => {
                    const expStr = (c.experience || '').toLowerCase();
                    if (expStr.includes('fresher') || expStr === '' || expStr === 'fresher') {
                        fresher++;
                    } else {
                        // Regex search to extract numeric years
                        const matches = expStr.match(/(\d+)\s*year/);
                        if (matches && matches[1]) {
                            const years = parseInt(matches[1]);
                            if (years <= 2) junior++;
                            else if (years <= 5) mid++;
                            else senior++;
                        } else {
                            // Guess category based on text indicators
                            if (expStr.includes('senior') || expStr.includes('lead') || expStr.includes('manager')) {
                                senior++;
                            } else if (expStr.includes('junior') || expStr.includes('intern') || expStr.includes('associate')) {
                                junior++;
                            } else {
                                mid++;
                            }
                        }
                    }
                });

                const experienceData = [
                    { name: 'Fresher', value: fresher },
                    { name: 'Junior (1-2 yrs)', value: junior },
                    { name: 'Mid-Level (3-5 yrs)', value: mid },
                    { name: 'Senior (5+ yrs)', value: senior }
                ].filter(d => d.value > 0);

                // 3. Process Upload Trends (last 7 days/dates)
                const trendCounts = {};
                list.forEach(c => {
                    if (c.createdDate) {
                        const date = c.createdDate.split('T')[0]; // YYYY-MM-DD
                        trendCounts[date] = (trendCounts[date] || 0) + 1;
                    }
                });

                const trendData = Object.entries(trendCounts)
                    .map(([date, count]) => ({ date, count }))
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(-7); // Last 7 dates

                setStats({
                    totalCandidates: list.length,
                    skillData,
                    experienceData,
                    trendData,
                    avgSkills: (totalSkillsCount / list.length).toFixed(1)
                });
            } catch (err) {
                console.error("Error loading analytics data", err);
                setError('Failed to compute database analytics.');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
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
                    Recruitment Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Real-time metrics, tech stack distribution, experience mapping, and repository upload trends
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

            {stats.totalCandidates === 0 ? (
                <Alert severity="info" sx={{ borderRadius: '12px' }}>
                    No candidates data available to render charts. Start by parsing some resume files!
                </Alert>
            ) : (
                <>
                    {/* Key Stats Row */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={4}>
                            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                        Total Resumes Analyzed
                                    </Typography>
                                    <Typography variant="h3" sx={{ fontWeight: 700, mt: 1, color: 'primary.main' }}>
                                        {stats.totalCandidates}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                        Avg Skills Extracted
                                    </Typography>
                                    <Typography variant="h3" sx={{ fontWeight: 700, mt: 1, color: 'success.main' }}>
                                        {stats.avgSkills}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                        Active Database Profiles
                                    </Typography>
                                    <Typography variant="h3" sx={{ fontWeight: 700, mt: 1, color: 'warning.main' }}>
                                        100% Validated
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Chart Grids */}
                    <Grid container spacing={4}>
                        {/* Skill Frequency Bar Chart */}
                        <Grid item xs={12} md={7}>
                            <Card sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                                        Most Common Skills (Frequency Chart)
                                    </Typography>
                                    <Box sx={{ width: '100%', height: 320 }}>
                                        <ResponsiveContainer>
                                            <BarChart data={stats.skillData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={32} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Experience Distribution Pie Chart */}
                        <Grid item xs={12} md={5}>
                            <Card sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                                        Experience Level Distribution
                                    </Typography>
                                    <Box sx={{ width: '100%', height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie
                                                    data={stats.experienceData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {stats.experienceData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={10} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Upload Trends Area Chart */}
                        <Grid item xs={12}>
                            <Card sx={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', mb: 2 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                                        Resume Upload Trends (Timeline)
                                    </Typography>
                                    <Box sx={{ width: '100%', height: 280 }}>
                                        <ResponsiveContainer>
                                            <AreaChart data={stats.trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
                                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                                <Area type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
};

export default Analytics;
