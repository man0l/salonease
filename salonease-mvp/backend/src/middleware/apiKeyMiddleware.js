const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.MANYCHAT_API_KEY) {
    return res.status(401).json({ 
      message: 'Invalid or missing API key' 
    });
  }
  
  next();
};

module.exports = apiKeyMiddleware;