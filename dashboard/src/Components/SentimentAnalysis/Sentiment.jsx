import React, { useState, useEffect } from 'react';

// Assume these utilities are correctly imported based on your project structure
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../utils/AuthContext';
import { BASE_URL } from '../../config';

const TweetList = () => {
    const { userData } = useAuth();
    const [tweets, setTweets] = useState([]);
    const [selectedTweetId, setSelectedTweetId] = useState('');
    const [tweetDetails, setTweetDetails] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [trends, setTrends] = useState([]);
    const [loadingTrends, setLoadingTrends] = useState(false);
    const [view, setView] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedTrend, setSelectedTrend] = useState('');
    const [analyzingSentiment, setAnalyzingSentiment] = useState({});

    useEffect(() => {
        axiosInstance.get('/api/tweets/')
            .then(response => {
                setTweets(response.data);
            })
            .catch(error => {
                console.error('Error fetching tweet IDs:', error);
            });
    }, []);

    const handleSelectChange = (event) => {
        const value = event.target.value;
        setSelectedTweetId(value);
        fetchTweetDetails(value);
    };

    const fetchTweetDetails = (tweetId) => {
        axiosInstance.get(`/api/fetch-tweet-details/${tweetId}/`)
            .then(response => {
                setTweetDetails(response.data);
                setSearchResults([]);
                setTrends([]);
                setView('tweetDetails');
            })
            .catch(error => {
                console.error('Error fetching tweet details:', error);
            });
    };
    const analyzeSentiment = (text, id) => {
        setAnalyzingSentiment(prev => ({ ...prev, [id]: true }));
        axiosInstance.get('/api/fetch-trends-sentiment/', {
            params: { text: text }
        })
            .then(response => {
                const sentimentType = response.data.type;
                setSearchResults(prevResults => 
                    prevResults.map(result => 
                        result.id === id ? { ...result, sentiment: { type: sentimentType } } : result
                    )
                );
            })
            .catch(error => {
                console.error('Error fetching sentiment:', error);
                setSearchResults(prevResults => 
                    prevResults.map(result => 
                        result.id === id ? { ...result, sentiment: { error: 'Failed to fetch sentiment' } } : result
                    )
                );
            })
            .finally(() => {
                setAnalyzingSentiment(prev => ({ ...prev, [id]: false }));
            });
    };
    const handleSearchSubmit = (event) => {
        event.preventDefault();
        if (searchQuery) {
            searchTweets(searchQuery);
        }
    };

    const searchTweets = (query) => {
        axiosInstance.get(`/api/search-tweets/?query=${encodeURIComponent(query)}`)
            .then(response => {
                setSearchResults(response.data.tweets || []);
                console.log(searchResults)
                setTweetDetails(null);
                setTrends([]);
                setView('searchResults');
            })
            .catch(error => {
                console.error('Error searching for tweets:', error);
            });
    };

    const fetchTrends = () => {
        setLoadingTrends(true);
        axiosInstance.get('/api/fetch-trends/')
            .then(response => {
                const trendsData = response.data.trends[0]?.trends || [];
                setTrends(trendsData.map(trend => ({ ...trend, sentiment: null, loadingSentiment: false })));
                setSearchResults([]);
                setTweetDetails(null);
                setView('trends');
            })
            .catch(error => {
                console.error('Error fetching trends:', error);
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
                const sentimentType = response.data.type;
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
    
    
    const renderSentiment = (sentiment) => {
        if (!sentiment) return null;
        if (sentiment.error) return <div style={{ color: 'red' }}>{sentiment.error}</div>;
        
        const color = sentiment.type === 'positive' ? 'green' : sentiment.type === 'negative' ? 'red' : 'grey';
        return (
            <div style={{ marginTop: '10px', color }}>
                Sentiment: {sentiment.type}
            </div>
        );
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
            });
    };

    const handleImageSelection = (image) => {
        setSelectedImage(image);
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

    const handlePostToTwitter = async () => {
        if (selectedImage && selectedTrend) {
            const imageFile = await handleImageUrlToFile(selectedImage);
            const formData = new FormData();
            formData.append('status', selectedTrend);
            formData.append('user_id', userData.userId);
            formData.append('media', imageFile);

            axiosInstance.post('/api/post_text_with_media_to_twitter/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
                .then(response => {
                    console.log('Posted to Twitter:', response.data);
                    setDialogOpen(false);
                })
                .catch(error => {
                    console.error('Error posting to Twitter:', error);
                });
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f0f2f5' }}>
            <div style={{ width: '250px', padding: '20px', backgroundColor: 'white', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <form onSubmit={handleSearchSubmit} style={{ marginBottom: '20px' }}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tweets..."
                        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    />
                    <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#1da1f2', color: 'white', border: 'none', borderRadius: '5px' }}>
                        Search
                    </button>
                </form>

                <select
                    onChange={handleSelectChange}
                    value={selectedTweetId}
                    style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
                >
                    <option value="" disabled>Select a tweet ID</option>
                    {tweets.map(tweet => (
                        <option key={tweet.id} value={tweet.tweet_id}>
                            {tweet.tweet_id}
                        </option>
                    ))}
                </select>

                <button
                    onClick={fetchTrends}
                    disabled={loadingTrends}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#1da1f2', color: 'white', border: 'none', borderRadius: '5px', marginBottom: '10px' }}
                >
                    {loadingTrends ? 'Loading...' : 'Show Trends'}
                </button>

                <button
                    onClick={openDialog}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#1da1f2', color: 'white', border: 'none', borderRadius: '5px' }}
                >
                    Post to Twitter
                </button>
            </div>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                {view === 'tweetDetails' && tweetDetails && (
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ marginBottom: '20px' }}>Tweet Details</h2>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ color: '#666' }}>Retweets</p>
                                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{tweetDetails.retweets}</p>
                            </div>
                            <div>
                                <p style={{ color: '#666' }}>Likes</p>
                                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{tweetDetails.likes}</p>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'searchResults' && searchResults.length > 0 && (
                    <div>
                        <h2 style={{ marginBottom: '20px' }}>Search Results</h2>
                        {searchResults.map(result => (
                            <div key={result.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                    <img src={result.user.profile_image_url_https} alt="Profile" style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }} />
                                    <div>
                                        <p style={{ fontWeight: 'bold' }}>{result.user.name}</p>
                                        <p style={{ color: '#666' }}>@{result.user.screen_name}</p>
                                    </div>
                                </div>
                                <p style={{ marginBottom: '10px' }}>{result.text}</p>
                                {result.media && result.media.length > 0 && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        {result.media.map((media, index) => (
                                            <img key={index} src={media} alt="Tweet media" style={{ width: '100%', borderRadius: '10px' }} />
                                        ))}
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#666' }}>
                                    <span>Retweets: {result.retweet_count}</span>
                                    <span>Likes: {result.favorite_count}</span>
                                    <button
                                        onClick={() => analyzeSentiment(result.text, result.id)}
                                        disabled={analyzingSentiment[result.id]}
                                        style={{
                                            padding: '5px 10px',
                                            backgroundColor: '#1da1f2',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '5px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {analyzingSentiment[result.id] ? 'Analyzing...' : 'Analyze Sentiment'}
                                    </button>   
                                </div>
                                {renderSentiment(result.sentiment)}
                            </div>
                        ))}
                    </div>
                )}

{view === 'trends' && trends.length > 0 && (
                    <div>
                        <h2 style={{ marginBottom: '20px' }}>Trending Topics</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {trends.map((trend, index) => (
                                <div
                                    key={trend.name}
                                    style={{ 
                                        padding: '10px', 
                                        backgroundColor: 'white', 
                                        border: '1px solid #1da1f2', 
                                        borderRadius: '5px', 
                                        textAlign: 'left',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        minHeight: '100px'
                                    }}
                                >
                                    <div onClick={() => setSelectedTrend(trend.name)} style={{ cursor: 'pointer' }}>
                                        {trend.name}
                                    </div>
                                    {renderSentiment(trend.sentiment)}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fetchSentimentForTrend(trend.name, index);
                                        }}
                                        disabled={trend.loadingSentiment}
                                        style={{ 
                                            padding: '5px 10px', 
                                            backgroundColor: '#1da1f2', 
                                            color: 'white', 
                                            border: 'none', 
                                            borderRadius: '5px', 
                                            cursor: 'pointer',
                                            marginTop: '10px',
                                            alignSelf: 'flex-end'
                                        }}
                                    >
                                        {trend.loadingSentiment ? 'Loading...' : 'Sentiment by AI'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {dialogOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', width: '80%', maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '20px' }}>Post to Twitter</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                            {images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image.url}
                                    alt={`Preview ${index}`}
                                    style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '5px', cursor: 'pointer', border: selectedImage === image.url ? '2px solid #1da1f2' : 'none' }}
                                    onClick={() => handleImageSelection(image.url)}
                                />
                            ))}
                        </div>
                        <select
                            onChange={(e) => setSelectedTrend(e.target.value)}
                            value={selectedTrend}
                            style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
                        >
                            <option value="" disabled>Select a trend</option>
                            {trends.map((trend) => (
                                <option key={trend.name} value={trend.name}>
                                    {trend.name}
                                </option>
                            ))}
                        </select>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={handlePostToTwitter} style={{ padding: '10px 20px', backgroundColor: '#1da1f2', color: 'white', border: 'none', borderRadius: '5px', marginRight: '10px' }}>Post</button>
                            <button onClick={() => setDialogOpen(false)} style={{ padding: '10px 20px', backgroundColor: '#f0f2f5', border: 'none', borderRadius: '5px' }}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TweetList;