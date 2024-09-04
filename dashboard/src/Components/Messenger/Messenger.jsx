import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../utils/AuthContext';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  Badge,
  IconButton,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import moment from 'moment-timezone';
import DeleteIcon from '@mui/icons-material/Delete';

// Styled components
const ChatContainer = styled(Box)({
  display: 'flex',
  height: '100vh',
  backgroundColor: '#f5f5f5',
});

const Sidebar = styled(Box)({
  width: '300px',
  borderRight: '1px solid #ddd',
  backgroundColor: '#fff',
  overflowY: 'auto',
  padding: '10px',
});

const UserListItem = styled(ListItem)({
  backgroundColor: '#FFFFE0',
  color: '#000000',
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ddd',
  marginBottom: '5px',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
});

const ChatArea = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  height: '80vh',
});

const MessagesContainer = styled(Box)({
  flex: 1,
  padding: '10px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
});

const ChatInput = styled(Box)({
  borderTop: '1px solid #ddd',
  padding: '10px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#fff',
});

const SendButton = styled(Button)({
  marginLeft: '10px',
});

const MessageBox = styled(Box)({
  position: 'relative',
  padding: '10px',
  borderRadius: '5px',
  marginBottom: '10px',
  backgroundColor: '#fff',
  boxShadow: 'none',
});

const POLLING_INTERVAL = 3000; // Poll every 3 seconds

const Messenger = () => {
  const { userData } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});

  const [conversationId, setConversationId] = useState(null);
  const [fetchingConversation, setFetchingConversation] = useState(false);

  // Fetch the list of users (excluding the current user)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/api/all-users/');
        const filteredUsers = response.data.filter(user => user.id !== userData.userId);
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [userData.userId]);

  // Poll for unread message counts
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const response = await axiosInstance.get('/api/unread-counts/');
        setUnreadCounts(response.data);
      } catch (error) {
        console.error('Error fetching unread counts:', error);
      }
    };

    fetchUnreadCounts(); // Initial fetch
    const interval = setInterval(fetchUnreadCounts, POLLING_INTERVAL);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Poll for new messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser && conversationId) {
        
        try {
          console.log('Fetching messages for conversation ID:', conversationId);
          const response = await axiosInstance.get(`/api/messages/${conversationId}/`);
          setMessages(response.data);
          console.log('Messages:', response.data);

          // Mark messages as read
          await axiosInstance.post(`/api/mark-read/${selectedUser}/`);

          // Reset unread counts for the selected user
          setUnreadCounts(prev => ({ ...prev, [selectedUser]: 0 }));
        } catch (error) {
          console.error('Error fetching messages:', error);
        } finally {
          
        }
      }
    };

    fetchMessages(); // Initial fetch
    const interval = setInterval(fetchMessages, POLLING_INTERVAL);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [selectedUser, conversationId]);

  const handleSelectUser = async (userId) => {
    if (selectedUser === userId) return; // Avoid unnecessary API calls if the same user is selected

    console.log('Selecting user:', userId);
    setFetchingConversation(true);

    try {
      // Fetch or create conversation
      const response = await axiosInstance.post('/api/create-or-fetch-conversation/', { user_id: userId });
      const fetchedConversationId = response.data.conversationId;

      console.log('Conversation created or fetched:', fetchedConversationId);
      setConversationId(fetchedConversationId);

      // Clear old messages and select the user
      setMessages([]);
      setSelectedUser(userId);

      console.log('Current conversation ID after user select:', fetchedConversationId);
    } catch (error) {
      console.error('Error selecting user:', error);
    } finally {
      setFetchingConversation(false);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage && selectedUser) {
      try {
        // Send message to the server
        await axiosInstance.post('/api/send-message/', {
          recipient_id: selectedUser,
          message: newMessage,
        });

        // Add the new message to the state
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: Date.now(), // Temporary ID for the new message
            sender__username: userData.username,
            content: newMessage,
            timestamp: new Date().toISOString()
          }
        ]);

        // Clear input field
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!messageId) {
      console.error('Message ID is undefined');
      return;
    }

    try {
      // Delete message from the server
      await axiosInstance.delete(`/api/delete-message/${messageId}/`);

      // Remove the deleted message from the state
      setMessages(prevMessages => prevMessages.filter(message => message.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <ChatContainer>
    <Sidebar>
      <Typography variant="h6" sx={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Users</Typography>
      <List>
        {users.map((user) => (
          <UserListItem
            button
            key={user.id}
            onClick={() => handleSelectUser(user.id)}
          >
           <Badge
      badgeContent={unreadCounts[user.id] || 0}
      sx={{
        '& .MuiBadge-dot': {
          backgroundColor: '#FFD700', // Set badge color here
        },
      }}
    >
      <ListItemText primary={user.full_name} />
    </Badge>
          </UserListItem>
        ))}
      </List>
    </Sidebar>
    <ChatArea>
      {/* Remove fetchingConversation check */}
      <>
        <MessagesContainer>
          {selectedUser ? (
            <>
              <Typography variant="h6" sx={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                Chat with {users.find(user => user.id === selectedUser)?.full_name}
              </Typography>
              <Box>
                {messages.length ? (
                  messages.map((message) => (
                    <MessageBox key={message.id} sx={{ alignSelf: message.sender__username === userData.username ? 'flex-end' : 'flex-start' }}>
                      <Typography variant="body2" color="textSecondary">
                        {message.sender__username}
                      </Typography>
                      <Typography variant="body1">
                        {message.content}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ position: 'absolute', bottom: '5px', right: '10px' }}>
                        {moment(message.timestamp).format('MMM D, YYYY h:mm A')}
                      </Typography>
                      {message.sender__username === userData.username && (
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteMessage(message.id)}
                          sx={{ position: 'absolute', top: '5px', right: '5px' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </MessageBox>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No messages
                  </Typography>
                )}
              </Box>
            </>
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', marginTop: '20px' }}>
              Select a user to start chatting
            </Typography>
          )}
        </MessagesContainer>
        {selectedUser && (
          <ChatInput>
            <TextField
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
            />
            <SendButton
              color="primary"
              variant="contained"
              onClick={handleSendMessage}
            >
              Send
            </SendButton>
          </ChatInput>
        )}
      </>
    </ChatArea>
  </ChatContainer>
  );
};

export default Messenger;
