const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Drop the legacy email index if it exists to prevent duplicate key errors with empty emails
    try {
      const db = conn.connection.db;
      const collections = await db.listCollections({ name: 'users' }).toArray();
      if (collections.length > 0) {
        await db.collection('users').dropIndex('email_1');
        console.log('Legacy email_1 index dropped successfully');
      }
    } catch (err) {
      if (err.codeName !== 'IndexNotFound') {
        console.log('Note: email_1 index not found or already dropped');
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.json(`DB Error: ${ error.message} `);
  }
};

module.exports = connectDB;
