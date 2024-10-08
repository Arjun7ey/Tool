import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Grid, Paper, Typography, TextField, Button, IconButton,
  Avatar, Chip, Divider, Snackbar, Alert, Tabs, Tab, Menu, MenuItem,
  List, ListItem, ListItemText, ListItemIcon, Card, CardContent, CardMedia,
  Tooltip, Popover, CircularProgress, ImageList, ImageListItem, ImageListItemBar,
  useTheme, useMediaQuery, Switch, FormControlLabel, Slider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress, SpeedDial, SpeedDialAction, SpeedDialIcon,
  CssBaseline, ThemeProvider, createTheme, Fade, Grow
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Image as ImageIcon, GifBox as GifIcon, Poll as PollIcon,
  EmojiEmotions as EmojiIcon, Schedule as ScheduleIcon,
  Twitter as TwitterIcon, Facebook as FacebookIcon, Instagram as InstagramIcon,
  Lightbulb as LightbulbIcon, Category as CategoryIcon, LocationOn as LocationIcon,
  ChatBubbleOutline, Share, Favorite, ThumbUp, BookmarkBorder, Send,
  Delete as DeleteIcon, Add as AddIcon,
  FormatBold as FormatBoldIcon, FormatItalic as FormatItalicIcon,
  FormatUnderlined as FormatUnderlinedIcon, FormatColorFill as FormatColorFillIcon,
  Notifications as NotificationsIcon, Settings as SettingsIcon,
  Drafts as DraftsIcon, History as HistoryIcon, Analytics as AnalyticsIcon,
  CloudUpload as CloudUploadIcon, Star as StarIcon,
  Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon,
  TrendingUp as TrendingIcon, Colorize as ColorizeIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import WordCloud from 'react-d3-cloud';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { SketchPicker } from 'react-color';
import { Line, Bar } from 'react-chartjs-2';
import { AutoAwesome as AIIcon } from '@mui/icons-material';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import EmojiPicker from 'emoji-picker-react';
import axiosInstance from '../utils/axiosInstance';
import { BASE_URL } from '../../config';
import { useAuth } from '../utils/AuthContext';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ChartTooltip, Legend);

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'rgba(18, 18, 18, 0.8)' 
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(4),
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
    : '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.18)}`,
  height: '100%',
  overflowY: 'auto',
  transition: 'all 0.3s ease-in-out',
}));

const PreviewCard = styled(Card)(({ theme, platform }) => ({
  background: platform === 'twitter' ? '#ffffff' :
               platform === 'facebook' ? '#f0f2f5' :
               platform === 'instagram' ? '#fafafa' : '#ffffff',
  borderRadius: theme.shape.borderRadius * 2,
  marginBottom: theme.spacing(2),
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
  },
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing(2),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  background: alpha(theme.palette.background.default, 0.6),
}));

const CharCount = styled(Typography)(({ theme, count, limit }) => ({
  color: count > limit - 20 ? theme.palette.error.main : 
         count > limit - 40 ? theme.palette.warning.main : 
         theme.palette.text.secondary,
  fontWeight: 'bold',
  transition: 'color 0.3s ease-in-out',
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.1)}`,
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    transform: 'scale(1.1)',
  },
}));

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  '& .MuiSpeedDial-actions': {
    paddingBottom: theme.spacing(2),
  },
}));

const AnimatedTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 4px 8px ${alpha(theme.palette.common.black, 0.1)}`,
    },
    '&.Mui-focused': {
      transform: 'translateY(-2px)',
      boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

const dummyCategories = ['Tech', 'Marketing', 'Social', 'News', 'Entertainment', 'Sports', 'Food', 'Travel', 'Fashion', 'Health'];

const dummyLocations = [
  'New York, NY', 'San Francisco, CA', 'London, UK', 'Tokyo, Japan', 'Sydney, Australia',
  'Paris, France', 'Berlin, Germany', 'Toronto, Canada', 'Singapore', 'Dubai, UAE',
];

const dummyAISuggestions = {
  Tech: [
    { text: "Add hashtag #TechInnovation", action: (setText) => setText(prev => `${prev} #TechInnovation`) },
    { text: "Mention @TechGuru", action: (setText) => setText(prev => `${prev} @TechGuru`) },
    { text: "Use engaging CTA", action: (setText) => setText(prev => `${prev} What's your favorite tech gadget?`) },
  ],
  Marketing: [
    { text: "Add hashtag #DigitalMarketing", action: (setText) => setText(prev => `${prev} #DigitalMarketing`) },
    { text: "Mention @MarketingPro", action: (setText) => setText(prev => `${prev} @MarketingPro`) },
    { text: "Use engaging CTA", action: (setText) => setText(prev => `${prev} How do you measure your marketing success?`) },
  ],
  Social: [
    { text: "Add hashtag #SocialMediaTips", action: (setText) => setText(prev => `${prev} #SocialMediaTips`) },
    { text: "Mention @SocialMediaExpert", action: (setText) => setText(prev => `${prev} @SocialMediaExpert`) },
    { text: "Use engaging CTA", action: (setText) => setText(prev => `${prev} What's your favorite social platform?`) },
  ],
};

const MemoizedWordCloud = React.memo(({ data, onWordClick }) => (
  <WordCloud
    data={data}
    width={300}
    height={300}
    font="Impact"
    fontStyle="normal"
    fontWeight="normal"
    fontSize={(word) => Math.log2(word.value) * 1.5}
    spiral="rectangular"
    rotate={0}
    padding={3}
    random={Math.random}
    onWordClick={onWordClick}
  />
));

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};
const SocialMediaComposer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [postContent, setPostContent] = useState('');
  const { userData } = useAuth();
  const [platform, setPlatform] = useState('twitter');
  const [snackbarState, setSnackbarState] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tech');
  const [locationAnchorEl, setLocationAnchorEl] = useState(null);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);
  const [pollAnchorEl, setPollAnchorEl] = useState(null);
  const [scheduleAnchorEl, setScheduleAnchorEl] = useState(null);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [scheduleDate, setScheduleDate] = useState(null);
  const [fontStyle, setFontStyle] = useState({ bold: false, italic: false, underline: false });
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(16);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useLocalStorage('socialMediaComposerSettings', {
    darkMode: false,
    autoSaveDrafts: true,
    notificationsEnabled: true,
    language: 'en',
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [customLocation, setCustomLocation] = useState('');
  const [postHistory, setPostHistory] = useLocalStorage('postHistory', []);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [approvedImages, setApprovedImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedTrend, setSelectedTrend] = useState('');
  const [error, setError] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  const aiSuggestions = useMemo(() => dummyAISuggestions[selectedCategory] || [], [selectedCategory]);

  const fetchTrends = useCallback(async () => {
    if (trendingTopics.length > 0) return;
    setIsLoadingTrends(true);
    try {
      const response = await axiosInstance.get('/api/fetch-trends/');
      if (response.data && response.data.trends && Array.isArray(response.data.trends[0].trends)) {
        const formattedTrends = response.data.trends[0].trends.map(trend => ({
          text: trend.name,
          value: trend.tweet_volume || 1000
        }));
        setTrendingTopics(formattedTrends);
      } else {
        throw new Error('Unexpected API response structure');
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
      setSnackbarState({
        open: true,
        message: 'Failed to fetch trends. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoadingTrends(false);
    }
  }, [trendingTopics]);

  const fetchApprovedImages = useCallback(async () => {
    if (approvedImages.length > 0) return;
    setIsLoadingImages(true);
    try {
      const response = await axiosInstance.get('/api/approved_images/');
      if (response.data && Array.isArray(response.data.images)) {
        setApprovedImages(response.data.images);
      } else {
        throw new Error('Unexpected API response structure');
      }
    } catch (error) {
      console.error('Error fetching approved images:', error);
      setSnackbarState({
        open: true,
        message: 'Failed to fetch images. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoadingImages(false);
    }
  }, [approvedImages]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  const handleContentChange = useCallback((event) => {
    setPostContent(event.target.value);
  }, []);

  const analyzeImage = useCallback(async () => {
    if (selectedMedia.length === 0) {
      setSnackbarState({
        open: true,
        message: 'Please select an image first.',
        severity: 'warning'
      });
      return;
    }

    setIsAnalyzingImage(true);
    try {
      const imageUrl = `${BASE_URL}${selectedMedia[0].image_url}`;
      const response = await axiosInstance.post('/api/analyze-image/', {
        image_url: imageUrl
      });
      setGeneratedCaption(response.data.caption);
      setPostContent(prev => `${prev} ${response.data.caption}`.trim());
      setSnackbarState({
        open: true,
        message: 'Caption generated and added to post!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      setSnackbarState({
        open: true,
        message: 'Failed to generate caption. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsAnalyzingImage(false);
    }
  }, [selectedMedia, setSnackbarState]);

  const handlePlatformChange = useCallback((event, newPlatform) => {
    setPlatform(newPlatform);
  }, []);

  const getCharLimit = useCallback(() => {
    switch (platform) {
      case 'twitter':
        return 280;
        case 'facebook':
          return 63206;
        case 'instagram':
          return 2200;
        default:
          return 280;
      }
    }, [platform]);
  
    const handleCloseSnackbar = useCallback(() => {
      setSnackbarState(prev => ({ ...prev, open: false }));
    }, []);
  
    const handleMediaMenu = useCallback((event) => {
      setAnchorEl(event.currentTarget);
      fetchApprovedImages();
    }, [fetchApprovedImages]);
  
    const handleMediaClose = useCallback(() => {
      setAnchorEl(null);
    }, []);
  
    const handleLocationClick = useCallback((event) => {
      setLocationAnchorEl(event.currentTarget);
    }, []);
  
    const handleLocationClose = useCallback(() => {
      setLocationAnchorEl(null);
    }, []);
  
    const handleLocationSelect = useCallback((location) => {
      setSelectedLocation(location);
      setPostContent(prev => `${prev} 📍 ${location}`);
      handleLocationClose();
    }, [handleLocationClose]);
  
    const handleCustomLocationChange = useCallback((event) => {
      setCustomLocation(event.target.value);
    }, []);
  
    const handleImageUrlToFile = async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const blob = await response.blob();
        if (!blob.type.startsWith('image/')) {
          throw new Error('The URL does not point to a valid image.');
        }
        return new File([blob], 'image.jpg', { type: blob.type });
      } catch (error) {
        console.error('Error converting URL to file:', error);
        return null;
      }
    };
  
    const handlePost = useCallback(async () => {
      const charLimit = getCharLimit();
      const finalPostContent = postContent.trim();
    
      if (finalPostContent.length > charLimit) {
        setSnackbarState({
          open: true,
          message: `Post is too long for ${platform}!`,
          severity: 'error'
        });
        return;
      }
    
      if (finalPostContent.length === 0) {
        setSnackbarState({
          open: true,
          message: 'Post cannot be empty!',
          severity: 'error'
        });
        return;
      }
    
      if (platform === 'twitter') {
        try {
          setIsPosting(true);
    
          const formData = new FormData();
          formData.append('status', finalPostContent);
          formData.append('user_id', userData.userId);
    
          if (selectedMedia.length > 0) {
            const imageUrl = `${BASE_URL}${selectedMedia[0].image_url}`;
            console.log('Full image URL:', imageUrl);
            const imageFile = await handleImageUrlToFile(imageUrl);
            if (imageFile) {
              formData.append('media', imageFile, 'image.jpg');
            } else {
              console.error('Failed to convert image URL to file:', imageUrl);
            }
          }
    
          const response = await axiosInstance.post('/api/post_text_with_media_to_twitter/', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log('Posted to Twitter:', response.data);
    
          if (response.data.success) {
            setSnackbarState({
              open: true,
              message: 'Posted successfully to Twitter!',
              severity: 'success'
            });
    
            // Clear the form
            setPostContent('');
            setSelectedMedia([]);
            setPollQuestion('');
            setPollOptions(['', '']);
            setScheduleDate(null);
            setSelectedImage(null);
            setSelectedTrend('');
    
            // Update post history
            setPostHistory(prev => [{
              content: finalPostContent,
              platform,
              timestamp: new Date().toISOString(),
            }, ...prev]);
          } else {
            throw new Error(response.data.error || 'Failed to post to Twitter');
          }
        } catch (error) {
          console.error('Error posting to Twitter:', error);
          setSnackbarState({
            open: true,
            message: error.message || 'Failed to post to Twitter. Please try again.',
            severity: 'error'
          });
        } finally {
          setIsPosting(false);
        }
      } else {
        // Existing logic for other platforms
        setSnackbarState({
          open: true,
          message: `Posted successfully to ${platform}!`,
          severity: 'success'
        });
    
        // Update post history for other platforms
        setPostHistory(prev => [{
          content: finalPostContent,
          platform,
          timestamp: new Date().toISOString(),
        }, ...prev]);
      }
    }, [platform, postContent, getCharLimit, selectedMedia, userData, handleImageUrlToFile, setPostHistory]);
  
    const handleMediaSelect = useCallback((image) => {
      setSelectedMedia(prev => [...prev, image]);
      setSelectedImage(image.image_url);
      handleMediaClose();
    }, [handleMediaClose]);
    

   


    const handleTrendClick = useCallback((event, word) => {
      if (word && word.text) {
        setPostContent(prev => `${prev} ${word.text}`);
        setSelectedTrend(word.text);
      }
    }, []);
  
    const handleAddCustomLocation = useCallback(() => {
      if (customLocation) {
        handleLocationSelect(customLocation);
        setCustomLocation('');
      }
    }, [customLocation, handleLocationSelect]);
  
    const handleEmojiClick = useCallback((event) => {
      setEmojiAnchorEl(event.currentTarget);
    }, []);
  
    const handleEmojiClose = useCallback(() => {
      setEmojiAnchorEl(null);
    }, []);
  
    const handleEmojiSelect = useCallback((emojiObject) => {
      setPostContent(prevContent => prevContent + emojiObject.emoji);
      handleEmojiClose();
    }, [handleEmojiClose]);
  
    const handlePollClick = useCallback((event) => {
      setPollAnchorEl(event.currentTarget);
    }, []);
  
    const handlePollClose = useCallback(() => {
      setPollAnchorEl(null);
    }, []);
  
    const handlePollQuestionChange = useCallback((event) => {
      setPollQuestion(event.target.value);
    }, []);
  
    const handlePollOptionChange = useCallback((index, value) => {
      setPollOptions(prev => {
        const newOptions = [...prev];
        newOptions[index] = value;
        return newOptions;
      });
    }, []);
  
    const handleAddPollOption = useCallback(() => {
      setPollOptions(prev => [...prev, '']);
    }, []);
  
    const handleRemovePollOption = useCallback((index) => {
      setPollOptions(prev => prev.filter((_, i) => i !== index));
    }, []);
  
    const handleScheduleClick = useCallback((event) => {
      setScheduleAnchorEl(event.currentTarget);
    }, []);
  
    const handleScheduleClose = useCallback(() => {
      setScheduleAnchorEl(null);
    }, []);
  
    const handleScheduleChange = useCallback((newValue) => {
      setScheduleDate(newValue);
      handleScheduleClose();
    }, [handleScheduleClose]);
  
    const handleFontStyleChange = useCallback((style) => {
      setFontStyle(prev => ({ ...prev, [style]: !prev[style] }));
    }, []);
  
    const handleTextColorChange = useCallback((color) => {
      setTextColor(color.hex);
    }, []);
  
    const handleFontSizeChange = useCallback((event, newValue) => {
      setFontSize(newValue);
    }, []);
  
    const handleOpenAnalytics = useCallback(() => {
      setAnalyticsData({
        impressions: 1000,
        engagements: 500,
        clicks: 200,
        shares: 50,
      });
      setIsAnalyticsOpen(true);
    }, []);
  
    const handleCloseAnalytics = useCallback(() => {
      setIsAnalyticsOpen(false);
    }, []);
  
    const handleOpenNotifications = useCallback(() => {
      setNotifications([
        { id: 1, message: 'Your post has reached 1000 views!', timestamp: new Date().toISOString() },
        { id: 2, message: 'Someone commented on your post', timestamp: new Date().toISOString() },
      ]);
      setIsNotificationsOpen(true);
    }, []);
  
    const handleCloseNotifications = useCallback(() => {
      setIsNotificationsOpen(false);
    }, []);
  
    const handleOpenSettings = useCallback(() => {
      setIsSettingsOpen(true);
    }, []);
  
    const handleCloseSettings = useCallback(() => {
      setIsSettingsOpen(false);
    }, []);
  
    const handleSettingChange = useCallback((setting, value) => {
      setSettings(prev => ({ ...prev, [setting]: value }));
    }, [setSettings]);
  
    const handleOpenHistory = useCallback(() => {
      setIsHistoryOpen(true);
    }, []);
  
    const handleCloseHistory = useCallback(() => {
      setIsHistoryOpen(false);
    }, []);
  
    const handleRestoreFromHistory = useCallback((historicalPost) => {
      setPostContent(historicalPost.content);
      setPlatform(historicalPost.platform);
      setIsHistoryOpen(false);
      setSnackbarState({
        open: true,
        message: 'Post restored from history!',
        severity: 'success'
      });
    }, []);
  
    const handleFileUpload = useCallback((event) => {
      const file = event.target.files[0];
      if (file) {
        setIsUploading(true);
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            setSelectedMedia(prev => [...prev, { 
              id: Date.now(), 
              title: file.name, 
              image_url: URL.createObjectURL(file) 
            }]);
            setSnackbarState({
              open: true,
              message: 'File uploaded successfully!',
              severity: 'success'
            });
          }
        }, 500);
      }
    }, []);
  
    const renderTextFormatting = () => (
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <StyledIconButton onClick={() => handleFontStyleChange('bold')}>
          <FormatBoldIcon color={fontStyle.bold ? 'primary' : 'inherit'} />
        </StyledIconButton>
        <StyledIconButton onClick={() => handleFontStyleChange('italic')}>
          <FormatItalicIcon color={fontStyle.italic ? 'primary' : 'inherit'} />
        </StyledIconButton>
        <StyledIconButton onClick={() => handleFontStyleChange('underline')}>
          <FormatUnderlinedIcon color={fontStyle.underline ? 'primary' : 'inherit'} />
        </StyledIconButton>
        <StyledIconButton onClick={() => setIsColorPickerOpen(true)}>
          <FormatColorFillIcon />
        </StyledIconButton>
        <Typography variant="body2" sx={{ mx: 1 }}>Size:</Typography>
        <Slider
          value={fontSize}
          onChange={handleFontSizeChange}
          min={10}
          max={24}
          step={1}
          sx={{ width: 100 }}
        />
      </Box>
    );
  
    const renderMediaPreviews = () => (
      selectedMedia.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Card sx={{ display: 'flex', alignItems: 'center' }}>
            <CardMedia
              component="img"
              sx={{ width: 100, height: 100, objectFit: 'cover' }}
              image={`${BASE_URL}${selectedMedia[0].image_url}`}
              alt={selectedMedia[0].title}
            />
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="subtitle1">{selectedMedia[0].title}</Typography>
            </CardContent>
            <IconButton
              onClick={() => setSelectedMedia([])}
            >
              <DeleteIcon />
            </IconButton>
          </Card>
        </Box>
      )
    );
    
    const renderPollPreview = () => (
      pollQuestion && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>{pollQuestion}</Typography>
          {pollOptions.map((option, index) => (
            <Typography key={index} variant="body2">• {option}</Typography>
          ))}
        </Box>
      )
    );
  
    const renderPreview = () => {
      let previewContent = (
        <Typography variant="body1" style={{
          fontWeight: fontStyle.bold ? 'bold' : 'normal',
          fontStyle: fontStyle.italic ? 'italic' : 'normal',
          textDecoration: fontStyle.underline ? 'underline' : 'none',
          color: textColor,
          fontSize: `${fontSize}px`,
        }}>
          {postContent}
        </Typography>
      );
  
      switch (platform) {
        case 'twitter':
          return (
            <PreviewCard platform={platform}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar src="/path-to-twitter-avatar.jpg" />
                  <Box ml={2}>
                    <Typography variant="subtitle1" fontWeight="bold">Twitter User</Typography>
                    <Typography variant="body2" color="textSecondary">@twitteruser</Typography>
                  </Box>
                </Box>
                {previewContent}
                {renderMediaPreviews()}
                {renderPollPreview()}
                <Box mt={2} display="flex" justifyContent="space-between">
                  <IconButton size="small"><ChatBubbleOutline fontSize="small" /></IconButton>
                  <IconButton size="small"><Favorite fontSize="small" /></IconButton>
                  <IconButton size="small"><Share fontSize="small" /></IconButton>
                </Box>
              </CardContent>
            </PreviewCard>
          );
        case 'facebook':
          return (
            <PreviewCard platform={platform}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar src="/path-to-facebook-avatar.jpg" />
                  <Box ml={2}>
                    <Typography variant="subtitle1" fontWeight="bold">Facebook User</Typography>
                    <Typography variant="body2" color="textSecondary">2 hours ago</Typography>
                  </Box>
                </Box>
                {previewContent}
                {renderMediaPreviews()}
                {renderPollPreview()}
                <Box mt={2} display="flex" justifyContent="space-between">
                  <Button startIcon={<ThumbUp />}>Like</Button>
                  <Button startIcon={<ChatBubbleOutline />}>Comment</Button>
                  <Button startIcon={<Share />}>Share</Button>
                  </Box>
            </CardContent>
          </PreviewCard>
        );
      case 'instagram':
        return (
          <PreviewCard platform={platform}>
            <CardMedia
              component="img"
              height="300"
              image="/path-to-instagram-image.jpg"
              alt="Instagram post"
            />
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar src="/path-to-instagram-avatar.jpg" />
                <Typography variant="subtitle1" fontWeight="bold" ml={2}>instagram_user</Typography>
              </Box>
              {previewContent}
              <Box mt={2} display="flex" justifyContent="space-between">
                <IconButton><Favorite /></IconButton>
                <IconButton><ChatBubbleOutline /></IconButton>
                <IconButton><Send /></IconButton>
                <IconButton><BookmarkBorder /></IconButton>
              </Box>
            </CardContent>
          </PreviewCard>
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={createTheme({
      palette: {
        mode: settings.darkMode ? 'dark' : 'light',
      },
    })}>
      <Box sx={{ 
        minHeight: '100vh',
        background: settings.darkMode 
          ? 'linear-gradient(45deg, #1a1a1a 30%, #2c2c2c 90%)'
          : 'linear-gradient(45deg, #f3f4f6 30%, #e5e7eb 90%)',
        p: 3,
        transition: 'background 0.3s ease-in-out'
      }}>
        <CssBaseline />
        
       
        <Grid container spacing={3} sx={{ height: '100%' }}>
          <Grid item xs={12} md={6}>
            <Grow in={true} timeout={1000}>
              <StyledPaper elevation={3}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main, mb: 3 }}>
                  Compose Post
                </Typography>
                <Tabs 
                  value={platform} 
                  onChange={handlePlatformChange} 
                  centered 
                  sx={{ 
                    mb: 3,
                    '& .MuiTab-root': {
                      minWidth: 'auto',
                      px: 2,
                      py: 1,
                      borderRadius: '20px',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        transform: 'translateY(-2px)',
                      },
                    },
                    '& .Mui-selected': {
                      fontWeight: 'bold',
                      backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    }
                  }}
                >
                  <Tab icon={<TwitterIcon sx={{ color: '#1DA1F2' }} />} value="twitter" />
                  <Tab icon={<FacebookIcon sx={{ color: '#4267B2' }} />} value="facebook" />
                  <Tab icon={<InstagramIcon sx={{ color: '#E1306C' }} />} value="instagram" />
                </Tabs>
                {renderTextFormatting()}
                {renderMediaPreviews()}
                <AnimatedTextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="What's on your mind?"
                  value={postContent}
                  onChange={handleContentChange}
                  InputProps={{
                    style: {
                      fontWeight: fontStyle.bold ? 'bold' : 'normal',
                      fontStyle: fontStyle.italic ? 'italic' : 'normal',
                      textDecoration: fontStyle.underline ? 'underline' : 'none',
                      color: textColor,
                      fontSize: `${fontSize}px`,
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
                      },
                    },
                  }}
                />
                <IconContainer>
                  <Box>
                    <Tooltip title="Add Media" arrow>
                      <StyledIconButton color="primary" onClick={handleMediaMenu}>
                        <ImageIcon />
                      </StyledIconButton>
                    </Tooltip>
                    <Tooltip title="Create Poll" arrow>
                      <StyledIconButton color="primary" onClick={handlePollClick}>
                        <PollIcon />
                      </StyledIconButton>
                    </Tooltip>
                    <Tooltip title="Add Emoji" arrow>
                      <StyledIconButton color="primary" onClick={handleEmojiClick}>
                        <EmojiIcon />
                      </StyledIconButton>
                    </Tooltip>
                    <Tooltip title="Schedule Post" arrow>
                      <StyledIconButton color="primary" onClick={handleScheduleClick}>
                        <ScheduleIcon />
                      </StyledIconButton>
                    </Tooltip>
                    <Tooltip title="Add Location" arrow>
                      <StyledIconButton color="primary" onClick={handleLocationClick}>
                        <LocationIcon />
                      </StyledIconButton>
                    </Tooltip>
                  

                    <input
                      accept="image/*,video/*"
                      style={{ display: 'none' }}
                      id="file-upload"
                      type="file"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="file-upload">
                      <Tooltip title="Upload File" arrow>
                        <StyledIconButton color="primary" component="span">
                          <CloudUploadIcon />
                        </StyledIconButton>
                      </Tooltip>
                    </label>
                    <Tooltip title="Generate AI Caption" arrow>
  <span>
    <Button
      variant="contained"
      color="primary"
      onClick={analyzeImage}
      disabled={isAnalyzingImage || selectedMedia.length === 0}
      startIcon={isAnalyzingImage ? <CircularProgress size={20} color="inherit" /> : <AIIcon />}
      sx={{
        borderRadius: '20px',
        padding: '8px 16px',
        transition: 'all 0.3s ease',
        textTransform: 'none',
        fontWeight: 'bold',
        boxShadow: (theme) => `0 0 10px ${theme.palette.primary.main}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => `0 4px 20px ${theme.palette.primary.main}`,
        },
        '&:disabled': {
          background: (theme) => theme.palette.action.disabledBackground,
          color: (theme) => theme.palette.action.disabled,
        },
        animation: isAnalyzingImage ? 'none' : 'pulse 2s infinite',
        '@keyframes pulse': {
          '0%': {
            boxShadow: (theme) => `0 0 0 0 ${theme.palette.primary.main}40`,
          },
          '70%': {
            boxShadow: (theme) => `0 0 0 10px ${theme.palette.primary.main}00`,
          },
          '100%': {
            boxShadow: (theme) => `0 0 0 0 ${theme.palette.primary.main}00`,
          },
        },
      }}
    >
      {isAnalyzingImage ? 'Generating...' : 'AI Caption'}
    </Button>
  </span>
</Tooltip>
                  </Box>
                  <CharCount variant="body2" count={postContent.length} limit={getCharLimit()}>
                    {postContent.length}/{getCharLimit()}
                  </CharCount>
                </IconContainer>
         
                {renderPollPreview()}
                {isUploading && (
                  <Box sx={{ width: '100%', mb: 2 }}>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                  </Box>
                )}
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                  <Button 
                    variant="outlined"
                    onClick={() => {}} // Implement draft saving functionality
                    startIcon={<DraftsIcon />}
                    sx={{
                      borderRadius: '20px',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                      }
                    }}
                  >
                    Save Draft
                  </Button>
                  <Box sx={{ position: 'relative' }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handlePost}
                      disabled={postContent.length === 0 || postContent.length > getCharLimit() || isPosting}
                      sx={{ 
                        borderRadius: '20px', 
                        px: 3,
                        py: 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        }
                      }}
                    >
                      Post
                    </Button>
                    {isPosting && (
                      <CircularProgress
                        size={24}
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          marginTop: '-12px',
                          marginLeft: '-12px',
                        }}
                      />
                    )}
                  </Box>
                </Box>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>Categories</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                  {dummyCategories.map((category, index) => (
                    <StyledChip 
                      key={index}
                      icon={<CategoryIcon />}
                      label={category}
                      color={selectedCategory === category ? "primary" : "default"}
                      onClick={() => setSelectedCategory(category)}
                      sx={{ mr: 1, mb: 1, borderRadius: '16px' }}
                    />
                  ))}
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>AI Suggestions</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  {aiSuggestions.map((suggestion, index) => (
                    <Tooltip key={index} title="Click to apply" arrow>
                      <StyledChip
                        icon={<LightbulbIcon />}
                        label={suggestion.text}
                        onClick={() => suggestion.action(setPostContent)}
                        color="secondary"
                        variant="outlined"
                        sx={{ mr: 1, mb: 1, borderRadius: '16px' }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </StyledPaper>
            </Grow>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grow in={true} timeout={1000}>
              <StyledPaper elevation={3}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main, mb: 3 }}>
                  Preview
                </Typography>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={platform}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderPreview()}
                  </motion.div>
                </AnimatePresence>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>Trending Topics</Typography>
                {isLoadingTrends ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <CircularProgress />
                  </Box>
                ) : (trendingTopics && trendingTopics.length > 0) ? (
                  <Box sx={{ height: 300, position: 'relative' }}>
                    <MemoizedWordCloud
                      data={trendingTopics}
                      onWordClick={handleTrendClick}
                    />
                  </Box>
                ) : (
                  <Typography>No trending topics available</Typography>
                )}
              </StyledPaper>
            </Grow>
          </Grid>
        </Grid>

        {/* Media Selection Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMediaClose}
          PaperProps={{
            elevation: 3,
            sx: { borderRadius: '12px', mt: 1 }
          }}
        >
          <MenuItem disabled={isLoadingImages}>
            <ListItemText primary={isLoadingImages ? "Loading images..." : "Approved Images"} />
          </MenuItem>
          <Divider />
          {isLoadingImages ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Box sx={{ maxHeight: 400, overflowY: 'auto', width: 320 }}>
              <ImageList cols={2} rowHeight={164}>
                {approvedImages.map((image) => (
                  <ImageListItem key={image.id} onClick={() => handleMediaSelect(image)}>
                    <img
                      src={`${BASE_URL}${image.image_url}`}
                      alt={image.title}
                      loading="lazy"
                      style={{ cursor: 'pointer', borderRadius: '8px' }}
                    />
                    <ImageListItemBar
                      title={image.title}
                      subtitle={image.department}
                      actionIcon={
                        <IconButton sx={{ color: 'rgba(255, 255, 255, 0.54)' }}>
                          <StarIcon />
                        </IconButton>
                      }
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}
        </Menu>

        {/* Poll Creation Popover */}
        <Popover
          anchorEl={pollAnchorEl}
          open={Boolean(pollAnchorEl)}
          onClose={handlePollClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          PaperProps={{
            elevation: 3,
            sx: { borderRadius: '12px', mt: 1 }
          }}
        >
          <Box sx={{ p: 2, width: 300 }}>
            <TextField
              fullWidth
              label="Poll Question"
              variant="outlined"
              value={pollQuestion}
              onChange={handlePollQuestionChange}
              sx={{ mb: 2 }}
            />
            {pollOptions.map((option, index) => (
              <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                <TextField
                  fullWidth
                  label={`Option ${index + 1}`}
                  variant="outlined"
                  value={option}
                  onChange={(e) => handlePollOptionChange(index, e.target.value)}
                />
                {index > 1 && (
                  <IconButton onClick={() => handleRemovePollOption(index)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}
            {pollOptions.length < 4 && (
              <Button startIcon={<AddIcon />} onClick={handleAddPollOption}>
                Add Option
              </Button>
            )}
          </Box>
        </Popover>

        {/* Emoji Picker Popover */}
        <Popover
          anchorEl={emojiAnchorEl}
          open={Boolean(emojiAnchorEl)}
          onClose={handleEmojiClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          >
            <EmojiPicker onEmojiClick={handleEmojiSelect} />
          </Popover>
  
          {/* Schedule Picker Popover */}
          <Popover
            anchorEl={scheduleAnchorEl}
            open={Boolean(scheduleAnchorEl)}
            onClose={handleScheduleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            PaperProps={{
              elevation: 3,
              sx: { borderRadius: '12px', mt: 1 }
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Schedule post"
                value={scheduleDate}
                onChange={handleScheduleChange}
                renderInput={(params) => <TextField {...params} sx={{ p: 2 }} />}
              />
            </LocalizationProvider>
          </Popover>
  
          {/* Location Selection Popover */}
          <Popover
            open={Boolean(locationAnchorEl)}
            anchorEl={locationAnchorEl}
            onClose={handleLocationClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            PaperProps={{
              elevation: 3,
              sx: { borderRadius: '12px', mt: 1 }
            }}
          >
            <List>
              {dummyLocations.map((location, index) => (
                <ListItem key={index} button onClick={() => handleLocationSelect(location)}>
                  <ListItemIcon>
                    <LocationIcon />
                  </ListItemIcon>
                  <ListItemText primary={location} />
                </ListItem>
              ))}
            </List>
            <Divider />
            <Box sx={{ p: 2, display: 'flex' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Custom Location"
                value={customLocation}
                onChange={handleCustomLocationChange}
              />
              <Button onClick={handleAddCustomLocation} sx={{ ml: 1 }}>Add</Button>
            </Box>
          </Popover>
  
          {/* Color Picker Dialog */}
          <Dialog open={isColorPickerOpen} onClose={() => setIsColorPickerOpen(false)}>
            <DialogTitle>Choose Text Color</DialogTitle>
            <DialogContent>
              <SketchPicker color={textColor} onChange={handleTextColorChange} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsColorPickerOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsColorPickerOpen(false)} color="primary">Apply</Button>
            </DialogActions>
          </Dialog>
  
          {/* Analytics Dialog */}
          <Dialog open={isAnalyticsOpen} onClose={handleCloseAnalytics} fullWidth maxWidth="md">
            <DialogTitle>Post Analytics</DialogTitle>
            <DialogContent>
              {analyticsData && (
                <Box>
                  <Typography variant="h6" gutterBottom>Overview</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">{analyticsData.impressions}</Typography>
                        <Typography variant="body2">Impressions</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={3}>
                      <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">{analyticsData.engagements}</Typography>
                        <Typography variant="body2">Engagements</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={3}>
                      <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">{analyticsData.clicks}</Typography>
                        <Typography variant="body2">Clicks</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={3}>
                      <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4">{analyticsData.shares}</Typography>
                        <Typography variant="body2">Shares</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Engagement Over Time</Typography>
                  <Box sx={{ height: 300 }}>
                    <Line
                      data={{
                        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
                        datasets: [
                          {
                            label: 'Engagements',
                            data: [12, 19, 3, 5, 2, 3, 7],
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  </Box>
                </Box>
              )}
            </DialogContent>
          </Dialog>
  
          {/* Notifications Dialog */}
          <Dialog open={isNotificationsOpen} onClose={handleCloseNotifications}>
            <DialogTitle>Notifications</DialogTitle>
            <DialogContent>
              <List>
                {notifications.map((notification) => (
                  <ListItem key={notification.id}>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={notification.message} 
                      secondary={format(new Date(notification.timestamp), 'PPpp')}
                    />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
          </Dialog>
  
          {/* Settings Dialog */}
          <Dialog open={isSettingsOpen} onClose={handleCloseSettings}>
            <DialogTitle>Settings</DialogTitle>
            <DialogContent>
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.darkMode} 
                    onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                  />
                }
                label="Dark Mode"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.autoSaveDrafts} 
                    onChange={(e) => handleSettingChange('autoSaveDrafts', e.target.checked)}
                  />
                }
                label="Auto-save Drafts"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.notificationsEnabled} 
                    onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
                  />
                }
                label="Enable Notifications"
              />
            </DialogContent>
          </Dialog>
  
          {/* Post History Dialog */}
          <Dialog open={isHistoryOpen} onClose={handleCloseHistory} fullWidth maxWidth="md">
            <DialogTitle>Post History</DialogTitle>
            <DialogContent>
              <List>
                {postHistory.map((post, index) => (
                  <ListItem key={index} button onClick={() => handleRestoreFromHistory(post)}>
                    <ListItemText 
                      primary={post.content.substring(0, 50) + '...'}
                      secondary={`${post.platform} - ${format(new Date(post.timestamp), 'PPpp')}`}
                    />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
          </Dialog>
  
          {/* Snackbar for notifications */}
          <Snackbar 
            open={snackbarState.open} 
            autoHideDuration={6000} 
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbarState.severity} sx={{ width: '100%', borderRadius: '12px' }}>
              {snackbarState.message}
            </Alert>
          </Snackbar>
  
          {/* SpeedDial for quick actions */}
          <StyledSpeedDial
            ariaLabel="SpeedDial"
            icon={<SpeedDialIcon />}
            onClose={() => {}}
            onOpen={() => {}}
            open={false}
          >
            <SpeedDialAction
              icon={<HistoryIcon />}
              tooltipTitle="Post History"
              onClick={handleOpenHistory}
            />
            <SpeedDialAction
              icon={<AnalyticsIcon />}
              tooltipTitle="Analytics"
              onClick={handleOpenAnalytics}
            />
            <SpeedDialAction
              icon={<NotificationsIcon />}
              tooltipTitle="Notifications"
              onClick={handleOpenNotifications}
            />
            <SpeedDialAction
              icon={<SettingsIcon />}
              tooltipTitle="Settings"
              onClick={handleOpenSettings}
            />
          </StyledSpeedDial>
        </Box>
      </ThemeProvider>
    );
  };
  
  export default React.memo(SocialMediaComposer);