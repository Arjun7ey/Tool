import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Card, CardContent, Box } from '@mui/material';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axiosInstance from '../utils/axiosInstance'; 

const DashboardMain = () => {
  const [approvalRates, setApprovalRates] = useState({
    telecommunication: 0,
    telecom: 0,
    tourism: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApprovalRates = async () => {
      try {
        const response = await axiosInstance.get('api/media-stats/');
        setApprovalRates({
          telecommunication: Math.round(response.data['BSNL'].approval_percentage),
          telecom: Math.round(response.data['NBM'].approval_percentage),
          tourism: Math.round(response.data['Digital Bharat Nidhi'].approval_percentage),
        });
      } catch (err) {
        setError('Error fetching approval rates');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovalRates();
  }, []);

  const CustomProgressBar = ({ value, text }) => {
    const radius = 70; // Radius of the circular part
    const strokeWidth = 10; // Thickness of the circular part
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;
  };
  const App = () => (
      <CustomProgressBar value={75} text="75%" />
    );

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>{error}</Typography>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper style={{ padding: '20px', height: '100%', backgroundColor: '#FFFFFF' }}> {/* Dark background */}
          <Typography variant="h6" style={{ marginBottom: '20px', color: '#000000', fontWeight: 'bold' }}>
            Approval Rate
          </Typography>
          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} sm={4}>
            <Card style={{ backgroundColor: '#FFFFFF', height: '100%', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' }}> {/* Add shadow here */}
                <CardContent>
                  <Typography variant="h6" style={{ marginBottom: '10px', color: '#000000' }}>
                    Digital Bharat Nidhi
                  </Typography>
                  <Box display="flex" justifyContent="center" alignItems="center" height={150}>
  <div style={{ width: '140px', height: '140px' }}> {/* Adjust the size here */}
    <CircularProgressbar
      value={approvalRates.telecommunication}
      text={`${approvalRates.telecommunication}%`}
      styles={buildStyles({
        pathColor: approvalRates.telecommunication > 50 ? '#FFD700' : '#FFD700', // Blue for > 50%, Red for <= 50%
        textColor: '#000000',
        trailColor: '#000000', 
        backgroundColor: '#262B3B',
      })}
      strokeWidth={15}
    />
  </div>
</Box>

                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
            <Card style={{ backgroundColor: '#FFFFFF', height: '100%', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' }}> {/* Add shadow here */}
                <CardContent>
                  <Typography variant="h6" style={{ marginBottom: '10px', color: '#000000' }}>
                    BSNL
                  </Typography>
                  <Box display="flex" justifyContent="center" alignItems="center" height={150}>
                  <div style={{ width: '140px', height: '140px' }}> {/* Adjust the size here */}
    <CircularProgressbar
      value={approvalRates.telecom}
      text={`${approvalRates.telecom}%`}
      styles={buildStyles({
        pathColor: approvalRates.telecommunication > 50 ? '#FFD700' : '#FFD700', // Blue for > 50%, Red for <= 50%
        textColor: '#00000F',
        trailColor: '#000000', // Darker grey for trail
        backgroundColor: '#262B3B',
      })}
      strokeWidth={15}
    />
  </div>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
            <Card style={{ backgroundColor: '#FFFFFF', height: '100%', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' }}> {/* Add shadow here */}
                <CardContent>
                  <Typography variant="h6" style={{ marginBottom: '10px', color: '#000000' }}>
                    NBM
                  </Typography>
                  <Box display="flex" justifyContent="center" alignItems="center" height={150}>
                  <div style={{ width: '140px', height: '140px' }}> {/* Adjust the size here */}
                    <CircularProgressbar
                      value={approvalRates.tourism}
                      text={`${approvalRates.tourism}%`}
                      styles={buildStyles({
                        pathColor: approvalRates.tourism > 50 ? '#FFD700' : '#FFD700', // Purple for > 50%, Pink for <= 50%
                        textColor: '#000000',
                        trailColor: '#000000', // Darker grey for trail
                        backgroundColor: '#262B3B',
                      })}
                      strokeWidth={15}
                    />
                    </div>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DashboardMain;
