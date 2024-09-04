import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { AuthContext } from '../utils/AuthContext';
import { FaEdit } from 'react-icons/fa';

const MoMList = () => {
  const [moMs, setMoMs] = useState([]);
  const [selectedMoM, setSelectedMoM] = useState(null);
  const [sliderValue, setSliderValue] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const { userData, isLoading } = useContext(AuthContext);

  useEffect(() => {
    const fetchMoMs = async () => {
      try {
        const response = await axiosInstance.get('/api/moms/');
        setMoMs(response.data);
      } catch (error) {
        console.error('Error fetching MoMs:', error);
      }
    };

    fetchMoMs();
  }, []);

  const handleMoMClick = (mom) => {
    setSelectedMoM(mom);
  };

  const handleSliderChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setSliderValue((prevValue) => Math.max(newValue, prevValue));
  };

  const handleSliderConfirm = async () => {
    if (!currentRow) return;
    
    try {
      const updatedCompletionPercentage = sliderValue || currentRow.completion_percentage;
      const completionStatus = updatedCompletionPercentage === 100;

      await axiosInstance.patch(`/api/momrows/${currentRow.sn_number}/update/`, {
        completion_percentage: updatedCompletionPercentage,
        completion_status: completionStatus,
      });

      setSelectedMoM((prevSelectedMoM) => ({
        ...prevSelectedMoM,
        rows: prevSelectedMoM.rows.map((r) =>
          r.sn_number === currentRow.sn_number
            ? { ...r, completion_percentage: updatedCompletionPercentage, completion_status: completionStatus }
            : r
        ),
      }));

      setPopupVisible(false);
      setSliderValue(null); // Clear slider value after closing
    } catch (error) {
      console.error('Error updating MoM:', error.response?.data || error.message);
    }
  };

  const handleSliderCancel = () => {
    setPopupVisible(false);
    setSliderValue(null);
  };

  const filteredMoMs = userData.userRole === 'superadmin'
    ? moMs
    : userData.userRole === 'departmentadmin'
    ? moMs.filter(mom =>
        mom.rows && mom.rows.some(row =>
          row.responsible_person_departments?.some(dept =>
            userData.departments.some(userDept => userDept.id === dept.id)
          )
        )
      )
    : moMs.filter(mom =>
        mom.rows && mom.rows.some(row => row.responsible_person_id === userData.userId)
      );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col p-4">
      <h2 className="text-2xl mb-4">List of Issue Trackers Assigned</h2>

      {filteredMoMs.length === 0 ? (
        <p>No Tracker available</p>
      ) : (
        <>
          <div className="mb-4">
            <ul className="list-disc pl-5">
              {filteredMoMs.map((mom) => (
                <li
                  key={mom.sn_number}
                  className="cursor-pointer mb-2 p-2 border rounded hover:bg-gray-100"
                  onClick={() => handleMoMClick(mom)}
                >
                  {mom.title}
                </li>
              ))}
            </ul>
          </div>

          {selectedMoM && selectedMoM.rows?.length > 0 && (
            <div className="border border-gray-300 p-4">
              <h3 className="text-xl mb-4">Issue Tracker Details</h3>
              <div className="overflow-x-auto">
                <table className="table-auto w-full text-center">
                  <thead>
                    <tr>
                      {['sn_number', 'discussion_points', 'discussion_lead', 'contributors', 'tentative_dates', 'decision_taken', 'action_items', 'status', 'comments_notes', 'priority_level', 'impact', 'follow_up_required'].map((field, index) => (
                        selectedMoM.rows.some(row => row[field] !== '') && (
                          <th key={index} className="px-4 py-2 border">
                            {field.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                          </th>
                        )
                      ))}
                      <th className="px-4 py-2 border">Responsible Person</th>
                      <th className="px-4 py-2 border">Completion Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMoM.rows.map((row) => (
                      <tr key={row.sn_number}>
                        {['sn_number', 'discussion_points', 'discussion_lead', 'contributors', 'tentative_dates', 'decision_taken', 'action_items', 'status', 'comments_notes', 'priority_level', 'impact', 'follow_up_required'].map((field, index) => (
                          row[field] !== '' && (
                            <td key={index} className="px-4 py-2 border">
                              {field === 'follow_up_required' ? (row[field] ? 'Yes' : 'No') : row[field]}
                            </td>
                          )
                        ))}
                        <td className="px-4 py-2 border">
                          {row.responsible_person_full_name || 'No Person Assigned'}
                        </td>
                        <td className="px-4 py-2 border">
                          <div className="flex items-center justify-center">
                            {row.completion_percentage}%
                            <button
                              onClick={() => {
                                setSliderValue(row.completion_percentage);
                                setPopupVisible(true);
                                setCurrentRow(row);
                              }}
                              className="ml-2 text-blue-500"
                            >
                              <FaEdit />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Popup for editing percentage */}
          {popupVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
              <div className="bg-white p-6 rounded shadow-lg w-80">
                <h3 className="text-xl mb-4">Edit Completion Percentage</h3>
                <div className="flex items-center mb-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={sliderValue || currentRow?.completion_percentage}
                    onChange={handleSliderChange}
                    className="slider w-full"
                  />
                  <span className="ml-2">{sliderValue || currentRow?.completion_percentage}%</span>
                </div>
                <div className="flex justify-end">
                  <button onClick={handleSliderConfirm} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
                    Confirm
                  </button>
                  <button onClick={handleSliderCancel} className="bg-red-500 text-white px-4 py-2 rounded">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Utility function to round numbers to two decimals
const roundToTwoDecimals = (value) => {
  return Math.round(value * 100) / 100;
};

export default MoMList;
