// ChatWindow.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Box, TextField, Button, Typography, List, ListItem, ListItemText, CircularProgress } from '@mui/material';

const ChatWindow = ({ selectedUserId }) => {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUserId) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/messages/${selectedUserId}/`);
        console.log('Fetched messages:', response.data); // Log fetched messages
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to fetch messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUserId]);

  const handleSendMessage = async () => {
    if (!messageContent) return;
    try {
      await axiosInstance.post('/api/send_message/', {
        recipient_id: selectedUserId,
        message: messageContent,
      });
      setMessageContent('');
      // Fetch new messages after sending
      const response = await axiosInstance.get(`/api/messages/${selectedUserId}/`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <div>{error}</div>;

  return (
    <Box>
      <Typography variant="h6">Chat</Typography>
      {selectedUserId ? (
        <>
          <List>
            {messages.map((msg, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={msg.sender_username}
                  secondary={msg.content}
                />
              </ListItem>
            ))}
          </List>
          <Box display="flex" mt={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type a message..."
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
              sx={{ ml: 2 }}
            >
              Send
            </Button>
          </Box>
        </>
      ) : (
        <Typography>Select a user to start chatting</Typography>
      )}
    </Box>
  );
};

export default ChatWindow;
