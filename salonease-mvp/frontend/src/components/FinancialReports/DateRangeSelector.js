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

  // Split ranges into two rows for mobile
  const mobileRanges = [
    ranges.slice(0, 3), // First row: Today, Week, Month
    ranges.slice(3)     // Second row: Quarter, Year
  ];

  return (
    <div className="bg-card rounded-lg border border-accent/10">
      {/* Mobile Layout */}
      <div className="p-4 md:hidden">
        <div className="space-y-2">
          {mobileRanges.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-3 gap-2">
              {row.map((range) => (
                <button
                  key={range.id}
                  onClick={() => onChange(range.id)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    value === range.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Tabs - hidden on mobile */}
      <div className="hidden md:block">
        {/* ... existing tabs code ... */}
      </div>
      
      {/* Custom Date Range */}
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <FaCalendar className="text-primary-500" />
          <span className="font-medium text-foreground">{t('reports:date_range.title')}</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              {t('reports:date_range.placeholder.start_date')}
            </label>
            <DatePicker
              selected={customStartDate}
              onChange={(date) => {
                setCustomStartDate(date);
                if (customEndDate && date) {
                  handleDateRangeChange(date, customEndDate);
                }
              }}
              selectsStart
              startDate={customStartDate}
              endDate={customEndDate}
              className="w-full px-3 py-2 bg-background border border-accent/10 rounded-md text-foreground focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholderText={t('reports:date_range.placeholder.start_date')}
              dateFormat="MM/dd/yyyy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              {t('reports:date_range.placeholder.end_date')}
            </label>
            <DatePicker
              selected={customEndDate}
              onChange={(date) => {
                setCustomEndDate(date);
                if (customStartDate && date) {
                  handleDateRangeChange(customStartDate, date);
                }
              }}
              selectsEnd
              startDate={customStartDate}
              endDate={customEndDate}
              minDate={customStartDate}
              className="w-full px-3 py-2 bg-background border border-accent/10 rounded-md text-foreground focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholderText={t('reports:date_range.placeholder.end_date')}
              dateFormat="MM/dd/yyyy"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRangeSelector; 