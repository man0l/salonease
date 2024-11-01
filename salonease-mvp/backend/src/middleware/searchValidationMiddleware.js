const searchValidationMiddleware = (req, res, next) => {
  const { search } = req.query;
  
  // Only validate if search parameter is provided and not empty
  if (search !== undefined && search !== '' && search.length < 3) {
    return res.status(400).json({
      message: 'Search parameter must be at least 3 characters long'
    });
  }

  next();
};

module.exports = searchValidationMiddleware; 