import React, { useState } from 'react';
import { Container, Grid,Breadcrumbs,Link   } from '@mui/material';
import Header from '../Components/Header';
import Sidebar from '../Components/Sidebar';
import EventDetail from '../Components/Events/EventDetail';

const Users = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
    <Sidebar style={{ width: '20%', height: '100vh' }} />
    <div style={{ 
      width: '80%', 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      <Header />
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Breadcrumbs aria-label="breadcrumb" style={{ marginBottom: '16px' }}>
          <Link
            underline="hover"
            color="inherit"
            href="/dashboard"
            style={{ fontWeight: 'bold' }}
          >
            Home
          </Link>
    <Link 
        underline="hover" 
        color="inherit" 
        href="/events"
        style={{ fontWeight: 'bold' }} // Apply bold style
    >
              Event Details
            </Link>
          </Breadcrumbs>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <EventDetail />
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default Users;

