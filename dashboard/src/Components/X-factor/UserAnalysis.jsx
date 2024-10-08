import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Grid, Paper, Typography, IconButton, 
  useTheme, useMediaQuery, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Avatar, Chip, LinearProgress, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Person, Photo, Movie, ThumbUp, ThumbDown, Timeline, TrendingUp, TrendingDown
} from '@mui/icons-material';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
}));

const UserAnalysis = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating data fetch
    setTimeout(() => {
      setUserData({
        userPerformance: [
          { id: 'John Doe', submissions: 120, approvals: 100, rejections: 20 },
          { id: 'Jane Smith', submissions: 90, approvals: 85, rejections: 5 },
          { id: 'Bob Johnson', submissions: 75, approvals: 60, rejections: 15 },
          { id: 'Alice Williams', submissions: 110, approvals: 95, rejections: 15 },
        ],
        activityOverTime: [
          { date: '2023-01-01', submissions: 50, approvals: 40 },
          { date: '2023-02-01', submissions: 60, approvals: 55 },
          { date: '2023-03-01', submissions: 75, approvals: 70 },
          { date: '2023-04-01', submissions: 90, approvals: 80 },
        ],
        mediaDistribution: [
          { id: 'Photos', value: 65 },
          { id: 'Videos', value: 35 },
        ],
        topPerformers: [
          { id: 'Jane Smith', score: 95 },
          { id: 'John Doe', score: 92 },
          { id: 'Alice Williams', score: 88 },
        ],
        userInsights: [
          "User engagement has increased by 20% in the last month",
          "Video content is receiving 30% more interactions than photo content",
          "Users who post at least 3 times a week have 50% higher approval rates",
        ],
      });
      setLoading(false);
    }, 1500);
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
      }}>
        <Typography variant="h4">Loading User Analysis...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      pt: 8, // To account for the fixed navbar
    }}>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 4, color: 'white' }}>User Analysis</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>User Performance</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell align="right">Submissions</TableCell>
                      <TableCell align="right">Approvals</TableCell>
                      <TableCell align="right">Rejections</TableCell>
                      <TableCell align="right">Approval Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userData.userPerformance.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell component="th" scope="row">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2 }}>{user.id.charAt(0)}</Avatar>
                            {user.id}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{user.submissions}</TableCell>
                        <TableCell align="right">{user.approvals}</TableCell>
                        <TableCell align="right">{user.rejections}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress variant="determinate" value={(user.approvals / user.submissions) * 100} />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography variant="body2" color="text.secondary">{`${Math.round(
                                (user.approvals / user.submissions) * 100,
                              )}%`}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={8}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>Activity Over Time</Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveLine
                  data={[
                    {
                      id: 'Submissions',
                      data: userData.activityOverTime.map(item => ({ x: item.date, y: item.submissions }))
                    },
                    {
                      id: 'Approvals',
                      data: userData.activityOverTime.map(item => ({ x: item.date, y: item.approvals }))
                    }
                  ]}
                  margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                  xScale={{ type: 'point' }}
                  yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
                  yFormat=" >-.2f"
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    orient: 'bottom',
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Date',
                    legendOffset: 36,
                    legendPosition: 'middle'
                  }}
                  axisLeft={{
                    orient: 'left',
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Count',
                    legendOffset: -40,
                    legendPosition: 'middle'
                  }}
                  pointSize={10}
                  pointColor={{ theme: 'background' }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: 'serieColor' }}
                  pointLabelYOffset={-12}
                  useMesh={true}
                  legends={[
                    {
                      anchor: 'bottom-right',
                      direction: 'column',
                      justify: false,
                      translateX: 100,
                      translateY: 0,
                      itemsSpacing: 0,
                      itemDirection: 'left-to-right',
                      itemWidth: 80,
                      itemHeight: 20,
                      itemOpacity: 0.75,
                      symbolSize: 12,
                      symbolShape: 'circle',
                      symbolBorderColor: 'rgba(0, 0, 0, .5)',
                      effects: [
                        {
                          on: 'hover',
                          style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1
                          }
                        }
                      ]
                    }
                  ]}
                />
              </Box>
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={4}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>Media Distribution</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsivePie
                  data={userData.mediaDistribution}
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{ from: 'color', modifiers: [ [ 'darker', 2 ] ] }}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      justify: false,
                      translateX: 0,
                      translateY: 56,
                      itemsSpacing: 0,
                      itemWidth: 100,
                      itemHeight: 18,
                      itemTextColor: '#999',
                      itemDirection: 'left-to-right',
                      itemOpacity: 1,
                      symbolSize: 18,
                      symbolShape: 'circle',
                      effects: [
                        {
                          on: 'hover',
                          style: {
                            itemTextColor: '#000'
                          }
                        }
                      ]
                    }
                  ]}
                />
              </Box>
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>Top Performers</Typography>
              <List>
                {userData.topPerformers.map((performer, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Avatar>{performer.id.charAt(0)}</Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={performer.id} 
                      secondary={`Performance Score: ${performer.score}`} 
                    />
                    {index === 0 && <Chip label="Top Performer" color="primary" />}
                  </ListItem>
                ))}
              </List>
            </StyledPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>User Insights</Typography>
              <List>
                {userData.userInsights.map((insight, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {index % 2 === 0 ? <TrendingUp color="primary" /> : <TrendingDown color="secondary" />}
                    </ListItemIcon>
                    <ListItemText primary={insight} />
                  </ListItem>
                ))}
              </List>
            </StyledPaper>
          </Grid>

          <Grid item xs={12}>
            <StyledPaper>
              <Typography variant="h6" gutterBottom>User Engagement Heatmap</Typography>
              <Box sx={{ height: 400, width: '100%' }}>
                {/* Here you would integrate a heatmap component. 
                    For the purpose of this example, we'll use a placeholder. */}
                <Box 
                  sx={{ 
                    height: '100%', 
                    width: '100%', 
                    background: 'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="h5">User Engagement Heatmap Placeholder</Typography>
                </Box>
              </Box>
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default UserAnalysis;