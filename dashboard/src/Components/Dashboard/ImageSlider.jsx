import React, { useState, useEffect } from 'react';
import { Paper, CircularProgress } from '@mui/material';
import axiosInstance from '../utils/axiosInstance';
import { BASE_URL } from '../../config';

const ImageSlider = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/approved_images/')
      .then((response) => {
        if (response.data.images && Array.isArray(response.data.images)) {
          const imagesWithFullUrls = response.data.images.map(image => ({
            ...image,
            url: `${BASE_URL}${image.image_url}` // Append BASE_URL to the relative URL
          }));
          setImages(imagesWithFullUrls);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching images:', error);
        setLoading(false);
      });
  }, []);

  return (
    <Paper elevation={3} style={{ 
      padding: '20px', 
      marginTop: '20px', 
      height: '100%', 
      backgroundColor: '#e3f2fd' 
    }}>
      <div style={{
        height: '300px', 
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          top: '100%',
          animation: 'moveUp 20s linear infinite',
          backgroundColor: '#e3f2fd' 
        }}>
          {loading ? (
            <CircularProgress />
          ) : (
            images.map((image, index) => (
              <div key={index} style={{ marginBottom: '10px', width: '100%', height: '100px' }}>
                <img
                  src={image.url}
                  alt={image.title || "Approved"}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover' 
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>
      <style>{`
        @keyframes moveUp {
          0% { top: 100%; }
          100% { top: -100%; }
        }
      `}</style>
    </Paper>
  );
};

export default ImageSlider;
