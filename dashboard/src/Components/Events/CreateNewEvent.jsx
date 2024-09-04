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
  Alert
} from '@mui/material';
import axiosInstance from '../utils/axiosInstance'; // Import your axios instance

const CreateNewEvent = () => {
  const [open, setOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [events, setEvents] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axiosInstance.get('api/department-userwise/');
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSave = async () => {
    // Combine date and time into DateTime strings
    const startDateTime = `${eventStartDate}T${eventStartTime}`;
    const endDateTime = `${eventEndDate}T${eventEndTime}`;

    const newEvent = {
      title: eventName,
      start_time: startDateTime,
      end_time: endDateTime,
      department: selectedDepartment,
    };

    await addEvent(newEvent, showSnackbar);
    handleClose();
  };

  const addEvent = async (newEvent, showSnackbar) => {
    try {
      const response = await axiosInstance.post('api/events/', newEvent);
      setEvents((prevEvents) => [...prevEvents, response.data]);
      showSnackbar('Event added successfully!', 'success');
    } catch (error) {
      console.error('Error adding event:', error);
      showSnackbar('Error adding event. Please try again.', 'error');
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="p-4 bg-white rounded mb-6">
      <Button
        style={{ backgroundColor: '#fce8805e', opacity: '1', color: '#F4B400' }}
        variant="contained"
        fullWidth
        onClick={handleClickOpen}
      >
        + Create New Event
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Create New Event</DialogTitle>
        <Divider />
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Event Name"
            type="text"
            fullWidth
            variant="outlined"
            onChange={(e) => setEventName(e.target.value)}
          />
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="startDate"
                label="Start Date"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e) => setEventStartDate(e.target.value)}
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
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e) => setEventStartTime(e.target.value)}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="endDate"
                label="End Date"
                type="date"
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e) => setEventEndDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                margin="dense"
                id="endTime"
                label="End Time"
                type="time"
                fullWidth
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e) => setEventEndTime(e.target.value)}
              />
            </Grid>
          </Grid>
          <InputLabel id="department-label" style={{ marginTop: '16px' }}>
            Department
          </InputLabel>
          <Select
  labelId="department-label"
  id="department"
  onChange={(e) => setSelectedDepartment(e.target.value)}
  fullWidth
  variant="outlined"
  value={selectedDepartment}
>
  {departments
    .filter(department => department.name !== 'Super Department') 
    .map(department => (
      <MenuItem key={department.id} value={department.id}>
        {department.name}
      </MenuItem>
    ))}
</Select>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleClose}>
            Cancel
          </Button>
          <Button color="success" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        sx={{ backgroundColor: 'black' }} 
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ 
            width: '100%', 
            backgroundColor: 'black',  
            color: 'white'             
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CreateNewEvent;
