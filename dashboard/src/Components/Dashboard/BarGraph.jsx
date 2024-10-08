import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/system';
import axiosInstance from '../utils/axiosInstance';

const DashboardContainer = styled(Box)({
  padding: '40px 20px',
  background: '#e0e5ec',
  borderRadius: '20px',
  minHeight: '100vh',
  overflow: 'hidden',
});

const NeumorphicCard = styled(motion.div)({
  background: '#FFE600',
  borderRadius: '15px',
  padding: '25px',
  boxShadow: '8px 8px 15px #a3b1c6, -8px -8px 15px #ffffff',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '12px 12px 20px #a3b1c6, -12px -12px 20px #ffffff',
  },
});

const StatValue = styled(Typography)({
  fontSize: '2.5rem',
  fontWeight: '700',
  color: '#262b3b',
  marginBottom: '10px',
});

const StatLabel = styled(Typography)({
  fontSize: '1rem',
  fontWeight: '500',
  color: '#262b3b',
  marginBottom: '5px',
});

const ProgressBar = styled(Box)({
  height: '6px',
  background: '#d1d9e6',
  borderRadius: '3px',
  marginTop: '10px',
  position: 'relative',
  overflow: 'hidden',
});

const ProgressFill = styled(motion.div)(({ color }) => ({
  height: '100%',
  borderRadius: '3px',
  background: '#262b3b',
}));

const MinimalistDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance.get('/api/media-stats/')
      .then((response) => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching the data:', error);
        setError('Error fetching the data');
      });
  }, []);

  if (error) {
    return <Typography color="error" variant="h6">{error}</Typography>;
  }

  if (!data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const departments = ['Digital Bharat Nidhi', 'BSNL', 'NBM'];
  const colors = ['#4A90E2', '#50E3C2', '#F5A623'];

  return (
    <DashboardContainer>
      <Typography variant="h4" sx={{ mb: 4, color: '#1a1a1a', fontWeight: '700', textAlign: 'center' }}>
        Media Statistics
      </Typography>
      <Grid container spacing={4}>
        {departments.map((dept, index) => (
          <Grid item xs={12} md={4} key={dept}>
            <NeumorphicCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Box>
                <Typography variant="h6" fontWeight="600" mb={3} color="#333">{dept}</Typography>
                <StatValue>{data[dept].weekly_data.total_images}</StatValue>
                <StatLabel>Total Images</StatLabel>
                <ProgressBar>
                  <ProgressFill
                    color={colors[index]}
                    initial={{ width: 0 }}
                    animate={{ width: `${(data[dept].weekly_data.approved_images / data[dept].weekly_data.total_images) * 100}%` }}
                    transition={{ duration: 1 }}
                  />
                </ProgressBar>
                <Typography variant="body2" mt={1} color="#666">
                  {data[dept].weekly_data.approved_images} Approved
                </Typography>
              </Box>
              <Box mt={4}>
                <StatValue>{data[dept].weekly_data.total_videos}</StatValue>
                <StatLabel>Total Videos</StatLabel>
                <ProgressBar>
                  <ProgressFill
                    color={colors[index]}
                    initial={{ width: 0 }}
                    animate={{ width: `${(data[dept].weekly_data.approved_videos / data[dept].weekly_data.total_videos) * 100}%` }}
                    transition={{ duration: 1 }}
                  />
                </ProgressBar>
                <Typography variant="body2" mt={1} color="#666">
                  {data[dept].weekly_data.approved_videos} Approved
                </Typography>
              </Box>
            </NeumorphicCard>
          </Grid>
        ))}
      </Grid>
    </DashboardContainer>
  );
};

export default MinimalistDashboard;