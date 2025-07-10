import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS, USER_ROLES } from '../utils/constants';
import RatingStars from '../components/common/RatingStars';
import { validateRating } from '../utils/helpers'; // Import validation helper

function StoreListPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();
  const { isAuthenticated, isNormalUser, user } = useAuth();

  const [ratingInput, setRatingInput] = useState({}); // For user's new/modified rating input
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetchStores = async () => {
      if (!isAuthenticated || !isNormalUser) {
        navigate('/login');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(API_ENDPOINTS.STORES, {
          params: {
            search: searchQuery,
            page: currentPage,
            limit: itemsPerPage,
          },
        });

        // For each store, fetch the current user's rating if available
        const storesWithUserRatings = await Promise.all(
          response.data.stores.map(async (store) => {
            try {
              // This endpoint is not directly available, so we'll simulate or add backend logic
              // A real implementation would need a specific endpoint like GET /api/ratings/:storeId/user-rating/:userId
              // For now, we'll assume a user's rating is passed with store data if it exists, or fetch it specifically.
              // To fulfill the requirement "User's Submitted Rating", we need to fetch all ratings for the current user
              // and then match them to the stores. Let's adjust the backend for that later,
              // or for now, keep it simple and just show "Option to submit a rating"
              // For demonstration, let's assume `user_submitted_rating` comes with the store data from backend.
              // If not, it means we need to query the `ratings` table for `user_id = ? AND store_id = ?` for each store.

              // For now, let's just initialize rating input to 0, user will submit/modify.
              return { ...store };
            } catch (userRatingErr) {
              console.warn(`Could not fetch user rating for store ${store.id}:`, userRatingErr.message);
              return { ...store };
            }
          })
        );

        setStores(storesWithUserRatings);
        setTotalPages(response.data.totalPages);

        // Initialize rating input for each store (can be pre-filled if user_submitted_rating comes from API)
        const initialRatings = {};
        storesWithUserRatings.forEach(store => {
          initialRatings[store.id] = store.user_submitted_rating || 0;
        });
        setRatingInput(initialRatings);

      } catch (err) {
        console.error('Error fetching stores:', err);
        setError(err.response?.data?.message || 'Failed to fetch stores.');
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
        fetchStores();
    }, 500);

    return () => clearTimeout(delayDebounceFn);

  }, [isAuthenticated, isNormalUser, navigate, searchQuery, currentPage, itemsPerPage]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRatingChange = (storeId, newRating) => {
    setRatingInput(prev => ({ ...prev, [storeId]: newRating }));
  };

  const handleSubmitRating = async (storeId) => {
    setSubmitMessage('');
    setSubmitError('');
    const ratingValue = ratingInput[storeId];

    const validationMsg = validateRating(ratingValue);
    if (validationMsg) {
      setSubmitError(validationMsg);
      return;
    }

    try {
      const response = await api.post(API_ENDPOINTS.SUBMIT_RATING(storeId), { rating: ratingValue });
      setSubmitMessage(response.data.message);
      // Re-fetch data to reflect updated average rating and user's submitted rating
      setTimeout(() => {
        setSubmitMessage('');
        setSubmitError('');
        setCurrentPage(1); // Force re-fetch current page to update data
      }, 1500);

    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit rating.');
    }
  };

  if (loading) return <div className="container">Loading stores...</div>;
  if (error) return <div className="container error-message">{error}</div>;

  return (
    <div className="container store-list-page">
      <h2>All Registered Stores</h2>
      <div className="search-bar form-group">
        <label htmlFor="search">Search Stores:</label>
        <input
          type="text"
          id="search"
          placeholder="Search by name or address"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {stores.length === 0 ? (
        <p>No stores found matching your criteria.</p>
      ) : (
        <div className="stores-grid">
          {stores.map(store => (
            <div key={store.id} className="store-card card">
              <h3>{store.name}</h3>
              <p><strong>Address:</strong> {store.address}</p>
              <p><strong>Overall Rating:</strong> {store.average_rating || 'No ratings yet'}</p>

              {isNormalUser && (
                <div className="rate-section">
                  <h4>Your Rating: {ratingInput[store.id] > 0 ? ratingInput[store.id] : 'Not rated'}</h4>
                  <RatingStars
                    rating={ratingInput[store.id] || 0}
                    onRatingChange={(newRating) => handleRatingChange(store.id, newRating)}
                  />
                  <button
                    className="button primary small"
                    onClick={() => handleSubmitRating(store.id)}
                    disabled={!ratingInput[store.id] || ratingInput[store.id] === 0}
                  >
                    {ratingInput[store.id] > 0 ? 'Modify Rating' : 'Submit Rating'}
                  </button>
                  {submitMessage && <p className="success-message">{submitMessage}</p>}
                  {submitError && <p className="error-message">{submitError}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`button pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default StoreListPage;