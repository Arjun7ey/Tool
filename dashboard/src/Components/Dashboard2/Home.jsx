import React, { useContext, useState } from 'react';
import { Grid, AppBar, Toolbar, Typography, IconButton, CssBaseline, Container, Paper, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { ThemeContext } from '../../Contexts/ThemeContext';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const Home = () => {
  const { theme, setSpecificTheme, currentTheme } = useContext(ThemeContext);
  const muiTheme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setSpecificTheme(newTheme);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Hardcoded data for the dashboard
  const mediaData = {
    Marketing: {
      total_images: 120,
      approved_images: 100,
      total_videos: 50,
      approved_videos: 45,
      approval_percentage: 83.33,
      weekly_data: {
        total_images: [10, 20, 30, 40, 50, 60, 70],
        total_videos: [5, 10, 15, 20, 25, 30, 35],
      },
    },
    Sales: {
      total_images: 80,
      approved_images: 70,
      total_videos: 30,
      approved_videos: 25,
      approval_percentage: 87.50,
      weekly_data: {
        total_images: [8, 16, 24, 32, 40, 48, 56],
        total_videos: [4, 8, 12, 16, 20, 24, 28],
      },
    },
    HR: {
      total_images: 60,
      approved_images: 50,
      total_videos: 20,
      approved_videos: 18,
      approval_percentage: 85.00,
      weekly_data: {
        total_images: [6, 12, 18, 24, 30, 36, 42],
        total_videos: [3, 6, 9, 12, 15, 18, 21],
      },
    },
  };

  const departments = Object.keys(mediaData);

  const chartData = {
    labels: departments,
    datasets: [
      {
        label: 'Weekly Images Submitted',
        data: departments.map((dept) => mediaData[dept].weekly_data.total_images.reduce((a, b) => a + b, 0)),
        backgroundColor: muiTheme.palette.primary.main,
      },
      {
        label: 'Weekly Videos Submitted',
        data: departments.map((dept) => mediaData[dept].weekly_data.total_videos.reduce((a, b) => a + b, 0)),
        backgroundColor: muiTheme.palette.secondary.main,
      },
    ],
  };

  return (
    <div style={{ backgroundColor: currentTheme.palette.background.default, color: currentTheme.palette.text.primary, minHeight: '100vh', display: 'flex' }}>
      <CssBaseline />
  
      <Drawer variant="temporary" open={sidebarOpen} onClose={toggleSidebar}>
        <List>
          {departments.map((dept, index) => (
            <ListItem button key={index}>
              <ListItemText primary={dept} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <main style={{ flexGrow: 1, padding: '80px 20px 20px 20px', overflowY: 'auto' }}>
        <Container>
          <Grid container spacing={4}>
            {departments.map((dept, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  <Paper style={{ padding: '20px', backgroundColor: muiTheme.palette.background.paper }}>
                    <Typography variant="h5" style={{ marginBottom: '10px' }}>{dept}</Typography>
                    <Typography>Total Images: {mediaData[dept].total_images}</Typography>
                    <Typography>Approved Images: {mediaData[dept].approved_images}</Typography>
                    <Typography>Total Videos: {mediaData[dept].total_videos}</Typography>
                    <Typography>Approved Videos: {mediaData[dept].approved_videos}</Typography>
                    <Typography variant="body2" color="secondary">
                      Approval Rate: {mediaData[dept].approval_percentage}%
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                <Paper style={{ padding: '20px', backgroundColor: muiTheme.palette.background.paper }}>
                  <Typography variant="h6" style={{ marginBottom: '20px', color: muiTheme.palette.text.primary }}>
                    Weekly Media Submission Stats
                  </Typography>
                  <div style={{ height: '300px' }}>
                    <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </Paper>
              </motion.div>
            </Grid>
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                <TableContainer component={Paper} style={{ backgroundColor: muiTheme.palette.background.paper }}>
                  <Typography variant="h6" style={{ padding: '16px', color: muiTheme.palette.text.primary }}>
                    Department Stats
                  </Typography>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ color: muiTheme.palette.text.secondary }}>Department</TableCell>
                        <TableCell style={{ color: muiTheme.palette.text.secondary }}>Total Images</TableCell>
                        <TableCell style={{ color: muiTheme.palette.text.secondary }}>Approved Images</TableCell>
                        <TableCell style={{ color: muiTheme.palette.text.secondary }}>Total Videos</TableCell>
                        <TableCell style={{ color: muiTheme.palette.text.secondary }}>Approved Videos</TableCell>
                        <TableCell style={{ color: muiTheme.palette.text.secondary }}>Approval Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {departments.map((dept, index) => (
                        <TableRow key={index}>
                          <TableCell>{dept}</TableCell>
                          <TableCell>{mediaData[dept].total_images}</TableCell>
                          <TableCell>{mediaData[dept].approved_images}</TableCell>
                          <TableCell>{mediaData[dept].total_videos}</TableCell>
                          <TableCell>{mediaData[dept].approved_videos}</TableCell>
                          <TableCell>{mediaData[dept].approval_percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </main>
    </div>
  );
};

export default Home;