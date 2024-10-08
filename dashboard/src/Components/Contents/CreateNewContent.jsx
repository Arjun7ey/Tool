import React, { useState, useEffect } from 'react';
import {
  Button,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  Divider,
  Snackbar,
  Alert,
  Typography,
  Box,
  FormControl
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Add as AddIcon } from '@mui/icons-material';
import axiosInstance from '../utils/axiosInstance';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogTitle-root': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2),
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#fce8805e',
  color: '#F4B400',
  '&:hover': {
    backgroundColor: '#fce88080',
  },
}));

const CreateNewContent = () => {
  const [open, setOpen] = useState(false);
  const [contentName, setContentName] = useState('');
  const [contentStartDate, setContentStartDate] = useState('');
  const [contentStartTime, setContentStartTime] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axiosInstance.get('api/department-userwise/');
        setDepartments(response.data.departments);
      } catch (error) {
        console.error('Error fetching departments:', error);
        showSnackbar('Error fetching departments. Please try again.', 'error');
      }
    };

    fetchDepartments();
  }, []);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setContentName('');
    setContentStartDate('');
    setContentStartTime('');
    setSelectedDepartment('');
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const validateForm = () => {
    if (!contentName.trim()) {
      showSnackbar('Please enter a content name.', 'error');
      return false;
    }
    if (!contentStartDate || !contentStartTime) {
      showSnackbar('Please set the content start date and time.', 'error');
      return false;
    }
    if (new Date(`${contentStartDate}T${contentStartTime}`) < new Date()) {
      showSnackbar('Start date and time cannot be in the past.', 'error');
      return false;
    }
    if (!selectedDepartment) {
      showSnackbar('Please select a department.', 'error');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const startDateTime = `${contentStartDate}T${contentStartTime}`;

    const newContent = {
      title: contentName,
      start_time: startDateTime,
      department: selectedDepartment,
    };

    try {
      const response = await axiosInstance.post('api/contents/', newContent);
      showSnackbar('Content added successfully!', 'success');
      handleClose();
    } catch (error) {
      console.error('Error adding content:', error);
      showSnackbar('Error adding content. Please try again.', 'error');
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <Box className="p-4 bg-white rounded mb-6">
      <StyledButton
        variant="contained"
        fullWidth
        onClick={handleClickOpen}
        startIcon={<AddIcon />}
      >
        Create New Content
      </StyledButton>

      <StyledDialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          <Typography variant="h6">Create New Content</Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Content Name"
            type="text"
            fullWidth
            variant="outlined"
            value={contentName}
            onChange={(e) => setContentName(e.target.value)}
          />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="startDate"
                label="Start Date"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={contentStartDate}
                onChange={(e) => setContentStartDate(e.target.value)}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="startTime"
                label="Start Time"
                type="time"
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                value={contentStartTime}
                onChange={(e) => setContentStartTime(e.target.value)}
              />
            </Grid>
          </Grid>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="department-label">Department</InputLabel>
            <Select
              labelId="department-label"
              id="department"
              value={selectedDepartment}
              label="Department"
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              {departments
                .filter(department => department.name !== 'Super Department')
                .map(department => (
                  <MenuItem key={department.id} value={department.id}>
                    {department.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </StyledDialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%', backgroundColor: 'black', color: 'white' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateNewContent;