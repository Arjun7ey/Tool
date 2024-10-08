// src/App.jsx
import React, { useEffect } from "react";
import './polyfills';
import Login from "./Pages/Login";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from "./Pages/Dashboard";
import Event from "./Pages/Events";
import HomeWorld from "./Components/X-factor/HomeWorld";
import TweetWorld from "./Components/X-factor/TweetWorld";
import TweetComposer from "./Pages/TweetComposer";
import Analytics from "./Pages/Analytics";
import UserAnalysis from "./Components/X-factor/UserAnalysis";
import Content from "./Pages/Contents";
import Users from "./Pages/Users";
import Modules from "./Pages/Modules";
import MoMs from "./Pages/MoMs";
import MoMList from "./Pages/MoMList";
import EventDetails from "./Pages/EventDetails";
import UserDetail from "./Pages/UserDetail";
import Images from './Pages/Images';
import Links from './Pages/Links';
import Messenger from './Pages/Messenger';
import Survey from './Pages/Survey';
import SurveyList from './Pages/SurveyList';
import FillSurvey from "./Pages/FillSurvey";
import TicketCreation from './Pages/TicketCreation';
import TicketList from './Pages/TicketList';
import TicketDetail from "./Pages/TicketDetails";
import Videos from './Pages/Videos';
import Sentiment from './Pages/SentimentAnalysis';
import Documents from './Pages/Documents';
import Posts from "./Pages/Posts";
import { AuthProvider } from './Components/utils/AuthContext';
import { ThemeProvider as CustomThemeProvider } from './Contexts/ThemeContext';
import axiosInstance from './Components/utils/axiosInstance';
import PrivateRoute from './Components/utils/PrivateRoute'; 

const App = () => {
  // Function to get the CSRF token from the cookies
  const getCsrfTokenFromCookies = () => {
    const csrfCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='));

    return csrfCookie ? csrfCookie.split('=')[1] : null;
  };

  // Fetch the CSRF token when the app loads
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        // Fetch CSRF token from the backend API
        await axiosInstance.get('/api/csrf_cookie/'); 

        // Get the CSRF token from the cookies and store it in localStorage
        const csrfToken = getCsrfTokenFromCookies();
        if (csrfToken) {
          localStorage.setItem('csrf_token', csrfToken);
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    };

    // Call the fetch CSRF token function
    fetchCsrfToken();
  }, []); // Empty dependency array ensures this runs only once

  return (
    <CustomThemeProvider> {/* Wrap with custom ThemeProvider */}
      <Router>
        <AuthProvider> {/* AuthProvider */}
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/events" element={
              <PrivateRoute>
                <Event />
              </PrivateRoute>
            } />
            <Route path="/contents" element={
              <PrivateRoute>
                <Content />
              </PrivateRoute>
            } />
            <Route path="/users" element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            } />
            <Route path="/usersdetails/:id" element={
              <PrivateRoute>
                <UserDetail />
              </PrivateRoute>
            } />
            <Route path="/images" element={
              <PrivateRoute>
                <Images />
              </PrivateRoute>
            } />
            <Route path="/videos" element={
              <PrivateRoute>
                <Videos />
              </PrivateRoute>
            } />
            <Route path="/documents" element={
              <PrivateRoute>
                <Documents />
              </PrivateRoute>
            } />
            <Route path="/posts" element={
              <PrivateRoute>
                <Posts />
              </PrivateRoute>
            } />
            <Route path="/links" element={
              <PrivateRoute>
                <Links />
              </PrivateRoute>
            } />
            <Route path="/moms" element={
              <PrivateRoute>
                <MoMs />
              </PrivateRoute>
            } />
              <Route path="/survey" element={
              <PrivateRoute>
                <Survey />
              </PrivateRoute>
            } />
             <Route path="/surveylist" element={
              <PrivateRoute>
                <SurveyList />
              </PrivateRoute>
            } />
               <Route path="/fill-survey/:id" element={
              <PrivateRoute>
                <FillSurvey />
              </PrivateRoute>
            } />
                 <Route path="/ticketassign" element={
              <PrivateRoute>
                <TicketCreation />
              </PrivateRoute>
            } />
                    <Route path="/ticketlist" element={
              <PrivateRoute>
                <TicketList />
              </PrivateRoute>
            } />
              <Route path="/tickets/:id" element={
              <PrivateRoute>
                <TicketDetail />
              </PrivateRoute>
            } />
            <Route path="/sentiments" element={
              <PrivateRoute>
                <Sentiment />
              </PrivateRoute>
            } />
            <Route path="/momslist" element={
              <PrivateRoute>
                <MoMList />
              </PrivateRoute>
            } />
            <Route path="/messenger" element={
              <PrivateRoute>
                <Messenger />
              </PrivateRoute>
            } />
            <Route path="/modules" element={
              <PrivateRoute>
                <Modules />
              </PrivateRoute>
            } />
            <Route path="/event/:id" element={
              <PrivateRoute>
                <EventDetails />
              </PrivateRoute>
            } />
            <Route path="/homeworld" element={
              <PrivateRoute>
                <HomeWorld />
              </PrivateRoute>
            } />
               <Route path="/analytics" element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            } />
            
            <Route path="/compose-tweet" element={
              <PrivateRoute>
                <TweetComposer />
              </PrivateRoute>
            } />
            <Route path="/user-analysis" element={
              <PrivateRoute>
                <UserAnalysis />
              </PrivateRoute>
            } />
          </Routes>
        </AuthProvider>
      </Router>
    </CustomThemeProvider>
  );
}

export default App;
