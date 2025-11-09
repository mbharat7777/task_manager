import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testConnection() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Successfully connected to MongoDB!');
    console.log('Connection Details:');
    console.log('Database Name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    await mongoose.disconnect();
    console.log('Connection closed.');
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error details:', error.message);
    if (error.message.includes('bad auth')) {
      console.log('Authentication failed - please check your username and password');
    }
    if (error.message.includes('ENOTFOUND')) {
      console.log('Could not reach the database - please check your internet connection');
    }
    if (error.message.includes('IP not whitelisted')) {
      console.log('Your IP address is not whitelisted');
      console.log('Please add your IP address in MongoDB Atlas > Network Access');
    }
  }
}

testConnection();