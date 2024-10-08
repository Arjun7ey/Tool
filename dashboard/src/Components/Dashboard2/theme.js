import { createTheme } from '@mui/material/styles';

// Light Theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#fff',
    },
    text: {
      primary: '#000',
      secondary: '#333',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

// Dark Theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#fff',
      secondary: '#cbd5e1',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});
