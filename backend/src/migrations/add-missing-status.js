import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Note from '../models/Note.js';

dotenv.config();

const updateMissingStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all notes without a status and set them to 'pending'
    const result = await Note.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'pending' } }
    );

    console.log(`Updated ${result.modifiedCount} notes with missing status`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating notes:', error);
    process.exit(1);
  }
};

updateMissingStatus();