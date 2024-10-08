import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, Save, AlertCircle, CheckCircle } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const CreateSurvey = () => {
  const navigate = useNavigate();
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    questions: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        navigate('/surveylist');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  const validateForm = () => {
    let formErrors = {};
    if (!survey.title.trim()) formErrors.title = "Title is required";
    if (!survey.description.trim()) formErrors.description = "Description is required";
    if (survey.questions.length === 0) formErrors.questions = "At least one question is required";
    survey.questions.forEach((question, index) => {
      if (!question.text.trim()) formErrors[`question_${index}`] = "Question text is required";
      if (question.type === 'choice' && question.choices.length < 2) 
        formErrors[`question_${index}_choices`] = "At least two choices are required";
    });
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const addQuestion = () => {
    setSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, { text: '', type: 'text', choices: [] }]
    }));
  };

  const removeQuestion = (index) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateQuestion = (index, field, value) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const addChoice = (questionIndex) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, choices: [...q.choices, ''] }
          : q
      )
    }));
  };

  const updateChoice = (questionIndex, choiceIndex, value) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { 
              ...q, 
              choices: q.choices.map((c, j) => j === choiceIndex ? value : c)
            }
          : q
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post('/api/surveys/create/', survey);
      setSuccessMessage(`Survey "${response.data.title}" created successfully!`);
      setSurvey({ title: '', description: '', questions: [] });
      setErrors({});
    } catch (error) {
      console.error('Error creating survey:', error);
      setErrors({ submit: "Failed to create survey. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-lg p-8 border border-gray-200">
        <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">Create New Survey</h2>
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center">
            <CheckCircle className="mr-2" />
            {successMessage}
          </div>
        )}
        {errors.submit && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
            <AlertCircle className="mr-2" />
            {errors.submit}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Survey Title</label>
            <input
              type="text"
              id="title"
              value={survey.title}
              onChange={(e) => setSurvey(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3 py-2 bg-white text-gray-700 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500`}
              required
            />
            {errors.title && <p className="text-red-500 text-xs italic mt-1">{errors.title}</p>}
          </div>
          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea
              id="description"
              value={survey.description}
              onChange={(e) => setSurvey(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full px-3 py-2 bg-white text-gray-700 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500`}
              rows="3"
            ></textarea>
            {errors.description && <p className="text-red-500 text-xs italic mt-1">{errors.description}</p>}
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Questions</h3>
            {errors.questions && <p className="text-red-500 text-xs italic mb-2">{errors.questions}</p>}
            {survey.questions.map((question, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg mb-4 shadow-md border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-medium text-gray-700">Question {index + 1}</h4>
                  <button 
                    type="button" 
                    onClick={() => removeQuestion(index)}
                    className="text-red-600 hover:text-red-700 transition duration-300"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                  className={`w-full px-3 py-2 bg-white text-gray-700 border ${errors[`question_${index}`] ? 'border-red-500' : 'border-gray-300'} rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-gold-500`}
                  placeholder="Enter question text"
                  required
                />
                {errors[`question_${index}`] && <p className="text-red-500 text-xs italic mb-2">{errors[`question_${index}`]}</p>}
                <select
                  value={question.type}
                  onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                  className="w-full px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="text">Text</option>
                  <option value="choice">Multiple Choice</option>
                </select>
                {question.type === 'choice' && (
                  <div className="ml-4">
                    {question.choices.map((choice, choiceIndex) => (
                      <input
                        key={choiceIndex}
                        type="text"
                        value={choice}
                        onChange={(e) => updateChoice(index, choiceIndex, e.target.value)}
                        className="w-full px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-gold-500"
                        placeholder={`Choice ${choiceIndex + 1}`}
                        required
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => addChoice(index)}
                      className="text-gold-600 hover:text-gold-700 font-medium transition duration-300"
                    >
                      + Add Choice
                    </button>
                    {errors[`question_${index}_choices`] && <p className="text-red-500 text-xs italic mt-1">{errors[`question_${index}_choices`]}</p>}
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center text-gold-600 hover:text-gold-700 font-medium transition duration-300"
            >
              <PlusCircle size={20} className="mr-2" />
              Add Question
            </button>
          </div>
          <div className="flex justify-end">
          <button
  type="submit"
  disabled={isSubmitting}
  className={`flex items-center bg-[#FFE600] text-black px-6 py-3 rounded-full font-semibold hover:bg-[#E6CF00] transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-opacity-50 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
>
  <Save size={20} className="mr-2" />
  {isSubmitting ? 'Creating...' : 'Create Survey'}
</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateSurvey;