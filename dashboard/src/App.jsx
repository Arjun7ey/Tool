// src/App.jsx
import React from "react";
import './polyfills';
import Login from "./Pages/Login";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from "./Pages/Dashboard";
import Event from "./Pages/Events";
import Content from "./Pages/Contents";
import Users from "./Pages/Users";
import MoMs from "./Pages/MoMs";
import MoMList from "./Pages/MoMList";
import UserDetail from "./Pages/UserDetail";
import Images from './Pages/Images';
import Links from './Pages/Links';
import Messenger from './Pages/Messenger';
import Videos from './Pages/Videos';
import Sentiment from './Pages/SentimentAnalysis';
import Documents from './Pages/Documents';
import Posts from "./Pages/Posts";
import Survey from "./Pages/Survey";
import { AuthProvider } from './Components/utils/AuthContext';
import { ThemeProvider as CustomThemeProvider } from './Contexts/ThemeContext'; // Import your custom ThemeProvider

const App = () => {
  return (
    <CustomThemeProvider> {/* Wrap with custom ThemeProvider */}
      <Router>
        <AuthProvider> {/* AuthProvider */}
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/events" element={<Event />} />
            <Route path="/contents" element={<Content />} />
            <Route path="/users" element={<Users />} />
            <Route path="/usersdetails/:id" element={<UserDetail />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/survey" element={<Survey />} />
            <Route path="/links" element={<Links />} />
            <Route path="/moms" element={<MoMs />} />
            <Route path="/sentiments" element={<Sentiment />} />
            <Route path="/momslist" element={<MoMList />} />
            <Route path="/messenger" element={<Messenger />} />
          </Routes>
        </AuthProvider>
      </Router>
    </CustomThemeProvider>
  );
}

export default App;
