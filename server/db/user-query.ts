import mongoose from 'mongoose';
import User from '../models/User';
import connectDB from './mongoose';

const user_query = async (username: string) => {
  const user = await User.findOne({ name: username });
  return user;
};

// Test function
const testUserQuery = async () => {
  await connectDB(); // Connect to the database
  const result = await user_query('Test Man'); // Replace 'testuser' with the username you want to query
  console.log('Query Result:', result);
  mongoose.connection.close(); // Close the database connection
};

testUserQuery();