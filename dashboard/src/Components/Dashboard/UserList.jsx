// UserList.jsx
import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { List, ListItem, ListItemText, CircularProgress } from '@mui/material';

const UserList = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/api/all-users/');
        console.log('Fetched users:', response.data); // Log fetched users
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h3>Users</h3>
      <List>
        {users.map((user) => (
          <ListItem button key={user.id} onClick={() => onSelectUser(user.id)}>
            <ListItemText primary={user.username} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default UserList;
