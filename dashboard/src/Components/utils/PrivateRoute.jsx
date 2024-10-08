// src/Components/utils/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; 

const PrivateRoute = ({ children }) => {
  const { userData } = useAuth();

  // Check if user is authenticated
  if (!userData.email) {
    // Redirect them to the login page if not authenticated
    return <Navigate to="/" />;
  }

  // Render the children if authenticated
  return children;
};

export default PrivateRoute;
