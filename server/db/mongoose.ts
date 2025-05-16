import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb+srv://aidanw26:Ghqzpm10@prototypecluster.4gxpply.mongodb.net/ptdb?retryWrites=true&w=majority&appName=ProtoTypeCluster';
    console.log('MongoDB URI:', uri); // Log the URI to verify
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error);
    process.exit(1);
  }
};

export default connectDB;