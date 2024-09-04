import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance'; // Import your axios instance
import { Dialog, DialogContent, DialogTitle, Grid, IconButton } from '@mui/material';
import { PhotoLibrary } from '@mui/icons-material';
import { BASE_URL } from '../../config';

const PostPreviewSelection = ({ preview, onSelectPreview, onClose }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axiosInstance.get('/api/approved_images/');
        const fetchedImages = response.data.images.map(img => ({
          ...img,
          url: `${BASE_URL}${img.image_url}`, // Append base URL
        }));
        setImages(fetchedImages);
      } catch (err) {
        setError('Error fetching images');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const handleImageClick = (image) => {
    onSelectPreview(image); // Pass selected image to parent
    onClose(); // Close dialog
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <Grid container spacing={2}>
  {images.map((image) => (
    <Grid item xs={4} sm={3} md={2} key={image.id}>
      <img
        src={image.url}
        alt={image.title}
        style={{
          width: '100px', // Fixed width
          height: '100px', // Fixed height
          cursor: 'pointer',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
          objectFit: 'cover', // Ensures the image covers the fixed dimensions without distortion
          transition: 'transform 0.2s',
        }}
        onClick={() => handleImageClick(image)}
      />
    </Grid>
  ))}
</Grid>

      )}
    </div>
  );
};

export default PostPreviewSelection;
