import mongoose from 'mongoose';
import User from '../models/User';
import connectDB from './mongoose';

const userQuery = async (username: string) => {	
  await connectDB();
  const user = await User.findOne({ name: username });
  console.log('Query Result:', user);
  mongoose.connection.close();
  return user;
};

// Test function
const testUserQuery = async () => {
  await connectDB(); // Connect to the database
  const result = await userQuery('banana'); // Replace 'testuser' with the username you want to query
  console.log('Query Result:', result);
  mongoose.connection.close(); // Close the database connection
};

export default userQuery;