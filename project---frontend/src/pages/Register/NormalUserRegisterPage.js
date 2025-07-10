
import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { API_ENDPOINTS, USER_ROLES } from '../../utils/constants'; 
import { useNavigate } from 'react-router-dom';

function NormalUserRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: USER_ROLES.NORMAL_USER 
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
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
      const response = await api.post(API_ENDPOINTS.REGISTER, formData);
      setMessage(response.data.message);
      setFormData({
        name: '',
        email: '',
        password: '',
        address: '',
        role: USER_ROLES.NORMAL_USER 
      });
      // Optionally navigate to login page after successful registration
      setTimeout(() => {
        navigate('/login/normal-user');
      }, 1000); // Small delay to show message
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Register as Normal User</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required />
        </div>
        <button type="submit" className="button primary">Register</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default NormalUserRegisterPage;