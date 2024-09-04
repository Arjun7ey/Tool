import React from 'react';
import { Container, Grid, Typography, Paper,Box  } from '@mui/material';
import DashboardMain from './DashboardMain';
import ChartComponent from './ChartComponent';
import BarGraph from './BarGraph';
import RecentActivity from './RecentActivity';
import ImageSlider from './ImageSlider'; 
import Messenger from '../Messenger/Messenger'; 

const Home = () => {
  return (
    <Container maxWidth="xl">
      <Grid container spacing={4} alignItems="flex-start">
        {/* Main Dashboard Section */}
        <Grid item xs={12} md={8}>
          <DashboardMain />
          <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
            <Typography variant="h6" gutterBottom style={{ fontWeight: 'bold' }}>
                Social Media Platforms
            </Typography>
            <ChartComponent />
            </Paper>
            <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
            <Box mt={4}> {/* Adds margin-top to create space between the components */}
                <Typography variant="h6" gutterBottom style={{ fontWeight: 'bold' }}>
                    Weekly Analysis
                </Typography>
                <BarGraph />
            </Box>
        </Paper>
          
        </Grid>
        
        <Grid item xs={12} md={4} style={{ height: '100%' }}>
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    {/* Image Slider Section */}
    <Paper elevation={3} style={{ padding: '20px', marginBottom: '20px', flexGrow: 1 }}>
      <Typography variant="h6" gutterBottom style={{ marginBottom: '20px', fontWeight: 'bold', color: '#333' }}>
        Approved Media
      </Typography>
      <div style={{ height: '100%' }}>
        <ImageSlider />
      </div>
    </Paper>

    {/* Recent Activity Section */}
    <Paper elevation={3} style={{ padding: '20px' }}>
      <Typography variant="h6" gutterBottom style={{ fontWeight: 'bold', color: '#333' }}>
        Recent Activities
      </Typography>
      <RecentActivity />
    </Paper>
  </div>
</Grid>


      </Grid>
    </Container>
  );
};

export default Home;
