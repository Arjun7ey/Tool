import React, { useState } from 'react';
import { Container, Grid, Box, Breadcrumbs, Link, Typography } from '@mui/material';
import Header from '../Components/Header';
import Sidebar from '../Components/Sidebar';
import UpcomingEvents from '../Components/Events/UpcomingEvents';
import CreateNewEvent from '../Components/Events/CreateNewEvent';
import Calendar from '../Components/Events/Calendar';
import event from '../assets/images/icons/event.svg';

const Event = () => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
    <Sidebar
      style={{ height: '100vh', width: '20%' }} // Fixed width for Sidebar
    />
    <div
      style={{
        marginLeft: '1%', // Margin to match the Sidebar width
        width: '80%', // Width to match the Sidebar width
        display: 'flex',
        flexDirection: 'column',
        height: '100vh', // Ensure full viewport height
      }}
    >
      <Header
        style={{ width: '100%', top: 0, zIndex: 1 }} // Full width of content area
      />
      <div
        style={{
          marginTop: '64px', // Adjust based on Header height
          padding: '16px',
          height: `calc(100vh - 64px)`, // Adjust based on Header height
          overflowY: 'auto', // Add scrolling if needed
        }}
      >
       <Breadcrumbs aria-label="breadcrumb" style={{ marginBottom: '16px', marginLeft: '20px' }}>
            <Link underline="hover" color="inherit" href="/">
              Home
            </Link>
            <Link underline="hover" color="inherit" href="/events">
              Events/Campaigns
            </Link>
          </Breadcrumbs>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <CreateNewEvent />
              <Box
                component="img"
                src={event} // Replace with the path to your image
                alt="Event Image"
                sx={{ width: '60%', height: 'auto', aspectRatio: '1 / 1' }}
                style={{ marginLeft: '40px' }}
              />
              <UpcomingEvents />
            </Grid>
            <Grid item xs={12} md={8}>
              <Calendar style={{ border: '0.1px solid black' }} />
            </Grid>
          </Grid>
       </div>
      </div>
    </div>
  );
};

export default Event;
