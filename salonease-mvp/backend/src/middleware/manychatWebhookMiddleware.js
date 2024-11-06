const crypto = require('crypto');


const manychatWebhookMiddleware = (req, res, next) => {
  const signature = req.headers['x-manychat-signature'];
  const timestamp = req.headers['x-manychat-timestamp'];
  const body = JSON.stringify(req.body);
  
  // Verify timestamp to prevent replay attacks
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) { // 5 minutes threshold
    return res.status(401).json({ message: 'Request expired' });
  }
  
  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.MANYCHAT_WEBHOOK_SECRET)
    .update(`${timestamp}.${body}`)
    .digest('hex');
    
  if (signature !== expectedSignature) {
    return res.status(401).json({ message: 'Invalid signature' });
  }
  
  next();
};

module.exports = manychatWebhookMiddleware;