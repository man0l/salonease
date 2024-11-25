import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import RevenueChart from './RevenueChart';
import StaffPerformance from './StaffPerformance';
import ServiceBreakdown from './ServiceBreakdown';
import DateRangeSelector from './DateRangeSelector';
import { FaFileDownload } from 'react-icons/fa';
import useFinancialReports from '../../hooks/useFinancialReports';

const FinancialReports = () => {
  const { t } = useTranslation(['reports']);
  const { salonId } = useParams();
  const [dateRange, setDateRange] = useState('month');
  const [customRange, setCustomRange] = useState(null);
  const { 
    loading, 
    error, 
    reportData, 
    staffMetrics, 
    serviceMetrics, 
    fetchReportData,
    exportReport,
    getDateRange 
  } = useFinancialReports(salonId);

  useEffect(() => {
    fetchReportData(dateRange, customRange);
  }, [dateRange, customRange, fetchReportData]);

  const handleExport = async (format) => {
    try {
      const response = await exportReport(format, dateRange);
      
      const contentType = format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/pdf';
      const blob = new Blob([response.data], { type: contentType });
      
      const { startDate, endDate } = getDateRange(dateRange);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial-report-${startDate}-${endDate}.${format}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(t('reports:export.success', { format: format.toUpperCase() }));
    } catch (error) {
      toast.error(t('reports:export.error', { message: error.message || t('common:error.unknown') }));
    }
  };

  const handleDateRangeChange = (range, customDates = null) => {
    setDateRange(range);
    setCustomRange(customDates);
  };

  if (error) {
    return (
      <div className="text-red-500">
        {t('reports:error.loading', { message: error })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900"> {t('reports:title')} </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center px-4 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition"
          >
            <FaFileDownload className="mr-2" /> {t('reports:export.csv')}
          </button>
        </div>
      </div>

      <DateRangeSelector 
        value={dateRange} 
        onChange={handleDateRangeChange} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={reportData} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StaffPerformance data={staffMetrics} loading={loading} />
        <ServiceBreakdown data={serviceMetrics} loading={loading} />
      </div>
    </div>
  );
};

export default FinancialReports;