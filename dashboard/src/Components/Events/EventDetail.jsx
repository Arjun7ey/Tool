import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosInstance, { setupResponseInterceptor } from '../utils/axiosInstance';
import { Image as ImageIcon, Calendar, X, Loader, MapPin, Clock, Video } from 'lucide-react';
import { BASE_URL } from '../../config';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const EventDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [media, setMedia] = useState({ images: [], videos: [] });
  const [twitterMedia, setTwitterMedia] = useState({ images: [], videos: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageAnalysis, setImageAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    setupResponseInterceptor(navigate);
  }, [navigate]);

  const fetchEventMediaAndTweets = useCallback(async () => {
    if (!location.state || !location.state.eventData) {
      setError('No event data provided. Please select an event from the list.');
      setLoading(false);
      return;
    }

    setEvent(location.state.eventData);

    try {
      setLoading(true);
      
      // Fetch event media
      const mediaResponse = await axiosInstance.get('api/event-media/', {
        params: { category_name: location.state.eventData.title }
      });
      setMedia(mediaResponse.data);

      // Fetch Twitter media
      const eventTitle = location.state.eventData.title.replace('Event - ', '').trim();
      const twitterResponse = await axiosInstance.get('api/twitter-media/', {
        params: { query: eventTitle }
      });
      setTwitterMedia(twitterResponse.data);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load event data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [location.state]);

  useEffect(() => {
    fetchEventMediaAndTweets();
  }, [fetchEventMediaAndTweets]);

  const getFullUrl = useCallback((path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  }, []);

  const handleImageClick = async (image) => {
    setSelectedImage(image);
    setAnalysisLoading(true);
    setImageAnalysis(null);

    try {
      const imageUrl = image.url || getFullUrl(image.file);
      const response = await axiosInstance.post('/api/analyze-image/', 
        { image_url: imageUrl },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setImageAnalysis(response.data);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setImageAnalysis({ error: 'Failed to analyze image. Please try again.' });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
    setImageAnalysis(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <Loader className="w-12 h-12 animate-spin text-indigo-600" />
        <span className="ml-4 text-2xl font-semibold text-indigo-700">Loading event details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-center text-red-500 mb-6">
          <h2 className="text-2xl font-bold">Error</h2>
        </div>
        <p className="text-center text-gray-700 text-lg mb-8">{error}</p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/events')}
            className="px-6 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            Back to Events List
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return <div className="text-center p-8 text-2xl font-semibold text-gray-700">No event data available</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-2xl">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-extrabold mb-6 tracking-tight"
        style={{ color: '#DAA520' }}
      >
        {event.title}
      </motion.h1>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-wrap items-center mb-10 text-gray-600 space-y-4 md:space-y-0 md:space-x-8"
      >
        <div className="flex items-center">
          <Calendar className="w-6 h-6 mr-3 text-indigo-500" />
          <span className="text-lg">
            {format(new Date(event.start_time), 'MMMM d, yyyy')} - 
            {format(new Date(event.end_time), 'MMMM d, yyyy')}
          </span>
        </div>
        <div className="flex items-center">
          <Clock className="w-6 h-6 mr-3 text-indigo-500" />
          <span className="text-lg">
            {format(new Date(event.start_time), 'h:mm a')} - 
            {format(new Date(event.end_time), 'h:mm a')}
          </span>
        </div>
        <div className="flex items-center">
          <MapPin className="w-6 h-6 mr-3 text-indigo-500" />
          <span className="text-lg">{event.location || 'Bhopal'}</span>
        </div>
      </motion.div>
      
      <motion.h2 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-3xl font-bold mb-10 flex items-center"
        style={{ color: '#DAA520' }}
      >
        <ImageIcon 
          className="w-8 h-8 mr-4"
          style={{ color: '#B8860B' }}
        />
        Event Media with AI Insights
      </motion.h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Event Media Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white p-8 rounded-2xl shadow-lg"
        >
          <h3 className="text-2xl font-semibold mb-6 text-indigo-600">Event Media</h3>
          <div className="grid grid-cols-2 gap-6 mb-8">
            {media.images.map((image, index) => (
              <motion.div 
                key={`image-${index}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative cursor-pointer overflow-hidden rounded-lg shadow-md" 
                onClick={() => handleImageClick(image)}
              >
                <img
                  src={getFullUrl(image.file)}
                  alt={image.title}
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white p-3">
                  <p className="text-sm font-medium truncate">{image.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {media.videos.map((video, index) => (
              <div key={`video-${index}`} className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-md">
                <video
                  src={getFullUrl(video.file)}
                  controls
                  className="w-full h-full object-cover"
                >
                  Your browser does not support the video tag.
                </video>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">{video.title}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Twitter Media Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white p-8 rounded-2xl shadow-lg"
        >
          <h3 className="text-2xl font-semibold mb-6 text-indigo-600">Twitter Media</h3>
          <div className="grid grid-cols-2 gap-6 mb-8">
            {twitterMedia.images.map((image, index) => (
              <motion.div 
                key={`twitter-image-${index}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative cursor-pointer overflow-hidden rounded-lg shadow-md"
                onClick={() => handleImageClick(image)}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white p-3">
                  <p className="text-sm font-medium truncate">{image.user}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {twitterMedia.videos.map((video, index) => (
              <div key={`twitter-video-${index}`} className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-md">
                <video
                  src={video.url}
                  poster={video.thumbnail}
                  controls
                  className="w-full h-full object-cover"
                >
                  Your browser does not support the video tag.
                </video>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">{video.user}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {media.images.length === 0 && media.videos.length === 0 && twitterMedia.images.length === 0 && twitterMedia.videos.length === 0 && (
        <p className="text-gray-500 text-center mt-12 text-lg">No media available for this event.</p>
      )}

      {/* Image Analysis Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-4 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden relative"
            >
              <button 
                onClick={closeModal} 
                className="absolute top-2 right-2 p-1 bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300 transition-colors duration-300"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col md:flex-row h-full overflow-hidden">
                <div className="md:w-1/2 p-2 overflow-auto">
                  <img
                    src={selectedImage.url || getFullUrl(selectedImage.file)}
                    alt={selectedImage.title || selectedImage.alt}
                    className="w-full h-auto object-contain rounded-lg shadow-lg"
                  />
                </div>
                <div className="md:w-1/2 p-2 overflow-auto">
                  {analysisLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader className="w-6 h-6 animate-spin text-indigo-600 mr-2" />
                      <p className="text-lg text-gray-700 font-semibold">Analyzing image...</p>
                    </div>
                  ) : imageAnalysis?.error ? (
                    <div className="text-red-500 font-semibold">{imageAnalysis.error}</div>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="font-bold text-xl text-indigo-700">AI Analysis Results:</h4>
                      
                      {/* Object Detection */}
                      {imageAnalysis?.results && (
                        <div className="bg-gray-50 p-3 rounded-lg shadow">
                          <h5 className="font-semibold text-lg text-indigo-600 mb-2">Object Detection:</h5>
                          <ul className="space-y-1 text-sm text-gray-700">
                            {imageAnalysis.results.map((result, index) => (
                              <li key={index} className="flex justify-between items-center">
                                <span className="font-medium">{result.label}:</span>
                                <span className="bg-indigo-100 text-indigo-800 py-0.5 px-2 rounded-full text-xs">
                                  {(result.probability * 100).toFixed(2)}%
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Attributes */}
                      <div className="bg-gray-50 p-3 rounded-lg shadow">
                        <h5 className="font-semibold text-lg text-indigo-600 mb-2">Attributes:</h5>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li className="flex justify-between items-center">
                            <span className="font-medium">Dimensions:</span>
                            <span className="bg-purple-100 text-purple-800 py-0.5 px-2 rounded-full text-xs">
                              {imageAnalysis?.image_width}x{imageAnalysis?.image_height}px
                            </span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span className="font-medium">Sharpness:</span>
                            <span className="bg-purple-100 text-purple-800 py-0.5 px-2 rounded-full text-xs">
                              {imageAnalysis?.sharpness?.toFixed(2) ?? 'N/A'}
                            </span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span className="font-medium">Quality:</span>
                            <span className="bg-purple-100 text-purple-800 py-0.5 px-2 rounded-full text-xs">
                              {imageAnalysis?.quality ?? 'N/A'}
                            </span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span className="font-medium">Processing Time:</span>
                            <span className="bg-purple-100 text-purple-800 py-0.5 px-2 rounded-full text-xs">
                              {imageAnalysis?.processing_time?.toFixed(2)}s
                            </span>
                          </li>
                        </ul>
                      </div>

                      {/* AI Caption */}
                      {imageAnalysis?.caption && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg shadow">
                          <h5 className="font-semibold text-lg text-yellow-800 mb-2">AI Caption:</h5>
                          <p className="text-yellow-900 text-sm italic">"{imageAnalysis.caption}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventDetail;