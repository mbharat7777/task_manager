import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authCore';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Client-side validation: password minimum length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/');
    } catch (error) {
      // Prefer server-provided structured errors
      const resp = error.response?.data;
      if (resp) {
        if (resp.errors && Array.isArray(resp.errors)) {
          setError(resp.errors.join(' | '));
          return;
        }
        if (resp.message) {
          setError(resp.message);
          return;
        }
      }
      setError('Registration failed');
    }
  }; 

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="card-body">
            <h2 className="card-title text-3xl font-bold text-center justify-center mb-2">
              Create Account
            </h2>
            <p className="text-center text-base-content/60 mb-6">
              Start managing your tasks efficiently
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="alert alert-error">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Username</span>
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="input input-bordered w-full"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input input-bordered w-full"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input input-bordered w-full"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Must be at least 6 characters
                  </span>
                </label>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                >
                  Create Account
                </button>
              </div>

              <div className="text-center mt-4">
                <Link
                  to="/login"
                  className="link link-hover text-primary"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;