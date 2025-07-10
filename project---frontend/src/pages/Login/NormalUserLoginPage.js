
import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS, USER_ROLES } from '../../utils/constants'; 
import { useNavigate } from 'react-router-dom';

function NormalUserLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: USER_ROLES.NORMAL_USER 
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      // Send formData which now includes the 'role'
      const response = await api.post(API_ENDPOINTS.LOGIN, formData);
      const { token, user } = response.data;

      console.log("Login Page: Received from backend - token:", token);
      console.log("Login Page: Received from backend - user:", user);

      login(user, token);

      setMessage('Login successful. Redirecting...');
      setFormData({
          email: '',
          password: '',
          role: USER_ROLES.NORMAL_USER
      });

      setTimeout(() => {
         navigate('/', { replace: true });
      }, 100);

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login as Normal User</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <button type="submit" className="button primary">Login</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default NormalUserLoginPage;