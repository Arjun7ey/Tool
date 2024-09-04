import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
//import App from './App';
import reportWebVitals from './reportWebVitals';
import HomePage from './components/Homepage.js';

// const user = {
//   is_authenticated: true,
//   username: 'admin', // this should be dynamic based on your authentication logic
// };

const container = ReactDOM.createRoot(document.getElementById('react-root'));
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
      <HomePage/>
  </React.StrictMode>
);
//ReactDOM.render(<HomePage />, document.getElementById('react-root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
