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

  describe('getStaffPerformance', () => {
    it('should generate staff performance report successfully', async () => {
      const mockStaffMetrics = [{
        name: 'Test Staff',
        revenue: 1000,
        bookingCount: 10,
        averageTicket: 100
      }];

      FinancialReportService.getStaffPerformance.mockResolvedValue(mockStaffMetrics);

      req.params = { salonId: 'test-salon-id' };
      req.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        timezone: 'UTC'
      };

      await reportsController.getStaffPerformance(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockStaffMetrics);
    });

    it('should handle invalid date range for staff performance', async () => {
      req.params = { salonId: 'test-salon-id' };
      req.query = {
        startDate: 'invalid-date',
        endDate: '2024-01-31'
      };

      await reportsController.getStaffPerformance(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message');
    });

    it('should handle service errors for staff performance', async () => {
      FinancialReportService.getStaffPerformance.mockRejectedValue(new Error('Service error'));

      req.params = { salonId: 'test-salon-id' };
      req.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      await reportsController.getStaffPerformance(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toHaveProperty('message', 'Error generating staff performance report');
    });
  });

  describe('getServiceBreakdown', () => {
    it('should generate service breakdown report successfully', async () => {
      const mockServiceMetrics = [{
        name: 'Test Service',
        revenue: 1000,
        bookingCount: 10,
        averageRevenue: 100
      }];

      FinancialReportService.getServiceBreakdown.mockResolvedValue(mockServiceMetrics);

      req.params = { salonId: 'test-salon-id' };
      req.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        timezone: 'UTC'
      };

      await reportsController.getServiceBreakdown(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockServiceMetrics);
    });

    it('should handle invalid date range for service breakdown', async () => {
      req.params = { salonId: 'test-salon-id' };
      req.query = {
        startDate: 'invalid-date',
        endDate: '2024-01-31'
      };

      await reportsController.getServiceBreakdown(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty('message');
    });

    it('should handle service errors for service breakdown', async () => {
      FinancialReportService.getServiceBreakdown.mockRejectedValue(new Error('Service error'));

      req.params = { salonId: 'test-salon-id' };
      req.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      await reportsController.getServiceBreakdown(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toHaveProperty('message', 'Error generating service breakdown report');
    });
  });

  describe('exportReport', () => {
    it('should export report as CSV successfully', async () => {
      const mockReportData = {
        revenue: { 
          totalRevenue: 1000 
        },
        staffMetrics: [{ 
          name: 'Staff 1', 
          revenue: 1000,
          bookingCount: 10 
        }],
        serviceMetrics: [{ 
          name: 'Service 1', 
          revenue: 1000,
          bookingCount: 5
        }]
      };

      FinancialReportService.getReportData.mockResolvedValue(mockReportData);

      req.params = { salonId: 'test-salon-id' };
      req.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        format: 'csv',
        timezone: 'UTC'
      };

      await reportsController.exportReport(req, res);

      // Verify headers
      const headers = res._getHeaders();
      expect(headers['content-type']).toBe('text/csv');
      expect(headers['content-disposition']).toMatch(
        /^attachment; filename=financial-report-.*\.csv$/
      );
      
      // Verify CSV content
      const csvData = res._getData();
      const expectedRows = [
        'Type,Metric,Value',
        'Revenue,Total,1000',
        'Staff,Staff 1,1000',
        'Staff Bookings,Staff 1,10',
        'Service,Service 1,1000',
        'Service Bookings,Service 1,5'
    ];
      
      expectedRows.forEach(row => {
        expect(csvData).toContain(row);
      });
    });

    it('should handle invalid export format', async () => {
      req.params = { salonId: 'test-salon-id' };
      req.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        format: 'invalid',
        timezone: 'UTC'
      };

      await reportsController.exportReport(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({ 
        message: 'Invalid export format' 
      });
    });

    it('should handle service errors during export', async () => {
      FinancialReportService.getReportData.mockRejectedValue(
        new Error('Export error')
      );

      req.params = { salonId: 'test-salon-id' };
      req.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        format: 'csv',
        timezone: 'UTC'
      };

      await reportsController.exportReport(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ 
        message: 'Error exporting report' 
      });
    });
  });
}); 