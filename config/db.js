const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nxg_platform');
    console.log(`[SYS] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[ERR] MongoDB Connection Failed: ${error.message}`);
  }
};

module.exports = connectDB;
