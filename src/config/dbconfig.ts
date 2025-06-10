import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI as string;

export const connectDB = async () => {
  try {
    console.log('loaded uri =>',MONGO_URI)
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
