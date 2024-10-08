import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  FiAlertCircle, 
  FiCheckCircle, 
  FiClock, 
  FiFileText, 
  FiMessageSquare, 
  FiPaperclip, 
  FiUser,
  FiArrowLeft
} from 'react-icons/fi';

const TicketDetail = () => {
  const [ticket, setTicket] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateText, setUpdateText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTicketAndUpdates();
  }, [id]);

  const fetchTicketAndUpdates = async () => {
    try {
      const [ticketResponse, updatesResponse] = await Promise.all([
        axiosInstance.get(`/api/tickets/${id}/`),
        axiosInstance.get('/api/ticket-updates/')
      ]);
      setTicket(ticketResponse.data);
      setUpdates(updatesResponse.data.filter(update => update.ticket === parseInt(id)));
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch ticket details. Please try again.');
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axiosInstance.patch(`/api/tickets/${id}/`, { status: newStatus });
      setTicket(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      setError('Failed to update ticket status. Please try again.');
    }
  };

  const handleUpdateTextChange = (e) => {
    setUpdateText(e.target.value);
  };

  const handleAttachmentChange = (e) => {
    setAttachment(e.target.files[0]);
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!updateText.trim() && !attachment) return;

    try {
      const formData = new FormData();
      formData.append('content', updateText);
      formData.append('ticket', id);
      if (attachment) {
        formData.append('attachment', attachment);
      }
      const response = await axiosInstance.post('/api/ticket-updates/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUpdates(prev => [response.data, ...prev]);
      setUpdateText('');
      setAttachment(null);
    } catch (err) {
      setError('Failed to add update. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-yellow-500';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'RESOLVED': return 'bg-green-500';
      case 'CLOSED': return 'bg-gray-500';
      default: return 'bg-gray-300';
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!ticket) return <div className="text-red-500 text-center">Ticket not found.</div>;

  return (
    <div className="container mx-auto p-4">
    <div className="mb-6">
      <div className="flex justify-start mb-4">
        <button 
          onClick={() => navigate('/ticketlist')} 
          className="flex items-center text-gray-600 hover:text-gray-900 transition duration-300"
        >
          <FiArrowLeft className="mr-2" />
          Back to Ticket List
        </button>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Ticket #{ticket.id}</h2>
        <p className="text-lg text-gray-600">{ticket.title}</p>
      </div>
    </div>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ticket Details */}
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Details</h3>
                <p className="text-gray-700">{ticket.description}</p>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold">Status</h4>
                <div className="flex space-x-2 mt-2">
                  {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`px-3 py-1 rounded-full text-white ${
                        ticket.status === status ? getStatusColor(status) : 'bg-gray-300'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold">Priority</h4>
                <p className="mt-1">{ticket.priority}</p>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold">Assigned To</h4>
                <p className="mt-1">{ticket.assigned_to ? ticket.assigned_to.full_name : 'Unassigned'}</p>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold">Created By</h4>
                <p className="mt-1">{ticket.created_by.full_name}</p>
              </div>
              <div>
                <h4 className="font-semibold">Created At</h4>
                <p className="mt-1">{formatDate(ticket.created_at)}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex flex-col h-full">
              <h3 className="text-lg font-semibold mb-4">Timeline</h3>
              <div className="flex-grow overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                <div className="space-y-4">
                  {/* Timeline Items */}
                  <div className="border-l-2 border-gray-200 pl-4 space-y-6">
                    {[
                      { 
                        ...ticket, 
                        type: 'creation', 
                        content: ticket.description,
                        user: ticket.created_by.full_name
                      },
                      ...updates.map(update => ({
                        ...update,
                        type: 'update',
                        user: update.user.full_name
                      }))
                    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((event, index) => (
                      <div key={index} className="relative">
                        <div className="absolute -left-6 mt-1 w-4 h-4 rounded-full bg-blue-500"></div>
                        <div className="mb-2 flex items-center text-sm text-gray-600">
                          <FiClock className="mr-2" />
                          {formatDate(event.created_at)}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="flex items-center mb-2">
                            {event.type === 'creation' ? (
                              <FiFileText className="text-green-500 mr-2" />
                            ) : (
                              <FiMessageSquare className="text-blue-500 mr-2" />
                            )}
                            <span className="font-semibold">
                              {event.type === 'creation' ? 'Ticket Created' : 'Update'}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{event.content}</p>
                          <div className="flex items-center text-sm text-gray-600">
                            <FiUser className="mr-2" />
                            {event.user}
                          </div>
                          {event.attachment && (
                            <div className="mt-2">
                              <a 
                                href={event.attachment} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-500 hover:underline"
                              >
                                <FiPaperclip className="mr-2" />
                                View Attachment
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Add Update Form */}
              <form onSubmit={handleSubmitUpdate} className="mt-6">
                <textarea
                  value={updateText}
                  onChange={handleUpdateTextChange}
                  placeholder="Add an update..."
                  className="w-full p-2 border rounded-md"
                  rows="3"
                />
                <div className="mt-2 flex justify-between items-center">
                  <input
                    type="file"
                    onChange={handleAttachmentChange}
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                <button 
  type="submit" 
  style={{
    backgroundColor: '#FFE600',
    color: 'black',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  }}
  onMouseOver={(e) => e.target.style.backgroundColor = '#E6CF00'}
  onMouseOut={(e) => e.target.style.backgroundColor = '#FFE600'}
>
  Add Update
</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;