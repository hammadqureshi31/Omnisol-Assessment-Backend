import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_STRING);
    console.log('MongoDB connected.');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
};