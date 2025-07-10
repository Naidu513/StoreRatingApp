
import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../utils/constants';
import { validateName, validateEmail, validatePassword, validateAddress } from '../utils/helpers';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: ''
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

    // Client-side validation
    let validationErrors = {};
    validationErrors.name = validateName(formData.name);
    validationErrors.email = validateEmail(formData.email);
    validationErrors.password = validatePassword(formData.password);
    validationErrors.address = validateAddress(formData.address);

    const hasErrors = Object.values(validationErrors).some(err => err !== '');
    if (hasErrors) {
        console.log("Validation Errors:", validationErrors);
        setError("Please fix the errors in the form.");
        return;
    }

    try {
      const response = await api.post(API_ENDPOINTS.REGISTER, formData);
      setMessage(response.data.message + " You can now log in.");
      setFormData({ name: '', email: '', password: '', address: '' }); // Clear form
      // Optionally redirect to login after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Register as a Normal User</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required minLength="3" maxLength="60" />
          <small className="error-message">{validateName(formData.name)}</small>
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
          <small className="error-message">{validateEmail(formData.email)}</small>
        </div>
        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required maxLength="400" />
          <small className="error-message">{validateAddress(formData.address)}</small>
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
          <small>8-16 characters, at least one uppercase, one special character.</small>
          <small className="error-message">{validatePassword(formData.password)}</small>
        </div>
        <button type="submit" className="button primary">Register</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default RegisterPage;