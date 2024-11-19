const FinancialReportService = require('../services/FinancialReportService');
const { validateDateRange } = require('../validators/reportValidator');

exports.getRevenueReport = async (req, res) => {
  try {
      const { salonId } = req.params;
      const { startDate, endDate, groupBy = 'day', includeComparison = true, timezone = 'UTC' } = req.query;

      // Validate date range
      const { error, value } = validateDateRange(startDate, endDate);
      if (error) {
        return res.status(400).json({ message: error.message });
      }

      // Generate report
      const report = await FinancialReportService.getRevenueReport(
        salonId,
        value.startDate,
        value.endDate,
    groupBy,
        timezone
      );

      res.json(report);
    } catch (error) {      
      res.status(500).json({ message: 'Error generating revenue report' });
  }
};

exports.getStaffPerformance = async (req, res) => {
  try {
    const { salonId } = req.params;
    const { startDate, endDate, timezone = 'UTC' } = req.query;

    // Validate date range
    const { error, value } = validateDateRange(startDate, endDate);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const staffMetrics = await FinancialReportService.getStaffPerformance(
      salonId,
      value.startDate,
      value.endDate,
      timezone
    );

    res.json(staffMetrics);
  } catch (error) {
    console.error('Error generating staff performance report:', error);
    res.status(500).json({ message: 'Error generating staff performance report' });
  }
};

exports.getServiceBreakdown = async (req, res) => {
  try {
    const { salonId } = req.params;
    const { startDate, endDate, timezone = 'UTC' } = req.query;

    // Validate date range
    const { error, value } = validateDateRange(startDate, endDate);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const serviceMetrics = await FinancialReportService.getServiceBreakdown(
      salonId,
      value.startDate,
      value.endDate,
      timezone
    );

    res.json(serviceMetrics);
  } catch (error) {
    console.error('Error generating service breakdown report:', error);
    res.status(500).json({ message: 'Error generating service breakdown report' });
  }
};

exports.exportReport = async (req, res) => {
  try {
    const { salonId } = req.params;
    const { startDate, endDate, format, timezone = 'UTC' } = req.query;

    // Validate date range
    const { error, value } = validateDateRange(startDate, endDate);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Get report data
    const reportData = await FinancialReportService.getReportData(
      salonId,
      value.startDate,
      value.endDate,
      timezone
    );

    if (format === 'csv') {
      const csvData = convertReportToCSV(reportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=financial-report-${value.startDate}-${value.endDate}.csv`);
      return res.send(csvData);
    }

    // Handle invalid format
    res.status(400).json({ message: 'Invalid export format' });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Error exporting report' });
  }
};

const convertReportToCSV = (reportData) => {
  const { revenue, staffMetrics, serviceMetrics } = reportData;
  
  // Revenue Section
  const revenueRows = revenue.breakdown.map(entry => ({
    date: entry.date,
    revenue: entry.revenue,
  }));

  // Staff Performance Section
  const staffRows = staffMetrics.map(staff => ({
    name: staff.name,
    appointments: staff.bookingCount || 0,
    revenue: staff.revenue || 0,
    avgRating: staff.averageRating || 'N/A'
  }));

  // Service Breakdown Section
  const serviceRows = serviceMetrics.map(service => ({
    name: service.name,
    bookings: service.bookingCount || 0,
    revenue: service.revenue || 0
  }));

  // Create CSV content
  const csvContent = [
    // Revenue Section
    'Revenue Report',
    'Date,Revenue',
    ...revenueRows.map(row => `${row.date},${row.revenue}`),
    '', // Empty line for separation

    // Staff Section
    'Staff Performance',
    'Name,Appointments,Revenue,Average Rating',
    ...staffRows.map(row => `${row.name},${row.appointments},${row.revenue},${row.avgRating}`),
    '',

    // Services Section
    'Service Breakdown',
    'Service Name,Total Bookings,Total Revenue',
    ...serviceRows.map(row => `${row.name},${row.bookings},${row.revenue}`)
  ].join('\n');

  return csvContent;
};
