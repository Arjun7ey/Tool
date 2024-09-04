// src/components/Dashboard/UserProfile.jsx
import React from 'react';
import { Card, CardContent, Typography, Avatar } from '@mui/material';

const UserProfile = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>User Profile</Typography>
        <Avatar alt="User Name" src="/static/images/avatar/1.jpg" style={{ width: 80, height: 80, marginBottom: 16 }} />
        <Typography variant="h6">John Doe</Typography>
        <Typography variant="body2" color="textSecondary">john.doe@example.com</Typography>
        <Typography variant="body2" color="textSecondary">Member since: Jan 2022</Typography>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
