import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, Snackbar, Alert } from '@mui/material';
import axiosInstance from '../utils/axiosInstance';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const UserForm = ({ open, onClose, departmentData }) => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    profilePicture: null,
  });
  const [errors, setErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error'); 
  const [validationQueue, setValidationQueue] = useState([]);

  useEffect(() => {
    if (!open) {
      setFormData({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        profilePicture: null,
      });
      setErrors({});
      setValidationQueue([]); // Clear the validation queue
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePicture: e.target.files[0] });
  };

  const validateForm = () => {
    const queue = [];
    if (!formData.username) queue.push("Username is required.");
    if (!formData.firstName) queue.push("First name is required.");
    if (!formData.lastName) queue.push("Last name is required.");
    if (!formData.email) {
      queue.push("Email is required.");
    } else if (!validateEmail(formData.email)) {
      queue.push("Invalid email format.");
    }
    if (!formData.password) queue.push("Password is required.");
    if (!formData.phoneNumber) queue.push("Phone number is required.");
   

    setValidationQueue(queue);
    return queue.length === 0;
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const showSnackbarMessages = async () => {
    for (let message of validationQueue) {
      setSnackbarMessage(message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for Snackbar to close
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      await showSnackbarMessages();
      return;
    }

    const data = new FormData();
    data.append('username', formData.username);
    data.append('first_name', formData.firstName);
    data.append('last_name', formData.lastName);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('phone_number', formData.phoneNumber);
    data.append('profilePicture', formData.profilePicture);

    if (departmentData) {
      if (departmentData.department) data.append('departments', departmentData.department);
      if (departmentData.division) data.append('divisions', departmentData.division);
      if (departmentData.subdivision) data.append('subdivisions', departmentData.subdivision);
      if (departmentData.role) data.append('role', departmentData.role); // Append the role
    }

    try {
      await axiosInstance.post('api/create-new-user/', data);
      onClose(); // Close the form
      Swal.fire({
        icon: 'success',
        title: 'User created successfully!',
        text: 'The user has been created.',
        confirmButtonColor: '#3085d6',
        background: '#000',
        color: '#fff',
      });
    } catch (error) {
      setSnackbarMessage("An error occurred while creating the user.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      console.error("Error creating user:", error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New User</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              fullWidth
              margin="dense"
              autoComplete="off" // Prevent auto-fill
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              margin="dense"
              autoComplete="off" // Prevent auto-fill
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              margin="dense"
              autoComplete="off" // Prevent auto-fill
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="dense"
              autoComplete="off" // Prevent auto-fill
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              margin="dense"
              autoComplete="off" // Prevent auto-fill
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              fullWidth
              margin="dense"
              autoComplete="off" // Prevent auto-fill
            />
          </Grid>
          <Grid item xs={12}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ marginTop: '16px', width: '100%' }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary">Create User</Button>
      </DialogActions>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        sx={{ 
          '& .MuiSnackbarContent-root': {
            backgroundColor: '#000',
            color: '#fff',
          }
        }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default UserForm;
