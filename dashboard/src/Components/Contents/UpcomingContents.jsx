import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../utils/axiosInstance'; // Adjust the import path as necessary

const UpcomingContents = () => {
  const [events, setEvents] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('');

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await axiosInstance.get('api/department-userwise/');
      setDivisions(response.data.divisions);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Fetch events
  const fetchEvents = async () => {
    try {
      const response = await axiosInstance.get('api/contents/');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching contents:', error);
    }
  };

  useEffect(() => {
    fetchDepartments(); 
    fetchEvents(); 
  }, []);

  // Derive unique department names
  const uniqueDivisions = useMemo(() => {
    if (!Array.isArray(divisions)) return [];
    return divisions.map(division => division.name);
  }, [divisions]);

  // Filter events based on the selected department
  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return events.filter(event =>
      !selectedDivision || event.division_name === selectedDivision
    );
  }, [events, selectedDivision]);

  const handleDivisionChange = (event) => {
    setSelectedDivision(event.target.value);
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upcoming Contents</h2>
      <div className="mb-4">
        <label htmlFor="departmentFilter" className="block text-sm font-medium text-gray-700">
          Filter by Division:
        </label>
        <select
        id="departmentFilter"
        name="departmentFilter"
        className="p-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        value={selectedDivision}
        onChange={handleDivisionChange}
      >
        <option value="">All Divisions</option>
        {divisions
          .map(division => division.name) 
          .filter(name => name !== 'Super Department') 
          .map((dept, index) => (
            <option key={index} value={dept}>{dept}</option>
          ))
        }
      </select>
      </div>
      <p className="text-gray-500 mb-4">Don't miss scheduled contents</p>
      {filteredEvents.length > 0 ? (
        filteredEvents.map((event, index) => (
          <div key={index} className="mb-2 bg-yellow-200 p-2 border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-blue-500">
                  {new Date(event.start_time).toLocaleDateString()}
                </span>
                <br />
                <span className="text-gray-500">
                  {new Date(event.start_time).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <div className="text-lg font-medium">{event.title}</div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 font-bold">
          No contents found.
        </p>
      )}
    </div>
  );
};

export default UpcomingContents;
