import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// JWT secret (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register a new user
const register = async (req, res) => {
  try {
    // Debug log: show incoming body to help diagnose 500 errors
    console.log('Register request body:', req.body);

    // Basic validation to return a clear 4xx instead of a 500 when fields are missing
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) {
      console.warn('Registration attempt with missing fields:', { username, email, hasPassword: !!password });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: username, email, and password are required',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists',
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    // Log full error for debugging (stack + message)
    console.error('Error in register controller:', error);

    // Handle duplicate key (unique index) errors from MongoDB
    if (error.name === 'MongoServerError' && error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];
      return res.status(409).json({
        success: false,
        message: `A user with that ${field} already exists`,
        field,
      });
    }

    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }

    // Fallback - include stack only in non-production for debugging
    const payload = {
      success: false,
      message: 'Error creating user',
      error: error.message,
    };
    if (process.env.NODE_ENV !== 'production') payload.stack = error.stack;
    res.status(500).json(payload);
  }
};

// Login user
const login = async (req, res) => {
  try {
    // Debug log: show incoming body to help diagnose login issues
    console.log('Login request body:', req.body);

    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.warn('Login attempt with missing fields:', { email: !!email, password: !!password });
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: User not found for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Login failed: Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);
    console.log('Login successful for user:', email);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error in login controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting user',
      error: error.message,
    });
  }
};

export {
  register,
  login,
  getCurrentUser,
};