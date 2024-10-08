import React, { useState, useEffect } from 'react';
import {
  Box, Container, Grid, Typography, Paper, ToggleButton, ToggleButtonGroup,
  CircularProgress, Button, IconButton, useTheme
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { styled, alpha } from '@mui/material/styles';
import {
  BarChartOutlined, ShowChartOutlined, PieChartOutlined,
  RefreshOutlined, DownloadOutlined
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const gold = '#FFD700';
const veryLightBlack = '#2C2C2C'; // Very light black
const darkGray = '#1F1F1F'; // Darker color for icons

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiToggleButton-root': {
    color: gold,
    borderColor: alpha(gold, 0.12),
    '&.Mui-selected': {
      color: veryLightBlack,
      backgroundColor: alpha(gold, 0.12),
    },
    '&:hover': {
      backgroundColor: alpha(gold, 0.08),
    },
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
  transition: 'box-shadow 0.3s ease-in-out',
  backgroundColor: '#4d4d4d',
  color: '#ffffff',
  '&:hover': {
    boxShadow: '0 8px 30px 0 rgba(0, 0, 0, 0.1)',
  },
}));

const COLORS = [gold, '#FF6347', '#FF4500', '#32CD32', '#1E90FF', '#DA70D6', '#FFD700'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const theme = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/media-status/');
      setData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching analytics data');
      setLoading(false);
    }
  };

  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleDownload = () => {
    console.log('Download report');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const processData = (rawData) => {
    const mediaTypes = Object.keys(rawData);
    const mediaSubmissions = mediaTypes.map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: rawData[type].length
    }));

    const allItems = mediaTypes.flatMap(type => rawData[type]);
    const statusCounts = allItems.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});
    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));

    const categoryCounts = allItems.reduce((acc, item) => {
      acc[item.category_name] = (acc[item.category_name] || 0) + 1;
      return acc;
    }, {});
    const contentCategories = Object.entries(categoryCounts).map(([category, count]) => ({
      name: category,
      value: count
    }));

    const submissionDates = allItems.map(item => new Date(item.submitted_on));
    const oldestDate = new Date(Math.min.apply(null, submissionDates));
    const newestDate = new Date(Math.max.apply(null, submissionDates));
    const daysBetween = Math.ceil((newestDate - oldestDate) / (1000 * 60 * 60 * 24));
    
    const submissionTrend = Array.from({ length: daysBetween }, (_, i) => {
      const date = new Date(oldestDate);
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split('T')[0],
        count: allItems.filter(item => item.submitted_on.startsWith(date.toISOString().split('T')[0])).length
      };
    });

    return {
      mediaSubmissions,
      statusDistribution,
      contentCategories,
      submissionTrend
    };
  };

  const processedData = data ? processData(data) : null;

  const renderChart = (chartData, title) => {
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkGray} />
              <XAxis dataKey="name" stroke={gold} />
              <YAxis stroke={gold} />
              <Tooltip
                contentStyle={{
                  backgroundColor: veryLightBlack,
                  border: `1px solid ${gold}`,
                  color: gold
                }}
              />
              <Legend />
              <Bar dataKey="value" fill={gold} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkGray} />
              <XAxis dataKey="name" stroke={gold} />
              <YAxis stroke={gold} />
              <Tooltip
                contentStyle={{
                  backgroundColor: veryLightBlack,
                  border: `1px solid ${gold}`,
                  color: gold
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="value" stroke={gold} fill={alpha(gold, 0.2)} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: veryLightBlack,
                  border: `1px solid ${gold}`,
                  color: gold
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <IconButton onClick={handleRefresh} color="primary" sx={{ mr: 2 }}>
          <RefreshOutlined sx={{ color: darkGray }} />
        </IconButton>
        <IconButton onClick={handleDownload} color="primary">
          <DownloadOutlined sx={{ color: darkGray }} />
        </IconButton>
      </Box>

      {/* Chart Type Toggle */}
      <StyledToggleButtonGroup
        value={chartType}
        exclusive
        onChange={handleChartTypeChange}
      >
        <ToggleButton value="bar" aria-label="bar chart">
          <BarChartOutlined sx={{ color: darkGray }} />
        </ToggleButton>
        <ToggleButton value="line" aria-label="line chart">
          <ShowChartOutlined sx={{ color: darkGray }} />
        </ToggleButton>
        <ToggleButton value="pie" aria-label="pie chart">
          <PieChartOutlined sx={{ color: darkGray }} />
        </ToggleButton>
      </StyledToggleButtonGroup>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>Media Submissions</Typography>
            {processedData && renderChart(processedData.mediaSubmissions, 'Media Submissions')}
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>Status Distribution</Typography>
            {processedData && renderChart(processedData.statusDistribution, 'Status Distribution')}
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>Content Categories</Typography>
            {processedData && renderChart(processedData.contentCategories, 'Content Categories')}
          </StyledPaper>
        </Grid>
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Typography variant="h6" gutterBottom>Submission Trend</Typography>
            {processedData && renderChart(processedData.submissionTrend, 'Submission Trend')}
          </StyledPaper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;
