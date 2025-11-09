import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../lib/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('/auth/me');
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const response = await axios.post('/auth/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        console.log('Login successful');
        return response.data;
      } else {
        console.error('Login failed: No token in response');
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      console.log('Attempting registration for:', email);
      const response = await axios.post('/auth/register', {
        username,
        email,
        password,
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        console.log('Registration successful');
        return response.data;
      } else {
        console.error('Registration failed: No token in response');
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Registration failed:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};