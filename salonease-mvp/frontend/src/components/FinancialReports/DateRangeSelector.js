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
    if (!start || !end) return;
    
    setCustomStartDate(start);
    setCustomEndDate(end);
    onChange('custom', { startDate: start, endDate: end });
  };

  const handleStartDateChange = (date) => {
    setCustomStartDate(date);
    if (customEndDate && date) {
      handleDateRangeChange(date, customEndDate);
    }
  };

  const handleEndDateChange = (date) => {
    setCustomEndDate(date);
    if (customStartDate && date) {
      handleDateRangeChange(customStartDate, date);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-card">
      <div className="flex items-center space-x-2 mb-4">
        <FaCalendar className="text-primary-500" />
        <span className="font-medium">Select Date Range</span>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="relative">
          <DatePicker
            selected={customStartDate}
            onChange={handleStartDateChange}
            selectsStart
            startDate={customStartDate}
            endDate={customEndDate}
            className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholderText="Start Date"
            dateFormat="MMM d, yyyy"
            isClearable
            maxDate={new Date()}
            popperClassName="react-datepicker-left"
            popperModifiers={[
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true
                }
              }
            ]}
          />
        </div>
        <div className="relative">
          <DatePicker
            selected={customEndDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={customStartDate}
            endDate={customEndDate}
            minDate={customStartDate}
            className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholderText="End Date"
            dateFormat="MMM d, yyyy"
            isClearable
            maxDate={new Date()}
            popperClassName="react-datepicker-right"
            popperModifiers={[
              {
                name: "preventOverflow",
                options: {
                  rootBoundary: "viewport",
                  tether: false,
                  altAxis: true
                }
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangeSelector; 