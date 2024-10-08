import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, PlusCircle, Loader, Eye, Edit, User } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const SurveyList = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await axiosInstance.get('/api/surveys/list/');
        setSurveys(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching surveys:', err);
        setError('Failed to fetch surveys. Please try again later.');
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  const fetchSurveyDetails = async (surveyId) => {
    try {
      const response = await axiosInstance.get(`/api/surveys/detail/${surveyId}/`);
      setSelectedSurvey(response.data);
    } catch (err) {
      console.error('Error fetching survey details:', err);
      setError('Failed to fetch survey details. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader className="animate-spin h-8 w-8 text-yellow-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-8 bg-white">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800">Survey List</h2>
          <Link 
  to="/survey" 
  className="flex items-center bg-[#FFE600] text-black px-4 py-2 rounded-md hover:bg-[#E6CF00] transition duration-300 ease-in-out font-medium"
>
  <PlusCircle size={20} className="mr-2" />
  Create New Survey
</Link>
        </div>
        {surveys.length === 0 ? (
          <p className="text-center text-gray-600">No surveys available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.map((survey) => (
              <div key={survey.id} className="bg-gray-50 rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300 border border-gray-200">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{survey.title}</h3>
                <p className="text-gray-600 mb-2">{survey.description}</p>
                <p className="text-sm text-gray-500 mb-4 flex items-center">
                  <User size={16} className="mr-1" />
                  Created by: {survey.creator_full_name}
                </p>
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => fetchSurveyDetails(survey.id)}
                    className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center"
                  >
                    <Eye size={20} className="mr-1" />
                    View Details
                  </button>
                  <Link 
                    to={`/fill-survey/${survey.id}`}
                    className="text-yellow-600 hover:text-yellow-700 font-medium flex items-center"
                  >
                    <Edit size={20} className="mr-1" />
                    Fill Survey
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedSurvey && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedSurvey.survey.title}</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">{selectedSurvey.survey.description}</p>
                  <p className="text-sm text-gray-500 mt-2 flex items-center justify-center">
                    <User size={16} className="mr-1" />
                    Created by: {selectedSurvey.survey.creator_full_name}
                  </p>
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-gray-700">Questions:</h4>
                    <ul className="list-disc list-inside">
                      {selectedSurvey.questions.map((question, index) => (
                        <li key={index} className="text-sm text-gray-600 mt-2">
                          {question.question_text}
                          {question.question_type === 'choice' && (
                            <ul className="list-circle list-inside ml-4">
                              {question.choices.map((choice, choiceIndex) => (
                                <li key={choiceIndex} className="text-xs text-gray-500">{choice}</li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="items-center px-4 py-3">
  <button
    id="ok-btn"
    className="px-4 py-2 bg-[#FFE600] text-black text-base font-medium rounded-md w-full shadow-sm hover:bg-[#E6CF00] transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-opacity-50"
    onClick={() => setSelectedSurvey(null)}
  >
    Close
  </button>
</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyList;