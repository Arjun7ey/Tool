import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../utils/axiosInstance';
import { BASE_URL } from '../../config';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

const ImageSlider = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/approved_images/')
      .then((response) => {
        if (response.data.images && Array.isArray(response.data.images)) {
          const imagesWithFullUrls = response.data.images.map(image => ({
            ...image,
            url: `${BASE_URL}${image.image_url}`
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images]);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={400}>
        <CircularProgress sx={{ color: '#FFD700' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        height: 400,
        overflow: 'hidden',
        borderRadius: '30px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        perspective: '1000px',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(255,215,0,0.3) 0%, rgba(0,0,0,0) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        },
      }}
    >
      <AnimatePresence initial={false}>
        <motion.img
          key={currentIndex}
          src={images[currentIndex]?.url}
          alt={images[currentIndex]?.title || "Approved"}
          initial={{ opacity: 0, scale: 1.1, rotateY: -15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.9, rotateY: 15 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
          }}
        />
      </AnimatePresence>
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 3,
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
          backdropFilter: 'blur(10px)',
          zIndex: 2,
        }}
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Typography variant="h5" sx={{ 
            color: '#FFD700', 
            fontWeight: 'bold', 
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: '0.5px',
          }}>
            {images[currentIndex]?.title || "Approved Image"}
          </Typography>
        </motion.div>
      </Box>
      <IconButton
        onClick={prevImage}
        sx={{
          position: 'absolute',
          left: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(0,0,0,0.6)',
          color: '#FFD700',
          '&:hover': { 
            bgcolor: 'rgba(255,215,0,0.8)',
            color: 'black',
          },
          transition: 'all 0.3s ease',
          zIndex: 3,
        }}
      >
        <ArrowBackIosIcon />
      </IconButton>
      <IconButton
        onClick={nextImage}
        sx={{
          position: 'absolute',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(0,0,0,0.6)',
          color: '#FFD700',
          '&:hover': { 
            bgcolor: 'rgba(255,215,0,0.8)',
            color: 'black',
          },
          transition: 'all 0.3s ease',
          zIndex: 3,
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px',
          zIndex: 3,
        }}
      >
        {images.map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: index === currentIndex ? '#FFD700' : 'rgba(255,255,255,0.5)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ImageSlider;