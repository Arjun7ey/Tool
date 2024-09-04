import React, { useState, useEffect } from 'react';
import { Paper, Grid, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, TextField } from '@mui/material';
import { ThumbUp, Share, Comment, Repeat } from '@mui/icons-material';
import { useAuth } from '../utils/AuthContext';
import PostPreviewSelection from './PostPreviewSelection';
import axiosInstance from '../utils/axiosInstance';
import { BASE_URL } from '../../config';
import Swal from 'sweetalert2';
import CircularProgress from '@mui/material/CircularProgress'; 



const socialMediaPreviews = [
  { name: 'Twitter', icon: 'https://www.freepnglogos.com/uploads/twitter-x-logo-png/twitter-x-logo-png-9.png' },
  { name: 'Facebook', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg' },
  { name: 'Instagram', icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png' },
];

const ChartComponent = () => {
  const { userData } = useAuth();
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [customText, setCustomText] = useState('');
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const result = await axiosInstance.get('/api/approved_posts/');
        setPosts(result.data.posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDialogOpen = (preview) => {
    setSelectedPreview(preview);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedPreview(null);
    setSelectedImage(null);
    setCustomText('');
  };

  const handleImageSelection = (image) => {
    setSelectedImage(image);
  };

  const handleCustomTextChange = (event) => {
    setCustomText(event.target.value);
  };

  const handlePost = async () => {
    if (!selectedPreview || !selectedImage) return;
  
    const formData = new FormData();
    formData.append('status', customText); // Use 'status' for the text field
    formData.append('user_id', userData.userId); // Assuming userData has user ID
    console.log("mymy",customText,userData.userId,selectedImage.url)
    if (selectedImage) {
      try {
        const file = await handleImageUrlToFile(selectedImage.url);
        if (file) {
          formData.append('media', file);
        } else {
          console.error('Error converting image URL to file.');
        }
      } catch (error) {
        console.error('Error converting image URL to file:', error);
      }
    } else {
      formData.delete('media');
    }
  
    try {
      // Close the dialog immediately after the post request
      handleDialogClose();
  
      // Show waiting animation (spinner) while waiting for the Swal notification
      Swal.fire({
        title: 'Posting...',
        text: 'Please wait while we submit your post.',
        icon: 'info',
        didOpen: () => {
          Swal.showLoading(); // Show loading spinner
        },
      });
  
      // Wait for the API response
      await axiosInstance.post('/api/post_text_with_media_to_twitter/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      // Close the waiting animation and show success notification
      await Swal.fire({
        title: 'Success!',
        text: 'Post submitted successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Error posting content:', error);
  
      // Close the waiting animation and show error notification
      await Swal.fire({
        title: 'Error!',
        text: 'Error submitting post. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };
  const handleImageUrlToFile = async (url) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: blob.type });
        return file;
    } catch (error) {
        console.error('Error converting URL to file:', error);
        return null;
    }
};
  const renderPreviewContent = () => {
    if (!selectedImage || !selectedPreview) return null;
    const profilePic = `${BASE_URL}${userData.profilePicture}`;
  
    // Fixed dimensions for image container
    const containerStyle = {
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#e3f2fd',
      color: '#000',
    };
  
    const imageContainerStyle = {
      width: '100%',
      height: '300px', // Fixed height for uniform image boxes
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderRadius: '8px',
      backgroundColor: '#fff',
      marginTop: '10px',
    };
  
    const imageStyle = {
      width: '100%',
      height: '100%',
      objectFit: 'cover', // Ensure images cover the container without distortion
    };
  
    const headerStyle = {
      marginBottom: '10px',
      fontWeight: 'bold',
    };
  
    switch (selectedPreview.name) {
      case 'Twitter':
        return (
          <Paper style={containerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <img
                src={profilePic}
                alt="Profile"
                style={{ borderRadius: '50%', marginRight: '10px', width: '40px', height: '40px' }}
              />
              <div>
                <Typography variant="body1" style={headerStyle}>
                  {userData.username}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  @{userData.handle}
                </Typography>
              </div>
            </div>
            <Typography variant="body1" style={headerStyle}>
              {customText || 'This is a Twitter post with the selected image.'}
            </Typography>
            <div style={imageContainerStyle}>
              <img
                src={selectedImage.url}
                alt="Tweet"
                style={imageStyle}
              />
            </div>
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <IconButton color="primary"><ThumbUp /></IconButton>
              <IconButton color="primary"><Repeat /></IconButton>
              <IconButton color="primary"><Comment /></IconButton>
            </div>
          </Paper>
        );
      case 'Facebook':
        return (
          <Paper style={containerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <img
                src={profilePic}
                alt="Profile"
                style={{ borderRadius: '50%', marginRight: '10px', width: '40px', height: '40px' }}
              />
              <div>
                <Typography variant="body1" style={headerStyle}>
                  {userData.username}
                </Typography>
              </div>
            </div>
            <Typography variant="body1" style={headerStyle}>
              {customText || 'This is a Facebook post with the selected image.'}
            </Typography>
            <div style={imageContainerStyle}>
              <img
                src={selectedImage.url}
                alt="Facebook Post"
                style={imageStyle}
              />
            </div>
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <IconButton color="primary"><ThumbUp /></IconButton>
              <IconButton color="primary"><Comment /></IconButton>
              <IconButton color="primary"><Share /></IconButton>
            </div>
          </Paper>
        );
      case 'Instagram':
        return (
          <Paper style={containerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <img
                src={profilePic}
                alt="Profile"
                style={{ borderRadius: '50%', marginRight: '10px', width: '40px', height: '40px' }}
              />
              <div>
                <Typography variant="body1" style={headerStyle}>
                  {userData.username}
                </Typography>
              </div>
            </div>
            <div style={imageContainerStyle}>
              <img
                src={selectedImage.url}
                alt="Instagram Post"
                style={imageStyle}
              />
            </div>
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <IconButton color="primary"><ThumbUp /></IconButton>
              <IconButton color="primary"><Comment /></IconButton>
              <IconButton color="primary"><Share /></IconButton>
            </div>
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', padding: '20px' }}>
      <Grid container spacing={3}>
        {socialMediaPreviews.map((preview, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Paper style={{ padding: '10px', textAlign: 'center', backgroundColor: '#FFD700' }}>
              <Typography variant="h6" gutterBottom>
                {preview.name}
              </Typography>
              <IconButton
                onClick={() => handleDialogOpen(preview)}
                style={{ marginTop: '10px' }}
              >
                <img src={preview.icon} alt={preview.name} style={{ width: '40px', height: '40px' }} />
              </IconButton>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Image Selection Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
    <DialogTitle>Select Image for {selectedPreview?.name}</DialogTitle>
    <DialogContent>
        <PostPreviewSelection onSelectPreview={handleImageSelection} />
        <TextField
            label="Custom Text"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={customText}
            onChange={handleCustomTextChange}
            margin="normal"
        />
        {selectedImage && (
            <div style={{ marginTop: '20px' }}>
                <Typography variant="h6" gutterBottom>
                    {selectedPreview?.name} Post Preview
                </Typography>
                {renderPreviewContent()}
            </div>
        )}
        {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
                <CircularProgress />
                <Typography variant="body1" style={{ marginLeft: '10px' }}>Posting...</Typography>
            </div>
        )}
    </DialogContent>
    <DialogActions>
        <Button onClick={handleDialogClose} color="primary">
            Close
        </Button>
        <Button onClick={handlePost} color="primary">
            Post
        </Button>
    </DialogActions>
</Dialog>

    </div>
  );
};

export default ChartComponent;
