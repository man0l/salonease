import React, { useState } from 'react';
import { FaCalendar } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import { useTranslation } from 'react-i18next';
import "react-datepicker/dist/react-datepicker.css";

const DateRangeSelector = ({ value, onChange }) => {
  const { t } = useTranslation(['reports']);
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  
  const ranges = [
    { id: 'today', label: t('reports:date_range.ranges.today') },
    { id: 'week', label: t('reports:date_range.ranges.week') },
    { id: 'month', label: t('reports:date_range.ranges.month') },
    { id: 'quarter', label: t('reports:date_range.ranges.quarter') },
    { id: 'year', label: t('reports:date_range.ranges.year') },
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
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <FaCalendar className="text-primary-400" />
        <span className="font-medium text-white">{t('reports:date_range.title')}</span>
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
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
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
            className="w-full px-4 py-2 rounded-md border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholderText={t('reports:date_range.placeholder.start_date')}
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
            calendarClassName="bg-gray-800 border-gray-700 text-white"
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
            className="w-full px-4 py-2 rounded-md border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholderText={t('reports:date_range.placeholder.end_date')}
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
            calendarClassName="bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangeSelector; 