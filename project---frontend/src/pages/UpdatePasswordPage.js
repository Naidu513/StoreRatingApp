import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
        setError('You are not logged in.');
        navigate('/login');
        return;
    }

    try {
      const response = await api.put('/users/update-password',
        { password }
      );
      setMessage(response.data.message);
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Update Password</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="password">New Password:</label>
          <input type="password" id="password" name="password" value={password} onChange={handlePasswordChange} required />
          <small>8-16 characters, at least one uppercase, one special character.</small>
        </div>
        <button type="submit" className="button primary">Update Password</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default UpdatePasswordPage;