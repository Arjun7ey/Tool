import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, Button, TextField, List, ListItem, ListItemText } from '@mui/material';
import axiosInstance from '../utils/axiosInstance'; // Assuming you have a configured axios instance
import emp from '../../assets/images/emp.gif';
import { useAuth } from '../utils/AuthContext'; // Import the AuthContext

const Home = () => {
  const { userData, isLoading } = useAuth(); // Access userData and loading state from context
  const [isRotating, setIsRotating] = useState(true);
  const [counts, setCounts] = useState({
    employees: 0,
    clients: 0,
    projects: 0,
    events: 0,
    payroll: 0,
    reports: 0,
  });
  const [showMessenger, setShowMessenger] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const targets = {
    employees: 96,
    clients: 365,
    projects: 356,
    events: 696,
    payroll: 960,
    reports: 59,
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setIsRotating((prev) => !prev);
    }, 50000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const increments = {
      employees: Math.ceil(targets.employees / 100),
      clients: Math.ceil(targets.clients / 100),
      projects: Math.ceil(targets.projects / 100),
      events: Math.ceil(targets.events / 100),
      payroll: Math.ceil(targets.payroll / 100),
      reports: Math.ceil(targets.reports / 100),
    };

    const interval = setInterval(() => {
      setCounts((prevCounts) => {
        const newCounts = { ...prevCounts };
        Object.keys(newCounts).forEach((key) => {
          if (newCounts[key] < targets[key]) {
            newCounts[key] += increments[key];
            if (newCounts[key] > targets[key]) {
              newCounts[key] = targets[key];
            }
          }
        });
        return newCounts;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/api/all-users/');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      const fetchMessages = async () => {
        try {
          const response = await axiosInstance.get(`/api/messages/${selectedUserId}/`);
          setMessages(response.data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();
    }
  }, [selectedUserId]);

  const sendMessage = async () => {
    if (newMessage && selectedUserId) {
      try {
        await axiosInstance.post('/api/send-message/', {
          sender_id: userData.userId, // Use the current user's ID from AuthContext
          recipient_id: selectedUserId,
          message: newMessage,
        });
        setNewMessage('');
        // Optionally refresh messages after sending
        const response = await axiosInstance.get(`/api/messages/${selectedUserId}/`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Render loading indicator if data is being fetched
  }

  return (
    <Container maxWidth="lg" style={{ paddingTop: '20px' }}>
      <Grid container spacing={3}>
        {/* Header Items */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <Paper className="header-item" style={{ backgroundImage: `url(${emp})`, backgroundSize: 'cover', color: '#5d87ff', padding: '16px' }}>
            <Typography variant="h6">Employees</Typography>
            <Typography variant="h5" style={{ color: '#5d87ff' }} className="value">{counts.employees}</Typography>
          </Paper>
        </Grid>
        {/* Other header items here */}
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={() => setShowMessenger(!showMessenger)}>
            {showMessenger ? 'Close Messenger' : 'Open Messenger'}
          </Button>
        </Grid>
      </Grid>

      {/* Conditionally render Messenger */}
      {showMessenger && (
        <Grid container spacing={3} style={{ marginTop: '20px' }}>
          <Grid item xs={12} sm={4}>
            <List>
              {users.map((user) => (
                <ListItem button key={user.id} onClick={() => setSelectedUserId(user.id)}>
                  <ListItemText primary={user.username} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={12} sm={8}>
            {selectedUserId && (
              <div>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {messages.map((msg, index) => (
                    <div key={index}>
                      <strong>{msg.sender}: </strong>{msg.content}
                    </div>
                  ))}
                </div>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <Button onClick={sendMessage} variant="contained" color="primary" style={{ marginTop: '10px' }}>
                  Send
                </Button>
              </div>
            )}
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Home;
