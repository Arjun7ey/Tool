import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const CreateTicket = () => {
  const [ticket, setTicket] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    source: 'INTERNAL',
    due_date: '',
    assigned_to: '',
    is_social_media_ticket: false,
    social_media_platform: '',
    social_media_post_id: '',
    social_media_post_url: '',
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/api/users/');
        setUsers(response.data);
      } catch (err) {
        setError('Failed to fetch users. Please try again.');
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTicket(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setAttachments([...attachments, ...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Append ticket data
    Object.keys(ticket).forEach(key => {
      formData.append(key, ticket[key]);
    });

    // Append status
    formData.append('status', 'OPEN');

    // Append attachments
    attachments.forEach((file, index) => {
      formData.append(`attachment_${index}`, file);
    });

    try {
      const response = await axiosInstance.post('/api/tickets/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/ticketlist');
    } catch (err) {
      setError('Failed to create ticket. Please try again.');
    }
  };

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    heading: {
      color: '#333',
      marginBottom: '20px',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      color: '#555',
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
    },
    textarea: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
      height: '100px',
      resize: 'vertical',
    },
    select: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
    },
    button: {
      backgroundColor: '#4CAF50',
      color: 'white',
      padding: '10px 15px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.3s',
    },
    error: {
      color: '#ff0000',
      marginBottom: '15px',
    },
    checkbox: {
      marginRight: '10px',
    },
    fileList: {
      listStyle: 'none',
      padding: 0,
      marginTop: '10px',
    },
    fileItem: {
      backgroundColor: '#e0e0e0',
      padding: '5px 10px',
      borderRadius: '4px',
      marginBottom: '5px',
      display: 'inline-block',
      marginRight: '5px',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create New Ticket</h2>
      {error && <div style={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="title" style={styles.label}>Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={ticket.title}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="description" style={styles.label}>Description:</label>
          <textarea
            id="description"
            name="description"
            value={ticket.description}
            onChange={handleChange}
            required
            style={styles.textarea}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="priority" style={styles.label}>Priority:</label>
          <select
            id="priority"
            name="priority"
            value={ticket.priority}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="source" style={styles.label}>Source:</label>
          <select
            id="source"
            name="source"
            value={ticket.source}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="INTERNAL">Internal</option>
            <option value="EMAIL">Email</option>
            <option value="SOCIAL">Social Media</option>
            <option value="PHONE">Phone</option>
          </select>
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="due_date" style={styles.label}>Due Date:</label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            value={ticket.due_date}
            onChange={handleChange}
            style={styles.input}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="assigned_to" style={styles.label}>Assign To:</label>
          <select
            id="assigned_to"
            name="assigned_to"
            value={ticket.assigned_to}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name} ({user.role})
              </option>
            ))}
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            <input
              type="checkbox"
              name="is_social_media_ticket"
              checked={ticket.is_social_media_ticket}
              onChange={handleChange}
              style={styles.checkbox}
            />
            Is Social Media Ticket
          </label>
        </div>
        {ticket.is_social_media_ticket && (
          <>
            <div style={styles.formGroup}>
              <label htmlFor="social_media_platform" style={styles.label}>Social Media Platform:</label>
              <input
                type="text"
                id="social_media_platform"
                name="social_media_platform"
                value={ticket.social_media_platform}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="social_media_post_id" style={styles.label}>Social Media Post ID:</label>
              <input
                type="text"
                id="social_media_post_id"
                name="social_media_post_id"
                value={ticket.social_media_post_id}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="social_media_post_url" style={styles.label}>Social Media Post URL:</label>
              <input
                type="url"
                id="social_media_post_url"
                name="social_media_post_url"
                value={ticket.social_media_post_url}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </>
        )}
        <div style={styles.formGroup}>
          <label htmlFor="attachments" style={styles.label}>Attachments:</label>
          <input
            type="file"
            id="attachments"
            name="attachments"
            onChange={handleFileChange}
            multiple
            style={styles.input}
          />
          {attachments.length > 0 && (
            <ul style={styles.fileList}>
              {attachments.map((file, index) => (
                <li key={index} style={styles.fileItem}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>
        <button 
  type="submit" 
  style={{
    backgroundColor: '#FFE600',
    color: 'black',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '20px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  }}
  onMouseOver={(e) => e.target.style.backgroundColor = '#E6CF00'}
  onMouseOut={(e) => e.target.style.backgroundColor = '#FFE600'}
>
  Create Ticket
</button>
      </form>
    </div>
  );
};

export default CreateTicket;