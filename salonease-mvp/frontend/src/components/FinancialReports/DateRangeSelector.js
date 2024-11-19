import React, { useState } from 'react';
import { FaCalendar } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const DateRangeSelector = ({ value, onChange }) => {
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  
  const ranges = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' },
  ];

  const handleDateRangeChange = (start, end) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
    
    if (start && end) {
      onChange('custom', { startDate: start, endDate: end });
    } else if (!start && !end) {
      onChange('month');
    }
  };

  const handleStartDateChange = (date) => {
    handleDateRangeChange(date, customEndDate);
  };

  const handleEndDateChange = (date) => {
    handleDateRangeChange(customStartDate, date);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-card">
      <div className="flex items-center space-x-2 mb-4">
        <FaCalendar className="text-primary-500" />
        <span className="font-medium">Select Date Range</span>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        {ranges.map((range) => (
          <button
            key={range.id}
            onClick={() => {
              setCustomStartDate(null);
              setCustomEndDate(null);
              onChange(range.id);
            }}
            className={`px-4 py-2 rounded-md transition-colors ${
              value === range.id
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {range.label}
          </button>
        ))}
        <div className="flex gap-2">
          <DatePicker
            selected={customStartDate}
            onChange={handleStartDateChange}
            selectsStart
            startDate={customStartDate}
            endDate={customEndDate}
            className={`px-4 py-2 rounded-md border transition-colors ${
              value === 'custom'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            placeholderText="Start Date"
            dateFormat="MMM d, yyyy"
            isClearable
            maxDate={new Date()}
          />
          <DatePicker
            selected={customEndDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={customStartDate}
            endDate={customEndDate}
            minDate={customStartDate}
            className={`px-4 py-2 rounded-md border transition-colors ${
              value === 'custom'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            placeholderText="End Date"
            dateFormat="MMM d, yyyy"
            isClearable
            maxDate={new Date()}
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangeSelector; 