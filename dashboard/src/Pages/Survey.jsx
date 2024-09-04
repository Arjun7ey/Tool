import React, { useState } from 'react';
import { Container, Grid } from '@mui/material';
import Header from '../Components/Header';
import Sidebar from '../Components/Sidebar';
import SurveyTable from '../Components/Survey/SurveyTable';

const Users = () => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="flex" style={{ position: 'relative', height: '100vh' }}>
      <Sidebar
        style={{ position: 'fixed', height: '100%', top: 0, left: 0 }}
        expanded={expanded}
        setExpanded={setExpanded}
      />
      <div
        className="flex-grow"
        style={{
          transition: 'margin-left 0.3s',
          marginLeft: expanded ? '20%' : '10%',
          width: expanded ? '80%' : '90%',
        }}
      >
        <Header
          style={{ position: 'fixed', width: expanded ? '80%' : '90%', top: 0, zIndex: 1 }}
          expanded={expanded}
          setExpanded={setExpanded}
        />
        <Container style={{ marginTop: '70px', height: 'calc(100vh - 64px)' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <SurveyTable />
            </Grid>
          </Grid>
        </Container>
      </div>
    </div>
  );
};

export default Users;
