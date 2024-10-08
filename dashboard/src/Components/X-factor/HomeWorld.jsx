import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Grid, Typography, Button, Card, CardContent, 
  CircularProgress, Tooltip, useTheme, Divider, Chip, LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  BarChart, AddPhotoAlternate, VideoCall, Article,
  Create, CheckCircle
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

// Custom X icon component
const XIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
  </svg>
);

const DashboardCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, #FFD700 0%, #FFF8DC 100%)',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-5px)',
  },
}));

const StatBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.6)',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
}));

const StatIcon = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#FFD700',
  color: '#000000',
}));

const SocialMediaDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/api/media-status/');
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching media data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#ffffff',
      }}>
        <CircularProgress sx={{ color: '#FFD700' }} />
      </Box>
    );
  }

  const twitterStats = {
    followers: 50000,
    mentions: 1200,
    engagement: 3.8,
    trendingTopics: ['#Environment', '#ClimateAction', '#Sustainability', '#GreenTech', '#EcoFriendly'],
  };

  return (
    <Box sx={{ 
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      padding: theme.spacing(3),
    }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {data.divisions.map((division, index) => (
            <Grid item xs={12} md={6} lg={3} key={index}>
              <DivisionCard 
                divisionData={division}
                allData={data}
              />
            </Grid>
          ))}
          <Grid item xs={12} md={6} lg={3}>
            <TwitterStatsCard stats={twitterStats} />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <QuickActionsCard />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const DivisionCard = ({ divisionData, allData }) => {
  const theme = useTheme();

  const getApprovalRate = (type) => {
    const items = allData[type].filter(item => item.division_name === divisionData.name);
    const approvedItems = items.filter(item => item.status === 'Approved');
    return items.length > 0 ? Math.round((approvedItems.length / items.length) * 100) : 0;
  };

  const approvalIcons = {
    images: <AddPhotoAlternate fontSize="small" />,
    videos: <VideoCall fontSize="small" />,
    posts: <Article fontSize="small" />
  };

  return (
    <DashboardCard>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom sx={{ height: 60, display: 'flex', alignItems: 'center', color: '#000000' }}>
          {divisionData.name}
        </Typography>
        <Divider sx={{ my: 2, backgroundColor: 'rgba(0, 0, 0, 0.12)' }} />
        <Box sx={{ flexGrow: 1 }}>
          <StatBox>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">Images</Typography>
              <Typography variant="h5" color="textPrimary">{divisionData.image_count}</Typography>
            </Box>
            <StatIcon>
              <AddPhotoAlternate />
            </StatIcon>
          </StatBox>
          <StatBox>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">Videos</Typography>
              <Typography variant="h5" color="textPrimary">{divisionData.video_count}</Typography>
            </Box>
            <StatIcon>
              <VideoCall />
            </StatIcon>
          </StatBox>
          <StatBox>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">Posts</Typography>
              <Typography variant="h5" color="textPrimary">{divisionData.post_count}</Typography>
            </Box>
            <StatIcon>
              <Article />
            </StatIcon>
          </StatBox>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>Approval Rates</Typography>
          <Grid container spacing={1}>
            {['images', 'videos', 'posts'].map((type) => (
              <Grid item xs={4} key={type}>
                <Tooltip title={`${type.charAt(0).toUpperCase() + type.slice(1)} Approval Rate`}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                      {approvalIcons[type]}
                      <Typography variant="body2" color="textPrimary" sx={{ ml: 0.5 }}>
                        {getApprovalRate(type)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={getApprovalRate(type)} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#FFD700',
                        }
                      }} 
                    />
                  </Box>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </Box>
      </CardContent>
    </DashboardCard>
  );
};

const TwitterStatsCard = ({ stats }) => {
  const theme = useTheme();

  return (
    <DashboardCard>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <XIcon sx={{ mr: 1, color: '#000000' }} />
          <Typography variant="h6" color="textPrimary"> Insights</Typography>
        </Box>
        <Divider sx={{ my: 2, backgroundColor: 'rgba(0, 0, 0, 0.12)' }} />
        <Box sx={{ flexGrow: 1 }}>
          <StatBox>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">Followers</Typography>
              <Typography variant="h5" color="textPrimary">{stats.followers.toLocaleString()}</Typography>
            </Box>
          </StatBox>
          <StatBox>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">Mentions</Typography>
              <Typography variant="h5" color="textPrimary">{stats.mentions}</Typography>
            </Box>
          </StatBox>
          <StatBox>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">Engagement Rate</Typography>
              <Typography variant="h5" color="textPrimary">{stats.engagement}%</Typography>
            </Box>
          </StatBox>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>Trending Topics</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {stats.trendingTopics.map((topic, index) => (
              <Chip 
                key={index} 
                label={topic} 
                size="small" 
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.6)', 
                  color: '#000000',
                  '&:hover': {
                    backgroundColor: '#FFD700',
                  }
                }} 
              />
            ))}
          </Box>
        </Box>
      </CardContent>
    </DashboardCard>
  );
};

const QuickActionsCard = () => {
  const theme = useTheme();

  return (
    <DashboardCard>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom color="textPrimary">Quick Links</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<Create />}
            component={RouterLink}
            to="/compose-tweet"
            fullWidth
            sx={{
              backgroundColor: '#FFD700',
              color: '#000000',
              '&:hover': {
                backgroundColor: '#FFC000',
              }
            }}
          >
            Create Social Media Post
          </Button>
          <Button
            variant="contained"
            startIcon={<BarChart />}
            component={RouterLink}
            to="/analytics"
            fullWidth
            sx={{
              backgroundColor: '#FFD700',
              color: '#000000',
              '&:hover': {
                backgroundColor: '#FFC000',
              }
            }}
          >
            View Analytics
          </Button>
        </Box>
        <Divider sx={{ my: 2, backgroundColor: 'rgba(0, 0, 0, 0.12)' }} />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="body1" color="textSecondary" align="center">
            Access quick actions to manage your social media presence efficiently.
          </Typography>
        </Box>
      </CardContent>
    </DashboardCard>
  );
};

export default SocialMediaDashboard;