import React from 'react';
import { Grid, Box, Breadcrumbs, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import Header from '../Components/Header';
import Sidebar from '../Components/Sidebar';
import UpcomingContents from '../Components/Contents/UpcomingContents';
import CreateNewContent from '../Components/Contents/CreateNewContent';
import Calendar from '../Components/Contents/Calendar';
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
  

const Content = () => {
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
                href="/contents"
                sx={{ fontWeight: 'bold' }}
              >
                Contents
              </Link>
            </Breadcrumbs>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <CreateNewContent />
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
                <UpcomingContents />
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

export default Content;