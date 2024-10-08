import React, { useState, useEffect } from 'react';
import {
  Button, TextField, Checkbox, FormControlLabel, Select, MenuItem,
  Stepper, Step, StepLabel, Typography, Box, Paper, Container,
  Snackbar, Alert, IconButton, FormControl, InputLabel, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, ArrowBack, ArrowForward, CheckBox, CheckBoxOutlineBlank, List as ListIcon } from '@mui/icons-material';
import { styled } from '@mui/system';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: '#f8f9fa',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '20px',
  padding: '10px 20px',
  textTransform: 'none',
  fontWeight: 'bold',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  backgroundColor: '#FFD700', // Gold color
  color: '#000000', // Black color
  '&:hover': {
    backgroundColor: '#FFC700', // Slightly darker gold on hover
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
}));

const steps = ['Basic Information', 'Select Fields', 'Record Details', 'Review & Submit'];

const allFields = [
  'sn_number',
  'discussion_points',
  'discussion_lead',
  'contributors',
  'tentative_dates',
  'decision_taken',
  'action_items',
  'responsible_person_id',
  'status',
  'comments_notes',
  'priority_level',
  'impact',
  'follow_up_required',
];

const requiredFields = ['sn_number', 'responsible_person_id'];

const ModernFlexibleMoMForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [title, setTitle] = useState('');
  const [selectedFields, setSelectedFields] = useState(['sn_number', 'discussion_points', 'responsible_person_id']);
  const [momRecords, setMomRecords] = useState([{}]);
  const [users, setUsers] = useState([]);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/api/users-MoM/');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        showSnackbar('Error fetching users. Please refresh the page.', 'error');
      }
    };

    fetchUsers();
  }, []);

  const handleNext = () => {
    if (activeStep === 0 && !title.trim()) {
      showSnackbar('Please enter a tracker title.', 'error');
      return;
    }

    if (activeStep === 1) {
      if (!selectedFields.includes('sn_number') || !selectedFields.includes('responsible_person_id')) {
        showSnackbar('SN Number and Responsible Person are required fields.', 'error');
        return;
      }
      // Initialize momRecords with selected fields
      setMomRecords([selectedFields.reduce((acc, field) => ({ ...acc, [field]: '' }), {})]);
    }

    if (activeStep === 2) {
      const isValid = validateRecords();
      if (!isValid) return;
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (index, field, value) => {
    const newMomRecords = [...momRecords];
    newMomRecords[index] = { ...newMomRecords[index], [field]: value };
    setMomRecords(newMomRecords);
  };

  const handleAddRecord = () => {
    setMomRecords([...momRecords, selectedFields.reduce((acc, field) => ({ ...acc, [field]: '' }), {})]);
  };

  const handleRemoveRecord = (index) => {
    const newMomRecords = momRecords.filter((_, i) => i !== index);
    setMomRecords(newMomRecords);
  };

  const handleFieldToggle = (field) => {
    setSelectedFields(prevFields =>
      prevFields.includes(field)
        ? prevFields.filter(f => f !== field)
        : [...prevFields, field]
    );
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const navigateToList = () => {
    navigate('/momslist');
  };

  const validateRecords = () => {
    for (let i = 0; i < momRecords.length; i++) {
      const record = momRecords[i];
      for (const field of requiredFields) {
        if (record[field] === undefined || record[field] === null || 
            (typeof record[field] === 'string' && record[field].trim() === '') ||
            (typeof record[field] === 'number' && isNaN(record[field]))) {
          showSnackbar(`${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required for Record ${i + 1}.`, 'error');
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Validate form data
      if (!title.trim()) {
        throw new Error('Tracker title is required.');
      }

      if (!validateRecords()) {
        setIsSubmitting(false);
        return;
      }

      // Filter out empty records
      const nonEmptyRecords = momRecords.filter(record => 
        Object.values(record).some(value => 
          value !== undefined && value !== null && value !== '' && !isNaN(value)
        )
      );

      if (nonEmptyRecords.length === 0) {
        throw new Error('At least one non-empty record is required.');
      }

      // Log the data being sent
      console.log('Submitting data:', { title, mom_rows_create: nonEmptyRecords });

      const response = await axiosInstance.post('/api/mom-create/', {
        title: title,
        mom_rows_create: nonEmptyRecords,
      });

      console.log('MoM records created:', response.data);
      showSnackbar('Tracker created successfully!', 'success');
      setTimeout(() => navigate('/momslist'), 2000);
    } catch (error) {
      console.error('Error creating MoM:', error);
      let errorMessage = 'Error creating tracker. Please try again.';
      if (error.response) {
        console.error('Error response:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
            <TextField
              fullWidth
              label="Tracker Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              required
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Select Fields for Records</Typography>
            <List>
              {allFields.map((field) => (
                <ListItem key={field} button onClick={() => handleFieldToggle(field)}>
                  <ListItemIcon>
                    {selectedFields.includes(field) ? <CheckBox /> : <CheckBoxOutlineBlank />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    secondary={requiredFields.includes(field) ? '(Required)' : ''}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Record Details</Typography>
            {momRecords.map((record, index) => (
              <StyledPaper key={index} elevation={3}>
                <Typography variant="subtitle1" gutterBottom>Record {index + 1}</Typography>
                {selectedFields.map((field) => (
                  <React.Fragment key={field}>
                    {field === 'responsible_person_id' ? (
                      <FormControl fullWidth margin="normal" required>
                        <InputLabel>Responsible Person</InputLabel>
                        <Select
                          value={record[field] || ''}
                          onChange={(e) => handleChange(index, field, e.target.value)}
                          label="Responsible Person"
                        >
                          {users.map(user => (
                            <MenuItem key={user.id} value={user.id}>{user.full_name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : field === 'follow_up_required' ? (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={record[field] || false}
                            onChange={(e) => handleChange(index, field, e.target.checked)}
                          />
                        }
                        label="Follow Up Required"
                      />
                    ) : (
                      <TextField
                        fullWidth
                        label={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        value={record[field] || ''}
                        onChange={(e) => handleChange(index, field, e.target.value)}
                        margin="normal"
                        required={requiredFields.includes(field)}
                        multiline={field === 'discussion_points' || field === 'action_items'}
                        rows={field === 'discussion_points' || field === 'action_items' ? 3 : 1}
                      />
                    )}
                  </React.Fragment>
                ))}
                {momRecords.length > 1 && (
                  <IconButton onClick={() => handleRemoveRecord(index)} color="secondary">
                    <RemoveIcon />
                  </IconButton>
                )}
              </StyledPaper>
            ))}
            <StyledButton
              startIcon={<AddIcon />}
              onClick={handleAddRecord}
              variant="outlined"
              sx={{ mt: 2 }}
            >
              Add Another Record
            </StyledButton>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Review & Submit</Typography>
            <Typography variant="subtitle1">Title: {title}</Typography>
            <Typography variant="subtitle1">Selected Fields: {selectedFields.join(', ')}</Typography>
            <Typography variant="subtitle1">Total Records: {momRecords.length}</Typography>
            {/* You can add more detailed review information here if needed */}
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom sx={{ mt: 4 }}>
        Create Issue Tracker
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <StyledButton
          onClick={navigateToList}
          startIcon={<ListIcon />}
        >
          Go to List
        </StyledButton>
      </Box>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <StyledPaper elevation={3}>
        <form onSubmit={(e) => e.preventDefault()}>
          {renderStepContent(activeStep)}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <StyledButton
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBack />}
            >
              Back
            </StyledButton>
            {activeStep === steps.length - 1 ? (
              <StyledButton
                onClick={handleSubmit}
                variant="contained"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </StyledButton>
            ) : (
              <StyledButton
                onClick={handleNext}
                variant="contained"
                endIcon={<ArrowForward />}
              >
                Next
              </StyledButton>
            )}
          </Box>
        </form>
      </StyledPaper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ModernFlexibleMoMForm;