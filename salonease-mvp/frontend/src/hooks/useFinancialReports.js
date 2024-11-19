import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import moment from 'moment-timezone';
import { reportsApi } from '../utils/api';

const useFinancialReports = (salonId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [staffMetrics, setStaffMetrics] = useState(null);
  const [serviceMetrics, setServiceMetrics] = useState(null);

  const getDateRange = (range) => {
    const timezone = moment.tz.guess();
    const now = moment().tz(timezone);
    let startDate, endDate;

    switch (range) {
      case 'today':
        startDate = now.clone().startOf('day');
        endDate = now.clone().endOf('day');
        break;
      case 'week':
        startDate = now.clone().startOf('isoWeek');
        endDate = now.clone().endOf('isoWeek');
        break;
      case 'month':
        startDate = now.clone().startOf('month');
        endDate = now.clone().endOf('month');
        break;
      case 'quarter':
        startDate = now.clone().startOf('quarter');
        endDate = now.clone().endOf('quarter');
        break;
      case 'year':
        startDate = now.clone().startOf('year');
        endDate = now.clone().endOf('year');
        break;
      default:
        startDate = now.clone().startOf('month');
        endDate = now.clone().endOf('month');
    }

    return {
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      timezone
    };
  };

  const exportReport = async (format, dateRange) => {
    try {
      const { startDate, endDate, timezone } = getDateRange(dateRange);
      const response = await reportsApi.exportReport(salonId, {
        startDate,
        endDate,
        format,
        timezone
      });
      return response;
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to export report';
      toast.error(errorMessage);
      throw error;
    }
  };

  const fetchReportData = useCallback(async (dateRange) => {
    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate, timezone } = getDateRange(dateRange);
      const params = {
        startDate,
        endDate,
        timezone,
        groupBy: dateRange === 'today' ? 'hour' : 'day',
        includeComparison: true
      };

      const [revenueResponse, staffResponse, serviceResponse] = await Promise.all([
        reportsApi.getRevenueReport(salonId, params),
        reportsApi.getStaffPerformance(salonId, params),
        reportsApi.getServiceBreakdown(salonId, params)
      ]);

      setReportData(revenueResponse.data);
      setStaffMetrics(staffResponse.data);
      setServiceMetrics(serviceResponse.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load financial reports';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [salonId]);

  return {
    loading,
    error,
    reportData,
    staffMetrics,
    serviceMetrics,
    fetchReportData,
    exportReport,
    getDateRange
  };
};

export default useFinancialReports;