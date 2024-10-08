import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Grid, List, ListItem, ListItemText,
  Avatar, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
  Snackbar, Alert, Chip, useTheme, CircularProgress, Switch, Button
} from '@mui/material';
import { styled } from '@mui/system';
import { 
  Edit, LocationOn, Email, Phone, Work, School, PhotoCamera
} from '@mui/icons-material';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../utils/AuthContext';
import { useParams } from 'react-router-dom';

const YellowBox = styled(Box)(({ theme }) => ({
  background: '#FFD700',
  borderRadius: '10px',
  padding: '24px',
  color: '#000000',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
}));

const BlackBox = styled(Box)(({ theme }) => ({
  background: '#333333',
  borderRadius: '10px',
  padding: '24px',
  color: '#FFFFFF',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
}));

const StyledAvatar = styled(Avatar)({
  width: '150px',
  height: '150px',
  border: '4px solid #FFD700',
});

const StyledChip = styled(Chip)({
  backgroundColor: '#FFD700',
  color: '#000000',
  '&:hover': {
    backgroundColor: '#FFC000',
  },
});

const UltraModernUserDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    about_me: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userResponse, permissionsResponse] = await Promise.all([
          axiosInstance.get(`/api/users/${id}/`),
          axiosInstance.get(`/api/users/${id}/permissions/`)
        ]);

        setUser(userResponse.data);
        setPermissions(permissionsResponse.data);
        setEditForm({
          full_name: userResponse.data.full_name,
          email: userResponse.data.email,
          phone_number: userResponse.data.phone_number,
          about_me: userResponse.data.about_me,
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleEditClick = () => setDialogOpen(true);
  const handleDialogClose = () => setDialogOpen(false);

  const handlePermissionChange = (permission) => async (event) => {
    try {
      const newValue = event.target.checked;
      await axiosInstance.patch(`/api/users/${id}/permissions/update/`, {
        permissions: { [permission]: newValue }
      });
      setPermissions(prev => ({ ...prev, [permission]: newValue }));
      setSnackbarMessage('Permission updated successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating permission:', error);
      setSnackbarMessage('Error updating permission');
      setSnackbarOpen(true);
    }
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      const response = await axiosInstance.patch(`/api/users/${id}/update-details/`, editForm);
      setUser(prev => ({ ...prev, ...response.data }));
      setDialogOpen(false);
      setSnackbarMessage('User details updated successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating user details:', error);
      setSnackbarMessage('Error updating user details');
      setSnackbarOpen(true);
    }
  };

  const handleProfilePictureChange = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('profile_picture', file);

      try {
        const response = await axiosInstance.post(`/api/users/${id}/upload-profile-picture/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setUser(prev => ({ ...prev, profile_picture: response.data.profile_picture }));
        setSnackbarMessage('Profile picture updated successfully');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Error updating profile picture:', error);
        setSnackbarMessage('Error updating profile picture');
        setSnackbarOpen(true);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress style={{ color: '#FFD700' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <YellowBox mb={4}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Box position="relative">
              <StyledAvatar src={user.profile_picture} alt={user.full_name} />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="icon-button-file"
                type="file"
                onChange={handleProfilePictureChange}
              />
              <label htmlFor="icon-button-file">
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="span"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: '#000000',
                    color: '#FFD700',
                  }}
                >
                  <PhotoCamera />
                </IconButton>
              </label>
            </Box>
          </Grid>
          <Grid item xs>
            <Typography variant="h3" gutterBottom style={{ color: '#000000' }}>{user.full_name}</Typography>
            <Typography variant="h6" gutterBottom style={{ color: '#000000' }}>@{user.username}</Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
            
              <StyledChip icon={<LocationOn />} label="New Delhi, India" />
            </Box>
          </Grid>
          <Grid item>
            <IconButton onClick={handleEditClick} style={{ color: '#000000' }}>
              <Edit />
            </IconButton>
          </Grid>
        </Grid>
      </YellowBox>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <BlackBox>
            <Typography variant="h5" gutterBottom style={{ color: '#FFD700' }}>Contact Information</Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary={user.email} 
                  secondary="Email"
                  primaryTypographyProps={{ style: { color: '#FFFFFF' } }}
                  secondaryTypographyProps={{ style: { color: '#FFD700' } }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={user.phone_number} 
                  secondary="Phone"
                  primaryTypographyProps={{ style: { color: '#FFFFFF' } }}
                  secondaryTypographyProps={{ style: { color: '#FFD700' } }}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary={user.role || 'User'} 
                  secondary="Role"
                  primaryTypographyProps={{ style: { color: '#FFFFFF' } }}
                  secondaryTypographyProps={{ style: { color: '#FFD700' } }}
                />
              </ListItem>
            </List>
          </BlackBox>
        </Grid>
        <Grid item xs={12} md={6}>
          <BlackBox>
            <Typography variant="h5" gutterBottom style={{ color: '#FFD700' }}>About Me</Typography>
            <Typography style={{ color: '#FFFFFF' }}>{user.about_me || "No bio available."}</Typography>
          </BlackBox>
        </Grid>
        <Grid item xs={12}>
          <YellowBox>
            <Typography variant="h5" gutterBottom style={{ color: '#000000' }}>Permissions</Typography>
            <Grid container spacing={2}>
              {Object.entries(permissions).map(([permission, value]) => (
                <Grid item xs={12} sm={6} md={4} key={permission}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography style={{ color: '#000000' }}>{permission}</Typography>
                    <Switch
                      checked={value}
                      onChange={handlePermissionChange(permission)}
                      color="primary"
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </YellowBox>
        </Grid>
      </Grid>

      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose}
        PaperProps={{
          style: {
            backgroundColor: '#FFFFFF',
            color: '#000000',
          },
        }}
      >
        <DialogTitle style={{ backgroundColor: '#000000', color: '#FFD700' }}>Edit User Details</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="full_name"
            label="Full Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editForm.full_name}
            onChange={handleEditFormChange}
            InputLabelProps={{ style: { color: '#000000' } }}
            InputProps={{ style: { color: '#000000', borderColor: '#000000' } }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={editForm.email}
            onChange={handleEditFormChange}
            InputLabelProps={{ style: { color: '#000000' } }}
            InputProps={{ style: { color: '#000000', borderColor: '#000000' } }}
          />
          <TextField
            margin="dense"
            name="phone_number"
            label="Phone Number"
            type="tel"
            fullWidth
            variant="outlined"
            value={editForm.phone_number}
            onChange={handleEditFormChange}
            InputLabelProps={{ style: { color: '#000000' } }}
            InputProps={{ style: { color: '#000000', borderColor: '#000000' } }}
          />
          <TextField
            margin="dense"
            name="about_me"
            label="About Me"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={editForm.about_me}
            onChange={handleEditFormChange}
            InputLabelProps={{ style: { color: '#000000' } }}
            InputProps={{ style: { color: '#000000', borderColor: '#000000' } }}
          />
        </DialogContent>
        <DialogActions style={{ backgroundColor: '#FFFFFF' }}>
          <Button onClick={handleDialogClose} style={{ color: '#FFD700' }}>Cancel</Button>
          <Button onClick={handleSaveEdit} style={{ backgroundColor: '#FFD700', color: '#000000' }}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', backgroundColor: '#FFD700', color: '#000000' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UltraModernUserDetail;