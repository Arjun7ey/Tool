import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance'; // Adjust the import path as necessary
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, eachHourOfInterval, setHours, getHours, isSameDay, isSameMonth, subMonths, addMonths } from 'date-fns';
import { Button, Tooltip } from '@mui/material';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', or 'day'
  const [currentTime, setCurrentTime] = useState(format(new Date(), 'HH:mm:ss'));
  const [events, setEvents] = useState([]);

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      const response = await axiosInstance.get('api/contents/');
      // Ensure dates are Date objects
      const parsedEvents = response.data.map(event => ({
        ...event,
        start_time: new Date(event.start_time),
        end_time: new Date(event.end_time)
      }));
      setEvents(parsedEvents);
    } catch (error) {
      console.error('Error fetching contents:', error);
    }
  };

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(format(new Date(), 'HH:mm:ss'));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch events when component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  const renderHeader = () => {
    return (
      <div className="flex flex-col mb-4">
        <div className="flex justify-center space-x-2 mb-2">
          <Button onClick={() => setViewMode('month')} variant={viewMode === 'month' ? 'contained' : 'text'}>Month</Button>
          <Button onClick={() => setViewMode('week')} variant={viewMode === 'week' ? 'contained' : 'text'}>Week</Button>
          <Button onClick={() => setViewMode('day')} variant={viewMode === 'day' ? 'contained' : 'text'}>Day</Button>
          <div className="text-xl font-semibold">{currentTime}</div>
        </div>
        <div className="flex justify-between items-center mb-2 border">
          <div className="text-xl font-semibold">
            {viewMode === 'month' ? format(currentDate, 'MMMM yyyy') :
            viewMode === 'week' ? `${format(startOfWeek(currentDate), 'MMMM d')} - ${format(endOfWeek(currentDate), 'MMMM d, yyyy')}` :
            format(selectedDate, 'MMMM d, yyyy')}
          </div>
          <div className="flex space-x-2">
            {viewMode === 'month' && (
              <>
                <Button style={{ backgroundColor: '#fce8805e', color: '#F4B400' }} onClick={prevMonth}>{'<'}</Button>
                <Button style={{ backgroundColor: '#fce8805e', color: '#F4B400' }} onClick={nextMonth}>{'>'}</Button>
                <Button style={{ backgroundColor: '#fce8805e', color: '#F4B400' }} onClick={resetToToday}>Today</Button>
              </>
            )}
            {viewMode !== 'month' && (
              <>
                <Button style={{ backgroundColor: '#fce8805e', color: '#F4B400' }} onClick={prevMonth}>{'<'}</Button>
                <Button style={{ backgroundColor: '#fce8805e', color: '#F4B400' }} onClick={nextMonth}>{'>'}</Button>
                <Button style={{ backgroundColor: '#fce8805e', color: '#F4B400' }} variant="contained" onClick={() => setViewMode('month')}>Back</Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center font-semibold" key={i}>
          {format(addDays(startDate, i), 'EEE')}
        </div>
      );
    }

    return <div className="grid grid-cols-7 gap-2">{days}</div>;
  };

  const renderWeekCells = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
  
    const days = [];
    let day = weekStart;
  
    while (day <= weekEnd) {
      const formattedDate = format(day, 'd');
      const cloneDay = day;
      const dayEvents = events.filter(event => 
        isSameDay(event.start_time, day) // Highlight only if event starts on this day
      );
  
      days.push(
        <div
          className={`p-2 border cursor-pointer text-center ${isSameMonth(day, currentDate) ? '' : 'text-gray-400'} flex flex-col items-center justify-between ${dayEvents.length > 0 ? 'bg-yellow-200' : ''}`}
          style={{ height: '100px', width: '100px' }}
          key={day}
          onClick={() => setSelectedDate(cloneDay)}
        >
          <div className="text-sm">{formattedDate}</div>
          {dayEvents.length > 0 && (
            <Tooltip title={
              <div>
                {dayEvents.map((event, index) => (
                  <div key={index}>
                    <div>{event.title}</div>
                    <div>{format(event.start_time, 'PPpp')}</div>
                  </div>
                ))}
              </div>
            }>
              <div className="bg-blue-200 text-blue-800 p-1 mt-1 text-xs rounded">{dayEvents[0].title}</div>
            </Tooltip>
          )}
        </div>
      );
      day = addDays(day, 1);
    }
  
    return <div className="grid grid-cols-7 gap-2">{days}</div>;
  };
  
  const renderMonthCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
  
    const rows = [];
    let days = [];
    let day = startDate;
  
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = day;
        const dayEvents = events.filter(event => 
          isSameDay(event.start_time, day) // Highlight only if event starts on this day
        );
  
        days.push(
          <div
            className={`p-2 border cursor-pointer text-center ${isSameMonth(day, currentDate) ? '' : 'text-gray-400'} flex flex-col items-center justify-between ${dayEvents.length > 0 ? 'bg-yellow-200' : ''}`}
            style={{ height: '100px', width: '100px' }}
            key={day}
            onDoubleClick={() => {
              setSelectedDate(cloneDay);
              setViewMode('day');
            }}
          >
            <div className="text-sm">{formattedDate}</div>
            {dayEvents.length > 0 && (
              <Tooltip title={
                <div>
                  {dayEvents.map((event, index) => (
                    <div key={index}>
                      <div>{event.title}</div>
                      <div>{format(event.start_time, 'PPpp')}</div>
                    </div>
                  ))}
                </div>
              }>
                <div className="bg-blue-200 text-blue-800 p-1 mt-1 text-xs rounded">{dayEvents[0].title}</div>
              </Tooltip>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-2" key={day}>
          {days}
        </div>
      );
      days = [];
    }
  
    return <div>{rows}</div>;
  };
  
  const renderDayCells = () => {
    const startDate = setHours(selectedDate, 0);
    const endDate = setHours(selectedDate, 23);

    const hours = eachHourOfInterval({ start: startDate, end: endDate });

    return (
      <div>
        {hours.map(hour => (
          <div key={hour} className="p-2 border-b border-dotted text-center" style={{ height: '100px' }}>
            <div className="text-sm font-semibold">{format(hour, 'h a')}</div>
            {events.filter(event => 
              isSameDay(event.start_time, selectedDate) && 
              getHours(event.start_time) <= getHours(hour) && 
              getHours(event.end_time) >= getHours(hour))
              .map((event, index) => (
                <Tooltip key={index} title={
                  <div>
                    <div>{event.title}</div>
                    <div>{format(event.start_time, 'PPpp')} - {format(event.end_time, 'PPpp')}</div>
                    <div>{event.url}</div>
                  </div>
                }>
                  <div className="bg-blue-200 text-blue-800 p-1 mt-1 text-xs rounded">{event.title}</div>
                </Tooltip>
              ))}
          </div>
        ))}
      </div>
    );
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const resetToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  return (
    <div className="p-4"> {/* Set a fixed height for the calendar container */}
      {renderHeader()}
      {viewMode === 'month' && renderDays()}
      {viewMode === 'month' && renderMonthCells()}
      {viewMode === 'week' && renderDays()}
      {viewMode === 'week' && renderWeekCells()}
      <div className="p-4" style={{ height: '400px', overflowY: 'auto' }}>
        {viewMode === 'day' && renderDayCells()}
      </div>
    </div>
  );
};

export default Calendar;
