const moment = require('moment-timezone');

exports.validateDateRange = (startDate, endDate) => {
  const start = moment(startDate, 'YYYY-MM-DD', true);
  const end = moment(endDate, 'YYYY-MM-DD', true);

  if (!start.isValid() || !end.isValid()) {
    return {
      error: {
        message: 'Invalid date format. Dates must be in YYYY-MM-DD format'
      }
    };
  }

  if (end.isBefore(start)) {
    return {
      error: {
        message: 'End date must be after start date'
      }
    };
  }

  return {
    value: {
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD')
    }
  };
};
