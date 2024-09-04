import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  Button,
  Switch,
  FormControlLabel,
  Avatar,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../utils/AuthContext';
import { useParams } from 'react-router-dom';
import { BASE_URL } from '../../config';

const UserDetail = () => {
  const { userData } = useAuth();
  const { id } = useParams();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [updatedPermissions, setUpdatedPermissions] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    aboutMe: '',  // Add aboutMe field
  });

  useEffect(() => {
    axiosInstance.get(`/api/users/${id}/`)
      .then((response) => {
        setUser(response.data);
        setFormValues({
          username: response.data.username || '',
          email: response.data.email || '',
          phoneNumber: response.data.phone_number || '',
          aboutMe: response.data.about_me || '',  // Fetch aboutMe field
        });
      })
      .catch((error) => {
        console.error('Error fetching user details:', error);
      });

    axiosInstance.get(`/api/users/${id}/permissions/`)
      .then((response) => {
        if (typeof response.data === 'object' && response.data !== null) {
          setPermissions(response.data);
          setUpdatedPermissions(response.data);
        } else {
          console.error('Unexpected permissions data format:', response.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching user permissions:', error);
      });
  }, [id]);

  useEffect(() => {
    if (newProfilePicture) {
      const imageUrl = URL.createObjectURL(newProfilePicture);
      setPreviewImage(imageUrl);
      setPreviewDialogOpen(true);
    }
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [newProfilePicture]);

  const handlePermissionChange = (permission) => (event) => {
    setUpdatedPermissions(prevPermissions => ({
      ...prevPermissions,
      [permission]: event.target.checked,
    }));
  };

  const handleSavePermissions = () => {
    const payload = {
      permissions: updatedPermissions,
    };

    axiosInstance.patch(`/api/users/${id}/permissions/update/`, payload)
      .then(() => {
        setPermissions(updatedPermissions);
        setEditMode(false);
        setSnackbarMessage('Permissions updated successfully');
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error('Error updating permissions:', error);
        setSnackbarMessage('Error updating permissions');
        setSnackbarOpen(true);
      });
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewProfilePicture(file);
    }
  };

  const handleCancelProfilePicture = () => {
    setNewProfilePicture(null);
    setPreviewImage(null);
    setPreviewDialogOpen(false);
  };

  const uploadProfilePicture = () => {
    const formData = new FormData();
    formData.append('profile_picture', newProfilePicture);

    axiosInstance.post(`/api/users/${id}/upload-profile-picture/`, formData)
      .then(response => {
        const updatedProfilePicture = response.data.profile_picture;
        const fullImageUrl = `${BASE_URL}${updatedProfilePicture}?t=${new Date().getTime()}`;
        setUser(prevUser => ({
          ...prevUser,
          profile_picture: fullImageUrl,
        }));
        setNewProfilePicture(null);
        setPreviewImage(null);
        setPreviewDialogOpen(false);
      })
      .catch(error => {
        console.error('Error uploading profile picture:', error);
      });
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSaveDetails = () => {
    const { username, email, phoneNumber, aboutMe } = formValues;
    axiosInstance.patch(`/api/users/${id}/update-details/`, {
      username,
      email,
      phone_number: phoneNumber,
      about_me: aboutMe,  // Include aboutMe field
    })
      .then(() => {
        setUser(prevUser => ({
          ...prevUser,
          username,
          email,
          phone_number: phoneNumber,
          about_me: aboutMe,  // Update aboutMe field
        }));
        handleDialogClose();
        setSnackbarMessage('Details updated successfully');
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error('Error updating user details:', error);
        setSnackbarMessage('Error updating details');
        setSnackbarOpen(true);
      });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="md" style={{ marginTop: '30px' }}>
      {/* Header Section with Darker Color */}
      <Paper elevation={3} style={{
        position: 'relative',
        backgroundColor: '#FFC107', // Yellow color
        color: '#000', // Black text
        padding: '20px', // Reduced padding for a shorter header
        borderRadius: '12px',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
        marginBottom: '30px',
        maxWidth: '800px',
        margin: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h3" style={{ fontWeight: 'bold', color: '#000' }}>
            {user.full_name}
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              alt="Profile Picture"
              src={user.profile_picture}
              style={{
                width: 120,  // Reduced size for a shorter header
                height: 120, // Reduced size for a shorter header
                border: '4px solid #FFF', // White border
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                borderRadius: '50%',
              }}
            />
            <IconButton
              style={{
                marginLeft: '-25px',
                backgroundColor: '#FFF',
                borderRadius: '50%',
                border: '2px solid #ddd',
                boxShadow: '0 3px 6px rgba(0, 0, 0, 0.2)',
              }}
              onClick={() => document.getElementById('profile-picture-input').click()}
            >
              <Edit style={{ color: '#FFC107' }} /> {/* Yellow icon */}
            </IconButton>
            <input
              id="profile-picture-input"
              type="file"
              style={{ display: 'none' }}
              onChange={handleProfilePictureChange}
            />
          </div>
        </div>
      </Paper>
  
      {/* Profile Information */}
      <Paper elevation={3} style={{
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
        maxWidth: '800px',
        margin: 'auto',
        backgroundColor: '#FFF', // White background
      }}>
        <Typography variant="h4" gutterBottom style={{ fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>
          User Details
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" style={{ color: '#000', fontWeight: 'bold', marginBottom: '8px' }}>
              Username:
            </Typography>
            <Typography variant="body1" style={{ backgroundColor: '#FFF', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#000' }}>
              {user.username}
            </Typography>
            <Typography variant="body2" style={{ color: '#000', fontWeight: 'bold', marginBottom: '8px' }}>
              Email:
            </Typography>
            <Typography variant="body1" style={{ backgroundColor: '#FFF', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#000' }}>
              {user.email}
            </Typography>
            <Typography variant="body2" style={{ color: '#000', fontWeight: 'bold', marginBottom: '8px' }}>
              Phone Number:
            </Typography>
            <Typography variant="body1" style={{ backgroundColor: '#FFF', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#000' }}>
              {user.phone_number}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" style={{ color: '#000', fontWeight: 'bold', marginBottom: '8px' }}>
              About Me:
            </Typography>
            <Typography variant="body1" style={{ backgroundColor: '#FFF', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#000' }}>
              {user.about_me}
            </Typography>
          </Grid>
        </Grid>
        <Button
  variant="contained"
  style={{
    backgroundColor: '#FFC107', // Yellow color
    color: '#000', // Black text
    marginTop: '20px',
    '&:hover': {
      backgroundColor: '#FFB300', // Darker yellow for hover effect
    }
  }}
  onClick={handleDialogOpen}
>
  Edit Details
</Button>

      </Paper>
  
      {/* Permissions Section */}
      <Paper elevation={3} style={{
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
        maxWidth: '800px',
        margin: 'auto',
        marginTop: '30px',
        backgroundColor: '#FFF', // White background
      }}>
        <Typography variant="h4" gutterBottom style={{ fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>
          User Permissions
        </Typography>
        {editMode ? (
          <>
            <List>
              {Object.keys(permissions).map((permission) => (
                <ListItem key={permission} style={{ padding: '10px 0' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={updatedPermissions[permission] || false}
                        onChange={handlePermissionChange(permission)}
                        color="primary" // Primary color for switch
                      />
                    }
                    label={permission}
                    style={{ marginRight: '20px', color: '#000' }}
                  />
                </ListItem>
              ))}
            </List>
            <Button
              variant="contained"
              color="secondary" // Yellow color button
              onClick={handleSavePermissions}
              style={{ marginRight: '20px' }}
            >
              Save Permissions
            </Button>
            <Button
              variant="outlined"
              color="secondary" // Yellow color outlined button
              onClick={() => setEditMode(false)}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
          variant="contained"
          style={{
            backgroundColor: '#FFC107', // Yellow color
            color: '#000', // Black text
            marginTop: '20px',
            '&:hover': {
              backgroundColor: '#FFB300', // Darker yellow for hover effect
            }
          }}
          onClick={() => setEditMode(true)}
        >
          Edit Permissions
        </Button>
        
        )}
      </Paper>

      {/* Dialog for editing user details */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Edit User Details</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="username"
            label="Username"
            type="text"
            fullWidth
            variant="standard"
            value={formValues.username}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="standard"
            value={formValues.email}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            name="phoneNumber"
            label="Phone Number"
            type="text"
            fullWidth
            variant="standard"
            value={formValues.phoneNumber}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            name="aboutMe"
            label="About Me"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="standard"
            value={formValues.aboutMe}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSaveDetails}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarMessage.includes('Error') ? 'error' : 'success'}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Dialog for image preview */}
      <Dialog open={previewDialogOpen} onClose={handleCancelProfilePicture}>
        <DialogTitle>Preview Profile Picture</DialogTitle>
        <DialogContent>
          <img src={previewImage} alt="Profile Preview" style={{ width: '100%', height: 'auto' }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelProfilePicture}>Cancel</Button>
          <Button onClick={uploadProfilePicture} color="primary">
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserDetail;
