import React from 'react';
import { Grid, Breadcrumbs, Link, Box, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import Header from '../Components/Header';
import Sidebar from '../Components/Sidebar';
import Home from '../Components/Dashboard/Home';
import HomeWorld from '../Components/X-factor/HomeWorld';

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

const Users = () => {
  const theme = useTheme();

  return (
    <Root>
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
      <MainContent>
        <Header />
        <ContentArea>
          <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: '16px' }}>
            <Link
              underline="hover"
              color={theme.palette.mode === 'dark' ? 'white' : 'inherit'}
              href="/dashboard"
              sx={{ fontWeight: 'bold' }}
            >
              Home
            </Link>
            <Link
              underline="hover"
              color={theme.palette.mode === 'dark' ? 'white' : 'inherit'}
              href="/dashboard"
              sx={{ fontWeight: 'bold' }}
            >
              Dashboard
            </Link>
          </Breadcrumbs>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <HomeWorld />
            </Grid>
          </Grid>
        </ContentArea>
      </MainContent>
    </Root>
  );
};

export default Users;