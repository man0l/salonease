require('dotenv').config();

const app = require('./app');
const { connectToDatabase } = require('./config/db');
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectToDatabase();
    
    app.listen(PORT, () => {
      // We'll keep this console.log as it's useful for knowing when the server starts
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    // We'll keep this console.error as it's crucial for debugging server startup issues
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
