import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, USER_ROLES } from '../utils/constants';
import { validateName, validateEmail, validatePassword, validateAddress } from '../utils/helpers';

function AddUserPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
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

    // Client-side validation
    let validationErrors = {};
    validationErrors.name = validateName(formData.name);
    validationErrors.email = validateEmail(formData.email);
    validationErrors.password = validatePassword(formData.password);
    validationErrors.address = validateAddress(formData.address);

    const hasErrors = Object.values(validationErrors).some(err => err !== '');
    if (hasErrors) {
        // Display validation errors (you might want a more sophisticated way to show this)
        console.log("Validation Errors:", validationErrors);
        setError("Please fix the errors in the form.");
        return;
    }

    try {
      const response = await api.post(API_ENDPOINTS.ADMIN_USERS, formData);
      setMessage(response.data.message);
      setFormData({ // Clear form after successful submission
        name: '',
        email: '',
        address: '',
        password: '',
        role: USER_ROLES.NORMAL_USER
      });
      // Optionally navigate back to admin dashboard after a delay
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user. Please check your input.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Add New User</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required minLength="20" maxLength="60" />
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
        <div className="form-group">
          <label htmlFor="role">Role:</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange} required>
            {Object.values(USER_ROLES).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="button primary">Add User</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default AddUserPage;