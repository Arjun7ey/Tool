import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import Header from '../Header';
import Sidebar from '../Sidebar';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  FormControl,
  FormLabel,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DashboardOverview from '../Dashboard/DashboardOverview';

const SurveyTable = () => {
  const headerProps = {
    pageHeading: "Survey",
  };
  const [surveys, setSurveys] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState(null);
  const [newSurvey, setNewSurvey] = useState({
    title: '',
    description: '',
    questions: [{ question_text: '', question_type: 'text', options: [] }],
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await axiosInstance.get('/api/surveys/');
      setSurveys(response.data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    }
  };

  const handleViewQuestions = async (surveyId) => {
    try {
      const response = await axiosInstance.get(`/api/surveys/${surveyId}/questions/`);
      setQuestions(response.data);
      setSelectedSurveyId(surveyId);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleSurveyChange = (e) => {
    setNewSurvey({
      ...newSurvey,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuestionChange = (index, e) => {
    const updatedQuestions = [...newSurvey.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [e.target.name]: e.target.value };
    setNewSurvey({
      ...newSurvey,
      questions: updatedQuestions,
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, e) => {
    const updatedQuestions = [...newSurvey.questions];
    updatedQuestions[questionIndex].options[optionIndex] = e.target.value;
    setNewSurvey({
      ...newSurvey,
      questions: updatedQuestions,
    });
  };

  const addQuestion = () => {
    setNewSurvey({
      ...newSurvey,
      questions: [...newSurvey.questions, { question_text: '', question_type: 'text', options: [] }],
    });
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...newSurvey.questions];
    updatedQuestions[questionIndex].options.push('');
    setNewSurvey({
      ...newSurvey,
      questions: updatedQuestions,
    });
  };

  const handleSurveySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const surveyData = {
        title: newSurvey.title,
        description: newSurvey.description,
        questions: newSurvey.questions.map(question => ({
          question_text: question.question_text,
          question_type: question.question_type,
          options: question.options,
        })),
      };

      await axiosInstance.post('/api/surveys/create-with-questions/', surveyData);
      fetchSurveys();
      setNewSurvey({ title: '', description: '', questions: [{ question_text: '', question_type: 'text', options: [] }] });
      handleClose();
    } catch (error) {
      console.error('Error creating survey:', error);
      setError('Failed to create survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError('');
  };

  return (
    <div className="flex">
      <div className="flex-grow">
        <Header />
        <div className="p-4"><DashboardOverview {...headerProps} /></div>
        <div className="p-4">
          <Typography variant="h4" gutterBottom>Survey List</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {surveys.map((survey) => (
                  <TableRow key={survey.id} hover onClick={() => handleViewQuestions(survey.id)}>
                    <TableCell>{survey.title}</TableCell>
                    <TableCell>{survey.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {selectedSurveyId && (
            <div className="mt-4">
              <Typography variant="h5" gutterBottom>Questions for Survey</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Question Text</TableCell>
                      <TableCell>Question Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {questions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell>{question.question_text}</TableCell>
                        <TableCell>{question.question_type}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}

          <div className="mt-4">
            <IconButton onClick={handleClickOpen} color="primary" aria-label="add survey">
              <AddCircleIcon fontSize="large" />
            </IconButton>
          </div>

          <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>Create Survey</DialogTitle>
            <DialogContent>
              <form onSubmit={handleSurveySubmit}>
                <FormControl fullWidth margin="normal">
                  <TextField
                    label="Title"
                    name="title"
                    value={newSurvey.title}
                    onChange={handleSurveyChange}
                    required
                  />
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <TextField
                    label="Description"
                    name="description"
                    value={newSurvey.description}
                    onChange={handleSurveyChange}
                    required
                  />
                </FormControl>

                <Typography variant="h6" gutterBottom>Questions:</Typography>
                {newSurvey.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="mb-4">
                    <FormControl fullWidth margin="normal">
                      <TextField
                        label={`Question ${questionIndex + 1}`}
                        name="question_text"
                        value={question.question_text}
                        onChange={(e) => handleQuestionChange(questionIndex, e)}
                        required
                      />
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                      <Select
                        label="Question Type"
                        name="question_type"
                        value={question.question_type}
                        onChange={(e) => handleQuestionChange(questionIndex, e)}
                        required
                      >
                        <MenuItem value="text">Text</MenuItem>
                        <MenuItem value="choice">Multiple Choice</MenuItem>
                      </Select>
                    </FormControl>
                    {question.question_type === 'choice' && (
                      <div className="mt-2">
                        {question.options.map((option, optionIndex) => (
                          <FormControl fullWidth margin="normal" key={optionIndex}>
                            <TextField
                              label={`Option ${optionIndex + 1}`}
                              name="option"
                              value={option}
                              onChange={(e) => handleOptionChange(questionIndex, optionIndex, e)}
                              required
                            />
                          </FormControl>
                        ))}
                        <IconButton onClick={() => addOption(questionIndex)} color="primary">
                          <AddCircleIcon />
                        </IconButton>
                      </div>
                    )}
                  </div>
                ))}
                <Button onClick={addQuestion} color="primary">
                  Add Question
                </Button>
                <DialogActions>
                  <Button onClick={handleClose} color="secondary">
                    Cancel
                  </Button>
                  <Button type="submit" color="primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </DialogActions>
                {error && <Typography color="error">{error}</Typography>}
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
     
    </div>
  );
};

export default SurveyTable;
