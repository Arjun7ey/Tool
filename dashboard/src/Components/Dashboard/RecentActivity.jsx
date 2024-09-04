import React, { useEffect, useState } from 'react';
import { Card, CardContent, List, ListItem, ListItemText, Divider, Typography } from '@mui/material';
import axiosInstance from '../utils/axiosInstance'; 
import { formatDistanceToNow, parseISO } from 'date-fns';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axiosInstance.get('api/notifications/dashboard/');
        // Assuming response.data is an array of activities
        const sortedActivities = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setActivities(sortedActivities);
      } catch (err) {
        setError('Error fetching activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>{error}</Typography>;

  // Display only the latest 10 activities
  const latestActivities = activities.slice(0, 5);

  return (
    <Card style={{ height: '100%', backgroundColor: '#e3f2fd' }}> {/* Light blue background */}
      <CardContent>
        <List>
          {latestActivities.map((activity) => (
            <React.Fragment key={activity.id}>
              <ListItem>
              <ListItemText
        primary={activity.message}
        secondary={formatRelativeTime(activity.timestamp)}
        primaryTypographyProps={{ style: { color: '#000' } }}  
        secondaryTypographyProps={{ style: { color: '#000' } }}  
      />
    </ListItem>
              <Divider style={{ backgroundColor: '#90caf9' }} /> {/* Slightly darker blue for divider */}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
