import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axiosInstance.get('/api/tickets/');
      setTickets(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch tickets. Please try again.');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return '#FFA500'; // Orange
      case 'IN_PROGRESS':
        return '#1E90FF'; // DodgerBlue
      case 'RESOLVED':
        return '#32CD32'; // LimeGreen
      case 'CLOSED':
        return '#808080'; // Gray
      default:
        return '#000000'; // Black
    }
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    },
    heading: {
      color: '#333',
      marginBottom: '20px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      backgroundColor: '#f2f2f2',
      border: '1px solid #ddd',
      padding: '12px',
      textAlign: 'left',
    },
    td: {
      border: '1px solid #ddd',
      padding: '12px',
    },
    button: {
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    error: {
      color: '#ff0000',
      marginBottom: '15px',
    },
    loading: {
      textAlign: 'center',
      marginTop: '20px',
      fontSize: '18px',
    },
    statusIndicator: {
      display: 'inline-block',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      marginRight: '8px',
    },
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Ticket List</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Title</th>
            <th style={styles.th}>Priority</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Assigned To</th>
            <th style={styles.th}>Created By</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td style={styles.td}>{ticket.title}</td>
              <td style={styles.td}>{ticket.priority}</td>
              <td style={styles.td}>
                <span
                  style={{
                    ...styles.statusIndicator,
                    backgroundColor: getStatusColor(ticket.status),
                  }}
                ></span>
                {ticket.status}
              </td>
              <td style={styles.td}>
                {ticket.assigned_to 
                  ? `${ticket.assigned_to.first_name} ${ticket.assigned_to.last_name}`.trim()
                  : 'Unassigned'}
              </td>
              <td style={styles.td}>
                {ticket.created_by 
                  ? `${ticket.created_by.first_name} ${ticket.created_by.last_name}`.trim()
                  : 'Unknown'}
              </td>
              <td style={styles.td}>
              <button 
  onClick={() => navigate(`/tickets/${ticket.id}`)} 
  style={{
    backgroundColor: '#FFE600',
    color: 'black',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center'
  }}
  onMouseOver={(e) => e.target.style.backgroundColor = '#E6CF00'}
  onMouseOut={(e) => e.target.style.backgroundColor = '#FFE600'}
>
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
  View Details
</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketList;