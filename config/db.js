const mongoose = require('mongoose');

/**
 * Mongoose Connection Caching for Serverless Environments
 */
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    if (mongoose.connection.readyState === 1) {
      return cachedConnection;
    }
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nxg_platform');
    const host = conn.connection.host || conn.connection.name || 'Remote Host';
    console.log(`[SYS] MongoDB Connected: ${host}`);
    cachedConnection = conn;
    return conn;
  } catch (error) {
    console.error(`[ERR] MongoDB Connection Failed: ${error.message}`);
    // In serverless, it's often better to throw so the function retries
    throw error;
  }
};

module.exports = connectDB;
