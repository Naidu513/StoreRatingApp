import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Table from '../components/common/Table';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../utils/constants';
import { formatDate } from '../utils/helpers'; // Import helper for date formatting

function OwnerDashboard() {
  const [myStores, setMyStores] = useState([]);
  const [myRatings, setMyRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, isStoreOwner, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (!isAuthenticated || !isStoreOwner) {
        navigate('/login');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Fetch stores owned by the current user
        const storesResponse = await api.get(API_ENDPOINTS.OWNER_MY_STORES);
        setMyStores(storesResponse.data.stores);

        // Fetch ratings for stores owned by the current user
        const ratingsResponse = await api.get(API_ENDPOINTS.OWNER_MY_RATINGS);
        setMyRatings(ratingsResponse.data);

      } catch (err) {
        console.error('Error fetching owner data:', err);
        setError(err.response?.data?.message || 'Failed to fetch owner data.');
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, [navigate, isAuthenticated, isStoreOwner]);

  const storeColumns = [
    { header: 'ID', field: 'id' },
    { header: 'Name', field: 'name' },
    { header: 'Email', field: 'email' },
    { header: 'Address', field: 'address' },
    { header: 'Avg Rating', field: 'average_rating' },
  ];

  const ratingColumns = [
    { header: 'Store Name', field: 'store_name' },
    { header: 'Rating', field: 'rating' },
    { header: 'Rated By', field: 'user_name' },
    { header: 'User Email', field: 'user_email' },
    { header: 'Date', field: 'created_at_formatted' },
  ];

  if (loading) return <div className="container">Loading dashboard...</div>;
  if (error) return <div className="container error-message">{error}</div>;

  return (
    <div className="container owner-dashboard">
      <h2>Store Owner Dashboard</h2>

      <div className="card section-card">
        <h3>My Stores</h3>
        {myStores.length === 0 && <p>You do not currently own any stores. Please contact an administrator to get your store assigned.</p>}
        <Table data={myStores} columns={storeColumns} />
      </div>

      <div className="card section-card">
        <h3>Ratings for My Stores</h3>
        <Table
          data={myRatings.map(rating => ({
            ...rating,
            created_at_formatted: formatDate(rating.created_at) // Format date using helper
          }))}
          columns={ratingColumns}
        />
      </div>
    </div>
  );
}

export default OwnerDashboard;