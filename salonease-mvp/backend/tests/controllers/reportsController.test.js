const reportsController = require('../../src/controllers/reportsController');
const FinancialReportService = require('../../src/services/FinancialReportService');
const httpMocks = require('node-mocks-http');

jest.mock('../../src/services/FinancialReportService');

describe('Reports Controller', () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    jest.clearAllMocks();
  });

  describe('getRevenueReport', () => {
    it('should generate revenue report successfully', async () => {
      const mockReport = {
        totalRevenue: 1000,
        periodComparison: {
          current: 1000,
          previous: 800,
          percentageChange: 25,
          trend: 'UP'
        },
        breakdown: []
      };

      FinancialReportService.getRevenueReport.mockResolvedValue(mockReport);

      req.params = { salonId: 'test-salon-id' };
      req.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        groupBy: 'day'
      };

      await reportsController.getRevenueReport(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockReport);
    });

    it('should handle invalid date range', async () => {
      req.params = { salonId: 'test-salon-id' };
      req.query = {
        startDate: 'not-a-date',
        endDate: '2024-01-31'
      };

      await reportsController.getRevenueReport(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message');
    });

    it('should handle service errors', async () => {
      FinancialReportService.getRevenueReport.mockRejectedValue(new Error('Service error'));

      req.params = { salonId: 'test-salon-id' };
      req.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      await reportsController.getRevenueReport(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toHaveProperty('message', 'Error generating revenue report');
    });
  });
}); 