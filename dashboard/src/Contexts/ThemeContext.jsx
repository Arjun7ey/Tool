import React, { createContext, useState, useEffect } from 'react';
import eyLight from '../assets/images/logo/EYLight.jpeg';
import eyDark from '../assets/images/logo/EYDark.jpeg';
import eyCustom from '../assets/images/logo/EYDark.jpeg';

// Define theme styles
const themes = {
  light: {
    logo: eyLight,
    sidebar: {
      backgroundColor: '#ffffff',
      color: '#000000',
    },
    menu: {
      menuContent: '#ffffff',
      icon: '#000000',
      hover: {
        backgroundColor: '#FFE600',
        color: '#000000',
      },
      disabled: {
        color: '#9fb6cf',
      },
    },
  },
  custom: {
    logo: eyDark,
    sidebar: {
      backgroundColor: '#0b2948',
      color: '#8ba1b7',
    },
    menu: {
      menuContent: '#082440',
      icon: '#59d0ff',
      hover: {
        backgroundColor: '#00458b',
        color: '#b6c8d9',
      },
      disabled: {
        color: '#3e5e7e',
      },
    },
  },
  dark: {
    logo: eyCustom,
    sidebar: {
      backgroundColor: '#2f2f2f',
      color: '#ffffff',
    },
    menu: {
      menuContent: '#383838',
      icon: '#ffffff',
      hover: {
        backgroundColor: '#FFE600',
        color: '#000000',
        icon: '#000000',
      },
      disabled: {
        color: '#b0bec5',
      },
    },
  },
};

// Create Context
export const ThemeContext = createContext();

// Create Provider
export const ThemeProvider = ({ children }) => {
  const DEFAULT_THEME = 'dark';

  // Initialize theme from localStorage or use default
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('app-theme');
    return storedTheme ? storedTheme : DEFAULT_THEME;
  });

  // Update localStorage whenever theme changes
  useEffect(() => {
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // Function to set specific theme
  const setSpecificTheme = (themeName) => {
    setTheme(themeName);
  };

  // Current theme styles
  const currentTheme = themes[theme] || themes[DEFAULT_THEME];

  return (
    <ThemeContext.Provider value={{ theme, setSpecificTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
