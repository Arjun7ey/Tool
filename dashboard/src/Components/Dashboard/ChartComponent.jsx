import React, { useState } from 'react';
import { Grid, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Avatar, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import PostPreviewSelection from './PostPreviewSelection';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import RepeatIcon from '@mui/icons-material/Repeat';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IosShareIcon from '@mui/icons-material/IosShare';
import VerifiedIcon from '@mui/icons-material/Verified';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import SendIcon from '@mui/icons-material/Send';
import InsertCommentIcon from '@mui/icons-material/InsertComment';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import PublicIcon from '@mui/icons-material/Public';
import CloseIcon from '@mui/icons-material/Close';

const MotionPaper = motion(Paper);

const socialMediaPreviews = [
  { name: 'Twitter', icon: 'https://www.freepnglogos.com/uploads/twitter-x-logo-png/twitter-x-logo-png-9.png' },
  { name: 'Facebook', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg' },
  { name: 'Instagram', icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png' },
];

const ChartComponent = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [customText, setCustomText] = useState('');

  const handlePlatformClick = (platform) => {
    setSelectedPlatform(platform);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedImage(null);
    setCustomText('');
  };

  const handleImageSelection = (image) => {
    setSelectedImage(image);
  };

  const handlePost = () => {
    console.log('Posting to', selectedPlatform.name, 'with image:', selectedImage, 'and text:', customText);
    handleDialogClose();
  };

  const renderPreview = () => {
    switch (selectedPlatform?.name) {
      case 'Twitter':
        return <TwitterPreview />;
      case 'Facebook':
        return <FacebookPreview />;
      case 'Instagram':
        return <InstagramPreview />;
      default:
        return null;
    }
  };

  const TwitterPreview = () => (
    <Box sx={{ mt: 2, p: 2, border: '1px solid #eff3f4', borderRadius: '16px', bgcolor: '#262b3b', color: '#FFFFFF' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
        <Avatar 
          sx={{ width: 48, height: 48, mr: 2 }}
          src="https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg"
        />
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 1, color: '#FFFFFF' }}>Twitter</Typography>
            <VerifiedIcon sx={{ color: '#FFD700', fontSize: 18, mr: 1 }} />
            <Typography variant="body2" sx={{ color: '#8899A6' }}>@Twitter · 1h</Typography>
          </Box>
          <Typography variant="body1" sx={{ mb: 2, color: '#FFFFFF' }}>
            {customText || "What's happening?"}
          </Typography>
          {selectedImage && (
            <Box sx={{ mb: 2, borderRadius: '16px', overflow: 'hidden', border: '1px solid #2F3336' }}>
              <img
                src={selectedImage.url}
                alt="Tweet image"
                style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
              />
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', maxWidth: '425px', mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#8899A6' }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: 18, mr: 1 }} />
              <Typography variant="body2">1.2K</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#8899A6' }}>
              <RepeatIcon sx={{ fontSize: 18, mr: 1 }} />
              <Typography variant="body2">4.8K</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#8899A6' }}>
              <FavoriteBorderIcon sx={{ fontSize: 18, mr: 1 }} />
              <Typography variant="body2">35.7K</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#8899A6' }}>
              <IosShareIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const InstagramPreview = () => (
    <Box sx={{ mt: 2, p: 2, border: '1px solid #262626', borderRadius: '3px', bgcolor: '#262b3b', color: '#FFFFFF' }}>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ width: 32, height: 32, mr: 1 }}
              src="https://instagram.com/static/images/anonymousUser.jpg/23e7b3b2a737.jpg"
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>instagram</Typography>
          </Box>
          <MoreHorizIcon sx={{ color: '#FFFFFF' }} />
        </Box>
        {selectedImage && (
          <Box sx={{ mb: 2, borderRadius: '3px', overflow: 'hidden' }}>
            <img
              src={selectedImage.url}
              alt="Instagram post"
              style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
            />
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex' }}>
            <IconButton size="small" sx={{ color: '#FFFFFF' }}><FavoriteBorderIcon /></IconButton>
            <IconButton size="small" sx={{ color: '#FFFFFF' }}><ChatBubbleOutlineIcon /></IconButton>
            <IconButton size="small" sx={{ color: '#FFFFFF' }}><SendIcon /></IconButton>
          </Box>
          <IconButton size="small" sx={{ color: '#FFFFFF' }}><BookmarkBorderIcon /></IconButton>
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5, color: '#FFFFFF' }}>1,000,000 likes</Typography>
        <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
          <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>instagram</Box>
          {customText || "Your caption here"}
        </Typography>
      </Box>
    </Box>
  );

  const FacebookPreview = () => (
    <Box sx={{ mt: 2, p: 2, border: '1px solid #2D88FF', borderRadius: '8px', bgcolor: '#262b3b', color: '#FFFFFF' }}>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ width: 40, height: 40, mr: 1 }}
            src="https://static.xx.fbcdn.net/rsrc.php/v3/yQ/r/4KZKRR8VgIS.png"
          />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>Facebook</Typography>
            <Typography variant="caption" sx={{ color: '#B0B3B8' }}>1 hr · <PublicIcon sx={{ fontSize: 12, ml: 0.5 }} /></Typography>
          </Box>
        </Box>
        <Typography variant="body1" sx={{ mb: 2, color: '#FFFFFF' }}>
          {customText || "What's on your mind?"}
        </Typography>
        {selectedImage && (
          <Box sx={{ mb: 2, borderRadius: '8px', overflow: 'hidden' }}>
            <img
              src={selectedImage.url}
              alt="Facebook post"
              style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
            />
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #3E4042', pt: 1 }}>
          <Button startIcon={<ThumbUpOutlinedIcon />} sx={{ color: '#B0B3B8' }}>Like</Button>
          <Button startIcon={<InsertCommentIcon />} sx={{ color: '#B0B3B8' }}>Comment</Button>
          <Button startIcon={<SendIcon />} sx={{ color: '#B0B3B8' }}>Share</Button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Grid container spacing={3}>
    <AnimatePresence>
      {socialMediaPreviews.map((platform, index) => (
        <Grid item xs={12} sm={4} key={index}>
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0px 10px 20px rgba(0,0,0,0.2)',
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePlatformClick(platform)}
            sx={{
              p: 3,
              textAlign: 'center',
              background: 'linear-gradient(145deg, #FFFFFF, #F0F0F0)',
              borderRadius: '15px',
              boxShadow: '5px 5px 15px #D1D1D1, -5px -5px 15px #FFFFFF',
              cursor: 'pointer',
              border: '1px solid #E0E0E0',
            }}
          >
            <Box
              sx={{
                width: '60px',
                height: '60px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: platform.name === 'Twitter' ? '#000000' : 'transparent',
              }}
            >
              <img 
                src={platform.icon} 
                alt={platform.name} 
                style={{ 
                  width: platform.name === 'Twitter' ? '40px' : '60px', 
                  height: platform.name === 'Twitter' ? '40px' : '60px',
                  objectFit: 'contain'
                }} 
              />
            </Box>
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold', color: '#000000' }}>
              {platform.name}
            </Typography>
          </MotionPaper>
        </Grid>
      ))}
    </AnimatePresence>
    
      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: '#000000',
            color: '#FFFFFF',
            borderRadius: '15px',
            border: '1px solid #FFD700',
          },
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 'bold', 
          color: '#FFD700', 
          borderBottom: '2px solid #FFD700',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          Post to {selectedPlatform?.name}
          <IconButton onClick={handleDialogClose} sx={{ color: '#FFD700' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#FFD700' }}>
            Select an Image
          </Typography>
          <PostPreviewSelection onSelectPreview={handleImageSelection} />
          
          <TextField
            label={selectedPlatform?.name === 'Twitter' ? "What's happening?" : "What's on your mind?"}
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            sx={{ 
              mt: 3, 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#FFD700',
                },
                '&:hover fieldset': {
                  borderColor: '#FFD700',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FFD700',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#FFD700',
              },
              '& .MuiInputBase-input': {
                color: '#FFFFFF',
              },
            }}
          />
          
          {renderPreview()}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleDialogClose} sx={{ color: '#FFD700' }}>
            Cancel
          </Button>
          <Button
            onClick={handlePost}
            variant="contained"
            sx={{
              bgcolor: '#FFD700',
              color: '#000000',
              '&:hover': { 
                bgcolor: '#E6C200',
              },
            }}
          >
            {selectedPlatform?.name === 'Twitter' ? 'Tweet' : 'Post'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default ChartComponent;