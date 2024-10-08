import React, { useEffect, useState } from 'react';
import { Card, CardContent, List, ListItem, ListItemText, Divider, Typography, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../utils/axiosInstance'; 
import { formatDistanceToNow } from 'date-fns';
import { Notifications as NotificationIcon } from '@mui/icons-material';

const MotionListItem = motion(ListItem);

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axiosInstance.get('api/notifications/dashboard/');
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

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height={200}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <NotificationIcon style={{ fontSize: 40, color: '#FFD700' }} />
      </motion.div>
    </Box>
  );
  
  if (error) return <Typography color="error">{error}</Typography>;

  const latestActivities = activities.slice(0, 5); // Limit to 5 activities

  return (
    <Card 
      elevation={3} 
      sx={{ 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        borderRadius: '15px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box sx={{ 
        p: 1.5, 
        background: 'linear-gradient(45deg, #FFD700, #FFA000)',
        display: 'flex',
        alignItems: 'center'
      }}>
        <NotificationIcon sx={{ color: '#000000', mr: 1, fontSize: '1.2rem' }} />
        <Typography variant="subtitle1" component="div" sx={{ color: '#000000', fontWeight: 'bold' }}>
          Recent Activities
        </Typography>
      </Box>
      <CardContent sx={{ p: 0, flexGrow: 1, overflowY: 'auto', '&:last-child': { pb: 0 } }}>
        <List disablePadding>
          <AnimatePresence>
            {latestActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <MotionListItem
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  sx={{
                    py: 1,
                    px: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ color: '#000000', fontWeight: 'medium' }}>
                        {activity.message}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: '#666666' }}>
                        {formatRelativeTime(activity.timestamp)}
                      </Typography>
                    }
                  />
                </MotionListItem>
                {index < latestActivities.length - 1 && (
                  <Divider sx={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }} />
                )}
              </React.Fragment>
            ))}
          </AnimatePresence>
        </List>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;