import React, { useState } from 'react';
import { Container,Box, Grid, Breadcrumbs,Link } from '@mui/material';
import Header from '../Components/Header';
import Sidebar from '../Components/Sidebar';
import Module from '../Components/Modules/Module';

import { styled } from '@mui/material/styles';

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
  

const Modules = () => {
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
        href="/modules"
        style={{ fontWeight: 'bold' }} // Apply bold style
    >
              Module Management
            </Link>
          </Breadcrumbs>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Module />
              </Grid>
          </Grid>
          </Box>
        </ContentArea>
      </MainContent>
    </Root>
  );
};

export default Modules;
