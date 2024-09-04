import React from 'react';

const DashboardOverview = ({ pageHeading}) => {
  return (
    <div className="bg-sky-500 p-4 rounded shadow-md justify-between flex">
      <h2 style={{color:'white'}} className="text-xl font-semibold">{pageHeading}</h2>
      <h2 style={{color:'white'}} className="text-xl font-semibold">Department of Education</h2>
    </div>
  );
};

export default DashboardOverview;
