import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import {
  Box, Container, Typography, TextField, Button, Select, MenuItem,
  Card, CardContent, CardMedia, Avatar, IconButton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid, CircularProgress,
  LinearProgress
} from '@mui/material';
import { 
  Search, TrendingUp, Twitter, Close, Send, Repeat, Favorite, 
  Image as ImageIcon, VideoLibrary, ThumbUp, ThumbDown, RemoveCircleOutline,
  Mood, MoodBad, SentimentNeutral, AddPhotoAlternate
} from '@mui/icons-material';

import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../utils/AuthContext';
import { BASE_URL } from '../../config';

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#FFD700',
  color: '#000000',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#FFC000',
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  marginBottom: theme.spacing(2),
  overflow: 'hidden',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#FFD700',
    },
    '&:hover fieldset': {
      borderColor: '#FFC000',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#FFD700',
    },
  },
}));

const SentimentResults = ({ sentimentResults, totalAnalyzed }) => {
  const getSentimentColor = (sentiment) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'success.main';
      case 'negative': return 'error.main';
      case 'neutral': return 'warning.main';
      default: return 'text.primary';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return <Mood sx={{ color: 'success.main' }} />;
      case 'negative': return <MoodBad sx={{ color: 'error.main' }} />;
      case 'neutral': return <SentimentNeutral sx={{ color: 'warning.main' }} />;
      default: return null;
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">Sentiment Analysis Results</Typography>
      <Typography variant="body2" gutterBottom>Total tweets analyzed: {totalAnalyzed}</Typography>
      {Object.entries(sentimentResults).map(([sentiment, percentage]) => (
        <Card key={sentiment} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={1}>
              {getSentimentIcon(sentiment)}
              <Typography variant="h6" sx={{ ml: 1 }}>{sentiment}</Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Box flexGrow={1} mr={2}>
                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'grey.300',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      backgroundColor: getSentimentColor(sentiment),
                    },
                  }}
                />
              </Box>
              <Typography variant="body2" fontWeight="bold">
                {percentage.toFixed(1)}%
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

const TypeSearchResults = ({ results, onLoadMore, onAnalyzeSentiment }) => {
  const getSentimentIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return <Mood sx={{ color: 'success.main' }} />;
      case 'negative': return <MoodBad sx={{ color: 'error.main' }} />;
      case 'neutral': return <SentimentNeutral sx={{ color: 'warning.main' }} />;
      default: return null;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'neutral': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">Search Results</Typography>
      <Grid container spacing={3}>
        {results.map((tweet) => (
          <Grid item xs={12} key={tweet.id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar src={tweet.user.profile_image_url} alt={tweet.user.name} />
                  <Box ml={2}>
                    <Typography variant="subtitle1" fontWeight="bold">{tweet.user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">@{tweet.user.screen_name}</Typography>
                  </Box>
                </Box>
                <Typography variant="body1" gutterBottom>{tweet.text}</Typography>
                {tweet.extended_entities && tweet.extended_entities.media && (
                  <Box mt={2}>
                    {tweet.extended_entities.media.map((media, index) => (
                      <Box key={index} mb={1}>
                        {media.type === 'photo' && (
                          <img src={media.media_url_https} alt="Tweet media" style={{ maxWidth: '100%', borderRadius: 8 }} />
                        )}
                        {media.type === 'video' && (
                          <video src={media.video_info.variants[0].url} controls style={{ maxWidth: '100%', borderRadius: 8 }} />
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Box display="flex" alignItems="center">
                    <Repeat sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">{tweet.retweet_count}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <Favorite sx={{ mr: 1, color: 'error.main' }} />
                    <Typography variant="body2" color="text.secondary">{tweet.favorite_count}</Typography>
                  </Box>
                  {tweet.extended_entities && tweet.extended_entities.media && (
                    <Box display="flex" alignItems="center">
                      {tweet.extended_entities.media[0].type === 'photo' ? (
                        <ImageIcon sx={{ mr: 1, color: 'primary.main' }} />
                      ) : (
                        <VideoLibrary sx={{ mr: 1, color: 'primary.main' }} />
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {tweet.extended_entities.media.length}
                      </Typography>
                    </Box>
                  )}
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => onAnalyzeSentiment(tweet.id, tweet.text)}
                    startIcon={<Mood />}
                    sx={{ textTransform: 'none', borderRadius: '20px' }}
                  >
                    Analyze Sentiment
                  </Button>
                </Box>
                {tweet.sentiment && (
                  <Box mt={2}>
                    <Chip 
                      icon={getSentimentIcon(tweet.sentiment)}
                      label={tweet.sentiment}
                      color={getSentimentColor(tweet.sentiment)}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box display="flex" justifyContent="center" mt={3}>
        <Button variant="outlined" onClick={onLoadMore}>Load More</Button>
      </Box>
    </Box>
  );
};

const TrendsDisplay = ({ trends, onSentimentAnalysis, onSearchTrend }) => {
  const getSentimentIcon = (sentiment) => {
    if (!sentiment) return null;
    switch (sentiment.type.toLowerCase()) {
      case 'positive': return <Mood sx={{ color: 'success.main' }} />;
      case 'negative': return <MoodBad sx={{ color: 'error.main' }} />;
      case 'neutral': return <SentimentNeutral sx={{ color: 'text.secondary' }} />;
      default: return null;
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">Trending Topics</Typography>
      <Grid container spacing={3}>
        {trends.map((trend, index) => (
          <Grid item xs={12} sm={6} md={4} key={trend.name}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">{trend.name}</Typography>
                </Box>
                {trend.tweet_volume && (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {trend.tweet_volume.toLocaleString()} tweets
                  </Typography>
                )}
                {trend.sentiment && (
                  <Chip 
                    icon={getSentimentIcon(trend.sentiment)}
                    label={trend.sentiment.type}
                    sx={{ mb: 2 }}
                  />
                )}
                <Box display="flex" justifyContent="space-between">
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => onSentimentAnalysis(trend.name, index)}
                    startIcon={<Mood />}
                    disabled={trend.loadingSentiment}
                    sx={{ textTransform: 'none', borderRadius: '20px' }}
                  >
                    {trend.loadingSentiment ? 'Analyzing...' : 'Sentiment'}
                  </Button>
                  <Button 
                    variant="contained" 
                    size="small" 
                    onClick={() => onSearchTrend(trend.name)}
                    startIcon={<Search />}
                    sx={{ textTransform: 'none', borderRadius: '20px' }}
                  >
                    Search
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const TweetList = () => {
  const { userData } = useAuth();
  const [tweets, setTweets] = useState([]);
  const [selectedTweetId, setSelectedTweetId] = useState('');
  const [tweetDetails, setTweetDetails] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [view, setView] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedTrend, setSelectedTrend] = useState('');
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [typeSearchType, setTypeSearchType] = useState('Top');
  const [typeSearchResults, setTypeSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sentimentQuery, setSentimentQuery] = useState('');
  const [sentimentResults, setSentimentResults] = useState(null);
  const [loadingSentiment, setLoadingSentiment] = useState(false);
  const [totalAnalyzed, setTotalAnalyzed] = useState(0);
  const [error, setError] = useState(null);
  const cancelTokenRef = useRef(null);
  const [logoAdded, setLogoAdded] = useState(false);
  const [imageWithLogo, setImageWithLogo] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    axiosInstance.get('/api/tweets/')
      .then(response => {
        setTweets(response.data);
      })
      .catch(error => {
        console.error('Error fetching tweet IDs:', error);
      });
  }, []);

  useEffect(() => {
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, []);

  const fetchTrends = () => {
    setLoadingTrends(true);
    axiosInstance.get('/api/fetch-trends/')
      .then(response => {
        const trendsData = response.data.trends[0]?.trends || [];
        setTrends(trendsData.map(trend => ({ ...trend, sentiment: null, loadingSentiment: false })));
        setTypeSearchResults([]);
        setTweetDetails(null);
        setView('trends');
      })
      .catch(error => {
        console.error('Error fetching trends:', error);
        setError('Failed to fetch trends. Please try again.');
      })
      .finally(() => {
        setLoadingTrends(false);
      });
  };
 
  const fetchSentimentForTrend = (trendName, index) => {
    const updatedTrends = [...trends];
    updatedTrends[index].loadingSentiment = true;
    setTrends(updatedTrends);

    axiosInstance.get('/api/fetch-trends-sentiment/', {
      params: { text: trendName }
    })
      .then(response => {
        const sentimentType = response.data;
        const updatedTrends = [...trends];
        updatedTrends[index].sentiment = { type: sentimentType };
        updatedTrends[index].loadingSentiment = false;
        setTrends(updatedTrends);
      })
      .catch(error => {
        console.error('Error fetching sentiment:', error);
        const updatedTrends = [...trends];
        updatedTrends[index].loadingSentiment = false;
        updatedTrends[index].sentiment = { error: 'Failed to fetch sentiment' };
        setTrends(updatedTrends);
      });
  };

  const handleSentimentSearchSubmit = async (event) => {
    event.preventDefault();
    if (sentimentQuery) {
      setLoadingSentiment(true);
      setView('loading');
      setError(null);

      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Operation canceled due to new request.');
      }

      cancelTokenRef.current = axios.CancelToken.source();

      try {
        const response = await axiosInstance.get(`/api/twitter-sentiment/`, {
          params: { query: sentimentQuery },
          cancelToken: cancelTokenRef.current.token,
          timeout: 30000 // 30 seconds timeout
        });

        console.log("Sentiment API Response:", response.data);
        if (response.data && response.data.sentiment_summary) {
          setSentimentResults(response.data.sentiment_summary);
          setTotalAnalyzed(response.data.total_analyzed || 0);
          setView('sentimentResults');
        } else {
          setError('Received an unexpected response format from the server.');
          setView('error');
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request canceled:', error.message);
        } else if (error.code === 'ECONNABORTED') {
          setError('The request timed out. Please try again.');
        } else {
          setError(error.response?.data?.error || error.message || 'An unknown error occurred');
        }
        setView('error');
      } finally {
        setLoadingSentiment(false);
      }
    }
  };

  const handleTypeSearchSubmit = (event) => {
    event.preventDefault();
    if (typeSearchQuery) {
      searchTweetsByType(typeSearchQuery, typeSearchType);
    }
  };

  const searchTweetsByType = (query, type) => {
    setLoading(true);
    axiosInstance.get(`/api/twitter-search/`, {
      params: { query, type }
    })
      .then(response => {
        console.log("API Response:", response.data);
        setTypeSearchResults(response.data.tweets || []);
        setView('typeSearchResults');
      })
      .catch(error => {
        console.error('Error searching for tweets by type:', error);
        setError('Failed to search tweets. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleLoadMore = () => {
    // Implement load more functionality here
    console.log('Load more tweets');
  };

  const openDialog = () => {
    fetchImages();
    fetchTrends();
    setDialogOpen(true);
  };

  const fetchImages = () => {
    axiosInstance.get('/api/approved_images/')
      .then(response => {
        const fetchedImages = response.data.images.map(img => ({
          ...img,
          url: `${BASE_URL}${img.image_url}`,
        }));
        setImages(fetchedImages);
      })
      .catch(error => {
        console.error('Error fetching images:', error);
        setError('Failed to fetch images. Please try again.');
      });
  };

  const handleImageSelection = (image) => {
    setSelectedImage(image);
    setLogoAdded(false);
    setImageWithLogo(null);
  };

  const handleAddLogo = () => {
    if (selectedImage) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const image = new Image();
      const logo = new Image();
  
      image.crossOrigin = "Anonymous";  
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);
  
        logo.onload = () => {
          const logoWidth = image.width * 0.2; 
          const logoHeight = (logoWidth / logo.width) * logo.height;
          const logoX = image.width - logoWidth - 10;
          const logoY = image.height - logoHeight - 10;
  
          ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);
  
          const imageWithLogo = canvas.toDataURL('image/jpeg');
          setImageWithLogo(imageWithLogo);
          setLogoAdded(true);
        };
  
        logo.src = LOGO_DATA_URL;  
      };
  
      image.src = selectedImage;
    }
  };

  const handlePostToTwitter = async () => {
    if (selectedImage || imageWithLogo) {
      const imageToUse = logoAdded ? imageWithLogo : selectedImage;
      const response = await fetch(imageToUse);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('status', selectedTrend);
      formData.append('user_id', userData.userId);
      formData.append('media', file);

      axiosInstance.post('/api/post_text_with_media_to_twitter/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
        .then(response => {
          setDialogOpen(false);
          setLogoAdded(false);
          setImageWithLogo(null);
          setSuccessMessage('Successfully posted to Twitter!');
        })
        .catch(error => {
          console.error('Error posting to Twitter:', error);
          setError('Failed to post to Twitter. Please try again.');
        });
    }
  };

  const analyzeSentimentForTweet = (tweetId, tweetText) => {
    axiosInstance.get('/api/fetch-trends-sentiment/', {
      params: { text: tweetText }
    })
      .then(response => {
        const sentimentType = response.data;
        const updatedResults = typeSearchResults.map(tweet => 
          tweet.id === tweetId ? { ...tweet, sentiment: sentimentType } : tweet
        );
        setTypeSearchResults(updatedResults);
      })
      .catch(error => {
        console.error('Error analyzing tweet sentiment:', error);
        // Handle error (e.g., show an error message to the user)
      });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            <Typography variant="h5" gutterBottom>Twitter Dashboard</Typography>
            
            {/* Sentiment Analysis Search */}
            <form onSubmit={handleSentimentSearchSubmit}>
              <StyledTextField
                fullWidth
                variant="outlined"
                value={sentimentQuery}
                onChange={(e) => setSentimentQuery(e.target.value)}
                placeholder="Search for sentiment analysis..."
                sx={{ mb: 2 }}
              />
              <StyledButton
                fullWidth
                variant="contained"
                type="submit"
                startIcon={<Search />}
                disabled={loadingSentiment}
                sx={{ mb: 2 }}
              >
                {loadingSentiment ? 'Analyzing...' : 'Analyze sentiment'}
              </StyledButton>
            </form>

            {/* Type-based Search */}
            <form onSubmit={handleTypeSearchSubmit}>
              <StyledTextField
                fullWidth
                variant="outlined"
                value={typeSearchQuery}
                onChange={(e) => setTypeSearchQuery(e.target.value)}
                placeholder="Type-based search..."
                sx={{ mb: 2 }}
              />
              <Select
                fullWidth
                value={typeSearchType}
                onChange={(e) => setTypeSearchType(e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="Top">Top</MenuItem>
                <MenuItem value="Latest">Latest</MenuItem>
                <MenuItem value="Photos">Photos</MenuItem>
                <MenuItem value="Videos">Videos</MenuItem>
              </Select>
              <StyledButton
                fullWidth
                variant="contained"
                type="submit"
                startIcon={<Search />}
                sx={{ mb: 2 }}
              >
                Search by type
              </StyledButton>
            </form>

            <StyledButton
              fullWidth
              variant="contained"
              onClick={fetchTrends}
              disabled={loadingTrends}
              startIcon={<TrendingUp />}
              sx={{ mb: 2 }}
            >
              {loadingTrends ? 'Loading...' : 'Show trends'}
            </StyledButton>
            <StyledButton
              fullWidth
              variant="contained"
              onClick={openDialog}
              startIcon={<Twitter />}
            >
              Post to Twitter
            </StyledButton>
          </Box>
        </Grid>
        <Grid item xs={12} md={9}>
          {loading || loadingSentiment ? (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="200px">
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body2">
                {loadingSentiment ? 'Analyzing tweets...' : 'Loading...'}
              </Typography>
            </Box>
          ) : (
            <>
              {view === 'sentimentResults' && sentimentResults && (
                <SentimentResults sentimentResults={sentimentResults} totalAnalyzed={totalAnalyzed} />
              )}

              {view === 'tweetDetails' && tweetDetails && (
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Tweet Details</Typography>
                    <Box display="flex" justifyContent="space-between">
                      <Box>
                        <Typography color="textSecondary">Retweets</Typography>
                        <Typography variant="h4">{tweetDetails.retweets}</Typography>
                      </Box>
                      <Box>
                        <Typography color="textSecondary">Likes</Typography>
                        <Typography variant="h4">{tweetDetails.likes}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </StyledCard>
              )}

              {view === 'typeSearchResults' && typeSearchResults.length > 0 && (
                <TypeSearchResults 
                  results={typeSearchResults} 
                  onLoadMore={handleLoadMore}
                  onAnalyzeSentiment={analyzeSentimentForTweet}
                />
              )}

              {view === 'trends' && trends.length > 0 && (
                <TrendsDisplay 
                  trends={trends} 
                  onSentimentAnalysis={fetchSentimentForTrend}
                  onSearchTrend={(trendName) => {
                    setTypeSearchQuery(trendName);
                    searchTweetsByType(trendName, typeSearchType);
                  }}
                />
              )}

              {view === 'error' && (
                <StyledCard>
                  <CardContent>
                    <Typography color="error" variant="h6">An error occurred:</Typography>
                    <Typography color="error">{error}</Typography>
                    <Typography variant="body2" mt={2}>Please try again or contact support if the problem persists.</Typography>
                  </CardContent>
                </StyledCard>
              )}
            </>
          )}
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Post to Twitter</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {images.map((image, index) => (
              <Grid item xs={4} key={index}>
                <CardMedia
                  component="img"
                  image={logoAdded && selectedImage === image.url ? imageWithLogo : image.url}
                  alt={`Preview ${index}`}
                  sx={{
                    height: 150,
                    objectFit: 'cover',
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: selectedImage === image.url ? '2px solid #FFD700' : 'none',
                  }}
                  onClick={() => handleImageSelection(image.url)}
                />
              </Grid>
            ))}
          </Grid>
          {selectedImage && (
            <Box mt={2}>
              <Typography variant="subtitle1" gutterBottom>Selected Image:</Typography>
              <img src={logoAdded ? imageWithLogo : selectedImage} alt="Selected" style={{ maxWidth: '100%', maxHeight: '200px' }} />
            </Box>
          )}
          <Select
            fullWidth
            value={selectedTrend}
            onChange={(e) => setSelectedTrend(e.target.value)}
            sx={{ mt: 2 }}
          >
            <MenuItem value="" disabled>Select a trend</MenuItem>
            {trends.map((trend) => (
              <MenuItem key={trend.name} value={trend.name}>
                {trend.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <StyledButton 
            onClick={handleAddLogo} 
            startIcon={<AddPhotoAlternate />}
            disabled={!selectedImage || logoAdded}
          >
            {logoAdded ? 'Logo Added' : 'Add Logo'}
          </StyledButton>
          <StyledButton onClick={() => setDialogOpen(false)} startIcon={<Close />}>
            Close
          </StyledButton>
          <StyledButton 
            onClick={handlePostToTwitter} 
            startIcon={<Send />}
            disabled={!selectedImage}
          >
            Post
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TweetList;