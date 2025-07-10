import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, USER_ROLES } from '../utils/constants';
import { validateEmail, validateAddress } from '../utils/helpers'; 

function AddStorePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: '' // Can be null, or linked to an existing Store Owner
  });
  const [storeOwners, setStoreOwners] = useState([]); // To populate owner dropdown
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch users with 'Store Owner' role to populate the dropdown
    const fetchStoreOwners = async () => {
      try {
        const response = await api.get(`${API_ENDPOINTS.ADMIN_USERS}?role=${USER_ROLES.STORE_OWNER}`);
        setStoreOwners(response.data.users);
      } catch (err) {
        console.error('Error fetching store owners:', err);
        setError('Failed to load store owners for assignment.');
      }
    };
    fetchStoreOwners();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'owner_id' && value === '' ? null : value // Handle null for owner_id
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Client-side validation
    let validationErrors = {};
    if (!formData.name || formData.name.trim() === '') {
        validationErrors.name = 'Store Name is required.';
    }
    validationErrors.email = validateEmail(formData.email);
    validationErrors.address = validateAddress(formData.address);

    const hasErrors = Object.values(validationErrors).some(err => err !== '');
    if (hasErrors) {
        console.log("Validation Errors:", validationErrors);
        setError("Please fix the errors in the form.");
        return;
    }

    try {
      const response = await api.post(API_ENDPOINTS.ADMIN_STORES, formData);
      setMessage(response.data.message);
      setFormData({ // Clear form after successful submission
        name: '',
        email: '',
        address: '',
        owner_id: ''
      });
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add store. Please check your input.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Add New Store</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="name">Store Name:</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          {error && error.includes('Name is required') && <small className="error-message">Store Name is required.</small>}
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
          <label htmlFor="owner_id">Store Owner (Optional):</label>
          <select id="owner_id" name="owner_id" value={formData.owner_id || ''} onChange={handleChange}>
            <option value="">-- Select an owner (optional) --</option>
            {storeOwners.map(owner => (
              <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>
            ))}
          </select>
          <small>Assign a user with 'Store Owner' role to this store. Leave blank if none.</small>
        </div>
        <button type="submit" className="button primary">Add Store</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default AddStorePage;