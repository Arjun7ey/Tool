import React, { useEffect } from 'react';
import { Container, Grid, Typography, Paper, Box, useTheme, Button } from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import DashboardMain from './DashboardMain';
import ChartComponent from './ChartComponent';
import BarGraph from './BarGraph';
import RecentActivity from './RecentActivity';
import ImageSlider from './ImageSlider';

const MotionPaper = motion(Paper);

const Home = () => {
  const theme = useTheme();
  const controls = useAnimation();

  useEffect(() => {
    controls.start(i => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2 }
    }));
  }, [controls]);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, pt: '80px', position: 'relative' }}>
      {/* New Button for Awesome Pages in upper right corner */}
      <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 1 }}>
        <Button
          component={Link}
          to="/homeworld"
          variant="contained"
          size="large"
          sx={{
            borderRadius: '50px',
            padding: '10px 20px',
            fontSize: '1rem',
            fontWeight: 'bold',
            textTransform: 'none',
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            color: 'white',
            boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 6px 10px 4px rgba(255, 105, 135, .4)',
            }
          }}
        >
          Insights
        </Button>
      </Box>

      {/* Main Content */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <MotionPaper
            elevation={3}
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
            custom={0}
            sx={{
              p: 3,
              background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
              borderRadius: '15px',
              boxShadow: '10px 10px 20px #d9d9d9, -10px -10px 20px #ffffff',
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: 'linear-gradient(90deg, #FFD700, #000000)',
              }
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#000000' }}>
              Approval Rate
            </Typography>
            <DashboardMain />
          </MotionPaper>

          <MotionPaper
            elevation={3}
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
            custom={1}
            sx={{
              p: 3,
              mt: 4,
              background: '#ffffff',
              borderRadius: '15px',
              boxShadow: '5px 5px 15px #d9d9d9, -5px -5px 15px #ffffff',
              overflow: 'hidden'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#000000' }}>
              Social Media Platforms
            </Typography>
            <ChartComponent />
          </MotionPaper>

          <MotionPaper
            elevation={3}
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
            custom={2}
            sx={{
              p: 3,
              mt: 4,
              background: '#ffffff',
              borderRadius: '15px',
              boxShadow: '5px 5px 15px #d9d9d9, -5px -5px 15px #ffffff',
              overflow: 'hidden'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#000000' }}>
              Weekly Analysis
            </Typography>
            <BarGraph />
          </MotionPaper>
        </Grid>

        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
          <MotionPaper
            elevation={3}
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
            custom={3}
            sx={{
              p: 3,
              background: '#ffffff',
              borderRadius: '15px',
              boxShadow: '5px 5px 15px #d9d9d9, -5px -5px 15px #ffffff',
              overflow: 'hidden',
              mb: 4,
              flex: 1
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#000000' }}>
              Approved Media
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)' }}>
              <ImageSlider />
            </Box>
          </MotionPaper>

          <MotionPaper
            elevation={3}
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
            custom={4}
            sx={{
              p: 3,
              background: '#ffffff',
              borderRadius: '15px',
              boxShadow: '5px 5px 15px #d9d9d9, -5px -5px 15px #ffffff',
              overflow: 'hidden',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#000000' }}>
              Recent Activities
            </Typography>
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <RecentActivity />
            </Box>
          </MotionPaper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
