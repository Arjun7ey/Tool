// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    userId: '',
    userRole: 'User',
    username: '',
    fullName: '',  // Add fullName to the state
    departments: [],
    profilePicture: ''  // Add profilePicture to the state
  });
  const [isLoading, setLoading] = useState(true);

  // Function to fetch current user data from backend
  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get('/api/user-data/');
      if (response.data) {
        const { userId, userRole, username, fullName, departments, profilePicture } = response.data; // Fetch profilePicture along with other fields
        console.log('Fetched user data:', response.data);
        setUserData({ userId, userRole, username, fullName, departments, profilePicture });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false); // Set loading to false regardless of success or error
    }
  };

  // Fetch user data on component mount (once)
  useEffect(() => {
    fetchUserData();
  }, []); // Only fetch once on mount

  return (
    <AuthContext.Provider value={{ userData, isLoading, fetchUserData }}>
      {isLoading ? (
        <div>Loading...</div> // Render a loading indicator while fetching data
      ) : (
        children // Render children only after user data is fetched
      )}
    </AuthContext.Provider>
  );
};

// Custom hook to consume AuthContext
export const useAuth = () => useContext(AuthContext);
