import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { Button, MenuItem, Select, InputLabel, FormControl, TextField, Checkbox, FormControlLabel } from '@mui/material';

const MoMForm = () => {
  const [title, setTitle] = useState('');
  const [momRecords, setMomRecords] = useState([
    {
      sn_number: '',
      discussion_points: '',
      discussion_lead: '',
      contributors: '',
      tentative_dates: '',
      decision_taken: '',
      action_items: '',
      responsible_person_id: '',
      status: '',
      comments_notes: '',
      priority_level: '',
      impact: '',
      follow_up_required: false,
      isOpen: false,
      showFields: [], // State to track which fields to show
    }
  ]);

  const [users, setUsers] = useState([]);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedField, setSelectedField] = useState('');
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/api/users-MoM/');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const validate = () => {
    const record = momRecords[0];
  
    if (!title.trim()) {
      setSnackbarMessage('Title is required.');
      setSnackbarOpen(true);
      setCurrentFieldIndex(0);
      return false;
    }
  
    if (!record.sn_number.trim()) {
      setSnackbarMessage('Serial Number is required.');
      setSnackbarOpen(true);
      setCurrentFieldIndex(1);
      return false;
    }
  
    if (!record.responsible_person_id) {
      setSnackbarMessage('Responsible Person is required.');
      setSnackbarOpen(true);
      setCurrentFieldIndex(3);
      return false;
    }
  
    return true;
  };

  const handleChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const newMomRecords = [...momRecords];
    newMomRecords[index] = { ...newMomRecords[index], [name]: type === 'checkbox' ? checked : value };
    setMomRecords(newMomRecords);
  };

  const handleSelectChange = (index, e) => {
    const { name, value } = e.target;
    const newMomRecords = [...momRecords];
    newMomRecords[index] = { ...newMomRecords[index], [name]: parseInt(value, 10) || '' }; // Convert to integer
    setMomRecords(newMomRecords);
  };

  const handleAddField = (index) => {
    if (selectedField && !momRecords[index].showFields.includes(selectedField)) {
      const newMomRecords = [...momRecords];
      newMomRecords[index].showFields.push(selectedField);
      setMomRecords(newMomRecords);
      setSelectedField(''); // Clear selected field after adding
    }
  };

  const handleAddRecord = () => {
    setMomRecords([
      ...momRecords,
      {
        sn_number: '',
        discussion_points: '',
        discussion_lead: '',
        contributors: '',
        tentative_dates: '',
        decision_taken: '',
        action_items: '',
        responsible_person_id: '',
        status: '',
        comments_notes: '',
        priority_level: '',
        impact: '',
        follow_up_required: false,
        isOpen: false,
        showFields: [], // Initialize with no fields shown
      }
    ]);
  };

  const handleRemoveRecord = (index) => {
    const newMomRecords = momRecords.filter((_, i) => i !== index);
    setMomRecords(newMomRecords);
  };

  const handleToggleRecord = (index) => {
    const newMomRecords = [...momRecords];
    newMomRecords[index].isOpen = !newMomRecords[index].isOpen;
    setMomRecords(newMomRecords);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      try {
        const momRows = momRecords.map(record => ({
          sn_number: record.sn_number,
          discussion_points: record.discussion_points,
          discussion_lead: record.discussion_lead,
          contributors: record.contributors,
          tentative_dates: record.tentative_dates,
          decision_taken: record.decision_taken,
          action_items: record.action_items,
          responsible_person_id: record.responsible_person_id,
          status: record.status,
          comments_notes: record.comments_notes,
          priority_level: record.priority_level,
          impact: record.impact,
          follow_up_required: record.follow_up_required,
        }));

        const response = await axiosInstance.post('/api/mom-create/', {
          title: title,
          mom_rows_create: momRows,
        });
  
        console.log('MoM records created:', response.data);
        navigate('/momslist');
      } catch (error) {
        if (error.response && error.response.data) {
          const errorMessages = error.response.data;
          if (errorMessages.mom_rows_create) {
            const snNumberErrors = errorMessages.mom_rows_create
            .flatMap(row => row.sn_number || [])
            .map(error => error.replace('mo m row with this sn number already exists.', 'A record with this serial number already exists.'))
            .join(', ');
  
            setSnackbarMessage(snNumberErrors || 'Error creating MoM.');
            setSnackbarOpen(true);
          } else {
            setSnackbarMessage('Error creating MoM.');
            setSnackbarOpen(true);
          }
        } else {
          setSnackbarMessage('Error creating MoM.');
          setSnackbarOpen(true);
        }
        console.error('Error creating MoM:', error.response?.data || error.message);
      }
    }
  };

  const handleNavigateToList = () => {
    navigate('/momslist');
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    if (currentFieldIndex < 12) {
      setCurrentFieldIndex(prevIndex => prevIndex + 1);
      validate();
    }
  };

  const fieldOptions = [
    'Discussion_points',
    'Discussion_lead',
    'Contributors',
    'Tentative_dates',
    'Decision_taken',
    'Action_items',
    'Status',
    'Comments_notes',
    'Priority_level',
    'Impact',
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-100 rounded-lg shadow-lg">
      <div className="flex justify-end mb-4">
      <Button
  onClick={handleNavigateToList}
  sx={{
    backgroundColor: '#FFE600', // Yellow background by default
    color: '#262b3b', // Black font color by default
    borderColor: '#262b3b', // Black border
    borderWidth: '1px', // Thin border
    borderStyle: 'solid', // Solid border style
    borderRadius: '20px', // Rounded corners
    padding: '8px 16px', // Padding
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Shadow effect
    textTransform: 'none', // Prevent text transformation to uppercase
    '&:hover': {
      backgroundColor: '#ffffff', // White background on hover
      color: '#262b3b', // Black font color on hover
      borderColor: '#262b3b', // Black border on hover
      boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)', // Slightly larger shadow on hover
    },
    width: 'auto',
    border: 'none', // Remove default border
    cursor: 'pointer', // Pointer cursor on hover
  }}
>
  List of Trackers
</Button>


      </div>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold mb-6 text-center">Create Issue Tracker </h2>

        <div className="mb-6">
          <TextField
            label="Title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            variant="outlined"
          />
        </div>

        {momRecords.map((record, index) => (
          <div key={index} className="mb-6 border rounded-lg bg-gray-50 p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium">Record {index + 1}</h3>
              <Button
    type="button"
    onClick={() => handleToggleRecord(index)}
    sx={{
        backgroundColor: '#FFE600', // Yellow background by default
        color: '#262b3b', // Black font color by default
        borderColor: '#262b3b', // Black border
        borderWidth: '1px', // Thin border
        borderStyle: 'solid', // Solid border style
        borderRadius: '20px', // Rounded corners
        padding: '6px 12px', // Padding
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Shadow effect
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#ffffff', // White background on hover
            color: '#262b3b', // Black font color on hover
            borderColor: '#262b3b', // Black border on hover
            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)', // Slightly larger shadow on hover
        },
        border: 'none', // Remove default border
        cursor: 'pointer', // Pointer cursor on hover
    }}
>
    {record.isOpen ? 'Collapse' : 'Expand'}
</Button>

            </div>

            {record.isOpen && (
              <>
                <div className="mb-4">
                  <TextField
                    label="SN Number"
                    name="sn_number"
                    value={record.sn_number}
                    onChange={(e) => handleChange(index, e)}
                    fullWidth
                    variant="outlined"
                  />
                </div>

                <div className="mb-4">
  <FormControl fullWidth variant="outlined">
    <InputLabel id="select-field-label">Select Field</InputLabel>
    <Select
      labelId="select-field-label"
      value={selectedField}
      onChange={(e) => setSelectedField(e.target.value)}
      label="Select Field"
      MenuProps={{
        PaperProps: {
          style: {
            maxHeight: 200, // Adjust max height as needed
          },
        },
      }}
      sx={{
        '& .MuiSelect-select': {
          paddingTop: '12px',
          paddingBottom: '12px',
          height: '30px'
        },
        '& .MuiInputLabel-root': {
          top: 'calc(50% - 6px)', // Center label vertically
        },
        '& .MuiOutlinedInput-root': {
          paddingTop: '16px',
          paddingBottom: '16px',
        },
      }}
    >
      {fieldOptions
        .filter(field => !record.showFields.includes(field))
        .map(field => (
          <MenuItem key={field} value={field}>
            {field.replace('_', ' ')}
          </MenuItem>
        ))}
    </Select>
  </FormControl>
  <Button
    type="button"
    onClick={() => handleAddField(index)}
    sx={{
        backgroundColor: '#FFE600', // Yellow background by default
        color: '#262b3b', // Black text color by default
        borderRadius: '20px', // Rounded corners
        padding: '6px 12px', // Padding
        borderColor: '#262b3b', // Black border
        borderWidth: '1px', // Thin border
        borderStyle: 'solid', // Solid border style
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Shadow effect
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#ffffff', // White background on hover
            color: '#262b3b', // Black text color on hover
            borderColor: '#262b3b', // Black border on hover
            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)', // Slightly larger shadow on hover
        },
        border: 'none', // Remove default border
        cursor: 'pointer', // Pointer cursor on hover
        width: 'auto', // Auto width
        marginTop: '16px', // Margin top
    }}
>
    Add Field
</Button>

</div>



                {record.showFields.map((field, idx) => (
                  <div key={idx} className="mb-4">
                    <TextField
                      label={field.replace('_', ' ')}
                      name={field}
                      value={record[field] || ''}
                      onChange={(e) => handleChange(index, e)}
                      fullWidth
                      variant="outlined"
                    />
                  </div>
                ))}

                <div className="mb-4">
                <FormControl fullWidth variant="outlined">
  <InputLabel id="responsible-person-label">Responsible Person</InputLabel>
  <Select
    labelId="responsible-person-label"
    name="responsible_person_id"
    value={record.responsible_person_id || ''}
    onChange={(e) => handleSelectChange(index, e)}
    label="Responsible Person"
    MenuProps={{
      PaperProps: {
        style: {
          maxHeight: 200, // Adjust max height as needed
        },
      },
    }}
    sx={{
      '& .MuiSelect-select': {
        paddingTop: '12px',
        paddingBottom: '12px',
        height: '30px'
      },
      '& .MuiInputLabel-root': {
        top: 'calc(50% - 6px)', // Center label vertically
      },
      '& .MuiOutlinedInput-root': {
        paddingTop: '16px',
        paddingBottom: '16px',
      },
    }}
  >
    <MenuItem value="">Select Responsible Person</MenuItem>
    {users.filter(user => user.full_name !== 'Super Admin').map(user => (
      <MenuItem key={user.id} value={user.id}>{user.full_name}</MenuItem>
    ))}
  </Select>
</FormControl>

                </div>

                <div className="mb-4">
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="follow_up_required"
                        checked={record.follow_up_required}
                        onChange={(e) => handleChange(index, e)}
                      />
                    }
                    label="Follow Up Required"
                  />
                </div>

                <Button
    type="button"
    onClick={() => handleRemoveRecord(index)}
    sx={{
        backgroundColor: '#FFE600', // Yellow background by default
        color: '#262b3b', // Black text color by default
        borderRadius: '20px', // Rounded corners
        padding: '6px 12px', // Padding
        borderColor: '#262b3b', // Black border
        borderWidth: '1px', // Thin border
        borderStyle: 'solid', // Solid border style
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Shadow effect
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#ffffff', // White background on hover
            color: '#262b3b', // Black text color on hover
            borderColor: '#262b3b', // Black border on hover
            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)', // Slightly larger shadow on hover
        },
        border: 'none', // Remove default border
        cursor: 'pointer', // Pointer cursor on hover
        width: 'auto', // Auto width
    }}
>
    Remove Record
</Button>

              </>
            )}
          </div>
        ))}

        <div className="flex justify-between items-center mb-6">
        <Button
    type="button"
    onClick={handleAddRecord}
    sx={{
        backgroundColor: '#FFE600', // Yellow background by default
        color: '#262b3b', // Black font color by default
        borderRadius: '20px', // Rounded corners
        padding: '6px 12px', // Padding
        borderColor: '#262b3b', // Black border
        borderWidth: '1px', // Thin border
        borderStyle: 'solid', // Solid border style
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Shadow effect
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#ffffff', // White background on hover
            color: '#262b3b', // Black font color on hover
            borderColor: '#262b3b', // Black border on hover
            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)', // Slightly larger shadow on hover
        },
        border: 'none', // Remove default border
        cursor: 'pointer', // Pointer cursor on hover
        width: 'auto', // Auto width
    }}
>
    Add Record
</Button>

<Button
    type="submit"
    sx={{
        backgroundColor: '#FFE600', // Yellow background by default
        color: '#262b3b', // Black text color by default
        borderRadius: '20px', // Rounded corners
        padding: '6px 12px', // Padding
        borderColor: '#262b3b', // Black border
        borderWidth: '1px', // Thin border
        borderStyle: 'solid', // Solid border style
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Shadow effect
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#ffffff', // White background on hover
            color: '#262b3b', // Black text color on hover
            borderColor: '#262b3b', // Black border on hover
            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)', // Slightly larger shadow on hover
        },
        border: 'none', // Remove default border
        cursor: 'pointer', // Pointer cursor on hover
        width: 'auto', // Auto width
    }}
>
    Save Tracker
</Button>

        </div>
      </form>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <MuiAlert onClose={handleCloseSnackbar} severity="info" sx={{ width: '100%', bgcolor: 'black', color: 'white' }}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default MoMForm;
