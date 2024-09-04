import React, { useState } from 'react';
import { Container, Grid, Breadcrumbs,Link } from '@mui/material';
import Header from '../Components/Header';
import Sidebar from '../Components/Sidebar';
import MoM from '../Components/MoMs/MoM';

const Users = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar
        style={{ height: '100vh', width: '20%' }}
      />
      <div
        style={{
          marginLeft: '1%', 
          width: '80%', 
          display: 'flex',
          flexDirection: 'column',
          height: '100vh', 
        }}
      >
        <Header
          style={{ width: '100%', top: 0, zIndex: 1 }} 
        />
        <div
          style={{
            marginTop: '64px', 
            padding: '16px',
            height: `calc(100vh - 64px)`,
            overflowY: 'auto', 
          }}
        >
          <Breadcrumbs aria-label="breadcrumb" style={{ marginBottom: '16px', marginLeft: '20px' }}>
            <Link underline="hover" color="inherit" href="/dashboard">
              Home
            </Link>
            <Link underline="hover" color="inherit" href="/moms">
              Issue Tracker
            </Link>
          </Breadcrumbs>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <MoM />
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default Users;
