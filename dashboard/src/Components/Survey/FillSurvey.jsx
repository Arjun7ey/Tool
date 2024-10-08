import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const FillSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const response = await axiosInstance.get(`/api/surveys/detail/${id}/`);
        setSurvey(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching survey:', err);
        setError('Failed to fetch survey. Please try again later.');
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [id]);

  const handleInputChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleUserNameChange = (e) => {
    setUserName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError('Please enter your name before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      await axiosInstance.post(`/api/surveys/respond/${id}/`, {
        answers: answers,
        user_identifier: userName
      });
      setSuccessMessage('Survey response submitted successfully!');
    } catch (err) {
      console.error('Error submitting survey response:', err);
      setError('Failed to submit survey response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-8">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-100 to-purple-100 min-h-screen p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">{survey.survey.title}</h2>
        <p className="text-gray-600 mb-8">{survey.survey.description}</p>
        {successMessage ? (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center">
            <CheckCircle className="mr-2" />
            {successMessage}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="userName">
                Your Name
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={handleUserNameChange}
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            {survey.questions.map((question, index) => (
              <div key={question.id} className="mb-6">
                <label className="block text-gray-700 text-lg font-bold mb-2">
                  {index + 1}. {question.question_text}
                </label>
                {question.question_type === 'text' ? (
                  <textarea
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-indigo-500"
                    rows="3"
                    onChange={(e) => handleInputChange(question.id, e.target.value)}
                    required
                  ></textarea>
                ) : (
                  <div className="mt-2">
                    {question.choices.map((choice, choiceIndex) => (
                      <div key={choiceIndex} className="flex items-center mb-2">
                        <input
                          type="radio"
                          id={`question_${question.id}_choice_${choiceIndex}`}
                          name={`question_${question.id}`}
                          value={choice}
                          onChange={(e) => handleInputChange(question.id, e.target.value)}
                          className="mr-2"
                          required
                        />
                        <label htmlFor={`question_${question.id}_choice_${choiceIndex}`} className="text-gray-700">
                          {choice}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          <div className="flex justify-end">
  <button
    type="submit"
    disabled={submitting}
    className={`bg-[#FFE600] text-black px-6 py-3 rounded-full font-semibold hover:bg-[#E6CF00] transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-opacity-50 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {submitting ? 'Submitting...' : 'Submit Survey'}
  </button>
</div>
          </form>
        )}
        {successMessage && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate('/surveylist')}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300"
            >
              Back to Surveys
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FillSurvey;