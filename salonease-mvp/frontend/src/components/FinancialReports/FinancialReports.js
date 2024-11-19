import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import RevenueChart from './RevenueChart';
import StaffPerformance from './StaffPerformance';
import ServiceBreakdown from './ServiceBreakdown';
import DateRangeSelector from './DateRangeSelector';
import { FaFileDownload } from 'react-icons/fa';
import useFinancialReports from '../../hooks/useFinancialReports';

const FinancialReports = () => {
  const { salonId } = useParams();
  const [dateRange, setDateRange] = useState('month');
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
    fetchReportData(dateRange);
  }, [dateRange, fetchReportData]);

  const handleExport = async (format) => {
    try {
      const response = await exportReport(format, dateRange);
      
      // For CSV, we expect text data
      const contentType = format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/pdf';
      
      // Create blob with proper encoding
      const blob = new Blob([response.data], { type: contentType });
      
      // Get date range for filename
      const { startDate, endDate } = getDateRange(dateRange);
      
      // Create and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `financial-report-${startDate}-${endDate}.${format}`);
      
      // Clean up after download
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // Clean up the URL object
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed: ' + (error.message || 'Unknown error'));
    }
  };

  if (error) {
    return <div className="text-red-500">Error loading reports: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center px-4 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition"
          >
            <FaFileDownload className="mr-2" /> Export CSV
          </button>
        </div>
      </div>

      <DateRangeSelector value={dateRange} onChange={setDateRange} />

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