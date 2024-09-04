import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, Typography, styled, Snackbar, Alert
} from '@mui/material';
import axiosInstance from '../utils/axiosInstance';
import UserForm from './UserForm';

// Styled components for modern buttons and typography
const StyledButton = styled(Button)(({ theme, selected }) => ({
  margin: theme.spacing(1, 0),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  fontWeight: 'bold',
  backgroundColor: selected ? 'gold' : 'black', // Background color based on selection
  color: selected ? 'black' : 'white', // Text color based on selection
  transition: '0.3s',
  '&:hover': {
    backgroundColor: selected ? 'gold' : 'gold', // Hover color remains gold for selected
    color: 'black', // Hover text color
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  textAlign: 'center',
  padding: theme.spacing(2),
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
}));

const DepartmentSelection = ({ open, onClose }) => {
  const [departments, setDepartments] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subdivisions, setSubdivisions] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedSubdivision, setSelectedSubdivision] = useState(null);
  const [selectionType, setSelectionType] = useState('');
  const [openUserForm, setOpenUserForm] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    axiosInstance.get('api/departments-divisions-subdivisions/')
      .then(response => {
        setDepartments(response.data || []);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  const handleSelectionTypeChange = (type) => {
    setSelectionType(type);
    setSelectedDepartment(null);
    setSelectedDivision(null);
    setSelectedSubdivision(null);
  };

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    setDivisions(department.divisions || []);
    setSelectedDivision(null);
    setSelectedSubdivision(null);
  };

  const handleDivisionSelect = (division) => {
    setSelectedDivision(division);
    setSubdivisions(division.subdivisions || []);
    setSelectedSubdivision(null);
  };

  const handleSubdivisionSelect = (subdivision) => {
    setSelectedSubdivision(subdivision);
  };

  const handleProceed = () => {
    const selectedData = {
      department: selectedDepartment ? selectedDepartment.id : null,
      division: selectedDivision ? selectedDivision.id : null,
      subdivision: selectedSubdivision ? selectedSubdivision.id : null,
      role: '', // Add role based on the selection type
    };

    // Validate based on the selectionType
    if (selectionType === 'department') {
      if (!selectedDepartment) {
        setSnackbarMessage("Please select a department.");
        setSnackbarOpen(true);
        return;
      }
      selectedData.role = 'departmentadmin';
    } else if (selectionType === 'division') {
      if (!selectedDepartment || !selectedDivision) {
        setSnackbarMessage("Please select a department and a division.");
        setSnackbarOpen(true);
        return;
      }
      selectedData.role = 'divisionadmin';
    } else if (selectionType === 'subdivision') {
      if (!selectedDepartment || !selectedDivision || !selectedSubdivision) {
        setSnackbarMessage("Please select a department, a division, and a subdivision.");
        setSnackbarOpen(true);
        return;
      }
      selectedData.role = 'subdivisionuser';
    } else {
      setSnackbarMessage("Please select a role.");
      setSnackbarOpen(true);
      return;
    }

    // Proceed with setting the user form and closing the dialog
    setOpenUserForm(true);
    setDepartmentData(selectedData);
    onClose(); // Close the dialog after proceeding
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleDialogClose = () => {
    // Reset all states when the dialog is closed
    setSelectionType('');
    setSelectedDepartment(null);
    setSelectedDivision(null);
    setSelectedSubdivision(null);
    setDivisions([]);
    setSubdivisions([]);
    setDepartmentData([]);
    setOpenUserForm(false); // Ensure that UserForm is closed
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <StyledDialogTitle sx={{ backgroundColor: 'gold', color: 'black', textAlign: 'center' }}>
  Select Role and Hierarchy
</StyledDialogTitle>
        <StyledDialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Select Role</Typography>
              <StyledButton 
                selected={selectionType === 'department'} 
                onClick={() => handleSelectionTypeChange('department')}
                fullWidth
              >
                Department Head
              </StyledButton>
              <StyledButton 
                selected={selectionType === 'division'} 
                onClick={() => handleSelectionTypeChange('division')}
                fullWidth
              >
                Division Head
              </StyledButton>
              <StyledButton 
                selected={selectionType === 'subdivision'} 
                onClick={() => handleSelectionTypeChange('subdivision')}
                fullWidth
              >
                Sub-Division User
              </StyledButton>
            </Grid>

            {selectionType && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Select Department</Typography>
                {departments.map(department => (
                  <StyledButton 
                    key={department.id} 
                    selected={selectedDepartment === department}
                    onClick={() => handleDepartmentSelect(department)}
                    fullWidth
                  >
                    {department.name}
                  </StyledButton>
                ))}
              </Grid>
            )}

            {selectionType !== 'department' && selectedDepartment && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Select Division</Typography>
                {divisions.map(division => (
                  <StyledButton 
                    key={division.id} 
                    selected={selectedDivision === division}
                    onClick={() => handleDivisionSelect(division)}
                    fullWidth
                  >
                    {division.name}
                  </StyledButton>
                ))}
              </Grid>
            )}

            {selectionType === 'subdivision' && selectedDivision && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Select Sub-Division</Typography>
                {subdivisions.map(subdivision => (
                  <StyledButton 
                    key={subdivision.id} 
                    selected={selectedSubdivision === subdivision}
                    onClick={() => handleSubdivisionSelect(subdivision)}
                    fullWidth
                  >
                    {subdivision.name}
                  </StyledButton>
                ))}
              </Grid>
            )}
          </Grid>
        </StyledDialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="secondary">Cancel</Button>
          <Button 
            onClick={handleProceed} 
            color="primary" 
            disabled={!selectedDepartment && selectionType !== 'department'}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* UserForm component */}
      {openUserForm && (
        <UserForm
          open={openUserForm}
          onClose={() => setOpenUserForm(false)}
          departmentData={departmentData}
        />
      )}

      {/* Snackbar for alerts */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="warning">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DepartmentSelection;
