const FinancialReportService = require('../services/FinancialReportService');
const { validateDateRange } = require('../validators/reportValidator');

function convertReportToCSV(reportData) {
  if (!reportData || !reportData.revenue || !reportData.staffMetrics || !reportData.serviceMetrics) {
    throw new Error('Invalid report data structure');
  }

  const rows = [];
  
  // Add headers
  rows.push(['Type', 'Metric', 'Value']);
  
  // Add revenue data
  rows.push(['Revenue', 'Total', reportData.revenue.totalRevenue]);
  
  // Add staff metrics
  reportData.staffMetrics.forEach(staff => {
    rows.push(['Staff', staff.name, staff.revenue]);
    rows.push(['Staff Bookings', staff.name, staff.bookingCount]);
  });
  
  // Add service metrics
  reportData.serviceMetrics.forEach(service => {
    rows.push(['Service', service.name, service.revenue]);
    rows.push(['Service Bookings', service.name, service.bookingCount]);
  });
  
  return rows.map(row => row.join(',')).join('\n');
}

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

    if (format !== 'csv') {
      return res.status(400).json({ message: 'Invalid export format' });
    }

    // Get report data
    const reportData = await FinancialReportService.getReportData(
      salonId,
      value.startDate,
      value.endDate,
      timezone
    );

    const csvData = convertReportToCSV(reportData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition', 
      `attachment; filename=financial-report-${value.startDate}-${value.endDate}.csv`
    );
    return res.send(csvData);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting report' });
  }
};
