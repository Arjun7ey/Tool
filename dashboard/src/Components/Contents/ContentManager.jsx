import React, { useState } from 'react';
import CreateNewEvent from './CreateNewEvent';
import UpcomingEvents from './UpcomingEvents';

const ContentManager = () => {
  const [events, setEvents] = useState([
    { date: '4 Jan 2022', time: '5:30 AM to 12:00 AM', title: 'World Braille Day' },
    { date: '30 Jan 2022', time: '5:30 AM to 12:00 AM', title: 'World Leprosy Day' },
  ]);

  const addEvent = (newEvent) => {
    setEvents([...events, newEvent]);
  };

  return (
    <div className="p-4 bg-white rounded shadow-md">
      <CreateNewEvent addEvent={addEvent} />
      <UpcomingEvents events={events} />
    </div>
  );
};

export default ContentManager;
