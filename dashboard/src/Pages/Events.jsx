import React, { useState } from 'react';
import { Container, Grid, Box, Breadcrumbs, Link, Typography } from '@mui/material';
import Header from '../Components/Header';
import { styled } from '@mui/material/styles';
import Sidebar from '../Components/Sidebar';
import UpcomingEvents from '../Components/Events/UpcomingEvents';
import CreateNewEvent from '../Components/Events/CreateNewEvent';
import Calendar from '../Components/Events/Calendar';
import event from '../assets/images/icons/event.svg';

const SIDEBAR_WIDTH = '250px';
const HEADER_HEIGHT = '64px';

const Root = styled('div')({
  display: 'flex',
  height: '100vh',
  overflow: 'hidden',
});

const SidebarWrapper = styled('div')({
  width: SIDEBAR_WIDTH,
  flexShrink: 0,
});

const MainContent = styled('div')({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  overflow: 'hidden',
});

const ContentArea = styled('div')({
  flexGrow: 1,
  overflowY: 'auto',
  padding: '16px',
  marginTop: HEADER_HEIGHT,
});
  

const Event = () => {
  return (
    <Root>
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
      <MainContent>
        <Header />
        <ContentArea>
          <Box sx={{ padding: 2, paddingLeft: 3 }}> {/* Add padding to this container instead */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: 2 }}>
              <Link
                underline="hover"
                color="inherit"
                href="/dashboard"
                sx={{ fontWeight: 'bold' }}
              >
                Home
              </Link>
              <Link
                underline="hover"
                color="inherit"
                href="/events"
                sx={{ fontWeight: 'bold' }}
              >
                Events/Campaigns
              </Link>
            </Breadcrumbs>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <CreateNewEvent />
                <Box
                  component="img"
                  src={event}
                  alt="Event Image"
                  sx={{ 
                    width: '60%', 
                    height: 'auto', 
                    aspectRatio: '1 / 1',
                    marginLeft: '40px'
                  }}
                />
                <UpcomingEvents />
              </Grid>
              <Grid item xs={12} md={8}>
                <Calendar sx={{ border: '0.1px solid black' }} />
              </Grid>
            </Grid>
          </Box>
        </ContentArea>
      </MainContent>
    </Root>
  );
};

export default Event;