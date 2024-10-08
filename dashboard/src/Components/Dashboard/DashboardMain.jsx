import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/system';
import axiosInstance from '../utils/axiosInstance';
import { BASE_URL } from '../../config';


const DashboardContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFFE0 100%)',
  borderRadius: '16px',
  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
  color: '#000000',
}));

const ChartContainer = styled(Box)({
  marginTop: '20px',
});

const BarContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '15px',
});

const BarLabel = styled(Typography)({
  minWidth: '150px',
  marginRight: '15px',
  fontWeight: 'bold',
});

const BarBackground = styled(Box)({
  flex: 1,
  height: '30px',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '15px',
  overflow: 'hidden',
});

const Bar = styled(motion.div)(({ $color }) => ({
  height: '100%',
  background: `linear-gradient(90deg, ${$color} 0%, ${$color}99 100%)`,
  borderRadius: '15px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  paddingRight: '10px',
}));

const BarValue = styled(Typography)({
  fontWeight: 'bold',
  color: '#000000',
});

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '200px',
});

const DashboardMain = () => {
  const [approvalRates, setApprovalRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchApprovalRates = async () => {
      try {
        const response = await axiosInstance.get('/api/media-stats/');
        setApprovalRates({
          digitalBharatNidhi: Math.round(response.data['Digital Bharat Nidhi'].approval_percentage),
          bsnl: Math.round(response.data['BSNL'].approval_percentage),
          nbm: Math.round(response.data['NBM'].approval_percentage),
        });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching approval rates:', err);
        setError('Error fetching data. Please try again later.');
        setLoading(false);
      }
    };

    fetchApprovalRates();
  }, []);

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress sx={{ color: '#FFD700' }} />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <LoadingContainer>
        <Typography variant="h6" sx={{ color: 'red' }}>{error}</Typography>
      </LoadingContainer>
    );
  }

  const departments = [
    { name: 'Digital Bharat Nidhi', value: approvalRates.digitalBharatNidhi, color: '#4facfe' },
    { name: 'BSNL', value: approvalRates.bsnl, color: '#00f2fe' },
    { name: 'NBM', value: approvalRates.nbm, color: '#00ff9d' },
  ];

  return (
    <DashboardContainer>
      <Typography variant="h5" gutterBottom>
        Department Approval Rates
      </Typography>
      <ChartContainer>
        {departments.map((dept, index) => (
          <BarContainer key={dept.name}>
            <BarLabel>{dept.name}</BarLabel>
            <BarBackground>
              <Bar
                $color={dept.color}
                initial={{ width: 0 }}
                animate={{ width: `${dept.value}%` }}
                transition={{ duration: 1, delay: index * 0.2 }}
              >
                <BarValue>{`${dept.value}%`}</BarValue>
              </Bar>
            </BarBackground>
          </BarContainer>
        ))}
      </ChartContainer>
    </DashboardContainer>
  );
};

export default DashboardMain;