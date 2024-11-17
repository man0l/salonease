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
