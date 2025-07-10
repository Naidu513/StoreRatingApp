import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import Table from '../components/common/Table';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS, USER_ROLES } from '../utils/constants';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useAuth();

  // Filters for User Management
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userItemsPerPage] = useState(10); // Users pagination
  const [userSortField, setUserSortField] = useState('name');
  const [userSortOrder, setUserSortOrder] = useState('asc');

  // Filters for Store Management
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [storeCurrentPage, setStoreCurrentPage] = useState(1);
  const [storeTotalPages, setStoreTotalPages] = useState(1);
  const [storeItemsPerPage] = useState(10); // Stores pagination
  const [storeSortField, setStoreSortField] = useState('name');
  const [storeSortOrder, setStoreSortOrder] = useState('asc');

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!isAuthenticated || !isAdmin) {
        navigate('/login');
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const statsResponse = await api.get(API_ENDPOINTS.ADMIN_DASHBOARD_STATS);
        setStats(statsResponse.data);

        // Fetch Users with filters and pagination
        const usersResponse = await api.get(API_ENDPOINTS.ADMIN_USERS, {
          params: {
            role: userRoleFilter,
            search: userSearchQuery,
            page: userCurrentPage,
            limit: userItemsPerPage,
            sort: userSortField,
            order: userSortOrder
          }
        });
        setUsers(usersResponse.data.users);
        setUserTotalPages(usersResponse.data.totalPages);

        // Fetch Stores with filters and pagination
        const storesResponse = await api.get(API_ENDPOINTS.ADMIN_STORES, {
            params: {
                search: storeSearchQuery,
                page: storeCurrentPage,
                limit: storeItemsPerPage,
                sort: storeSortField,
                order: storeSortOrder
            }
        });
        setStores(storesResponse.data.stores);
        setStoreTotalPages(storesResponse.data.totalPages);


      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError(err.response?.data?.message || 'Failed to fetch admin data.');
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchAdminData();
    }, 500); 

    return () => clearTimeout(delayDebounceFn);

  }, [
    navigate, isAuthenticated, isAdmin,
    userRoleFilter, userSearchQuery, userCurrentPage, userItemsPerPage, userSortField, userSortOrder,
    storeSearchQuery, storeCurrentPage, storeItemsPerPage, storeSortField, storeSortOrder
  ]);

  const userColumns = [
    { header: 'ID', field: 'id' },
    { header: 'Name', field: 'name', sortable: true },
    { header: 'Email', field: 'email', sortable: true },
    { header: 'Address', field: 'address' },
    { header: 'Role', field: 'role', sortable: true },
    { header: 'Store Rating (if owner)', field: 'avg_rating' } // This field needs to be fetched from backend for store owners
  ];

  const storeColumns = [
    { header: 'ID', field: 'id' },
    { header: 'Name', field: 'name', sortable: true },
    { header: 'Email', field: 'email' },
    { header: 'Address', field: 'address' },
    { header: 'Owner', field: 'owner_name', sortable: true },
    { header: 'Avg Rating', field: 'average_rating', sortable: true },
  ];

  const handleUserSortChange = (field, order) => {
    setUserSortField(field);
    setUserSortOrder(order);
  };

  const handleStoreSortChange = (field, order) => {
    setStoreSortField(field);
    setStoreSortOrder(order);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`${API_ENDPOINTS.ADMIN_USERS}/${userId}`);
        // Refresh data after deletion
        setUserCurrentPage(1); // Reset pagination for re-fetch
        // alert('User deleted successfully!'); // Will re-fetch anyway
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  const handleDeleteStore = async (storeId) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      try {
        await api.delete(`${API_ENDPOINTS.ADMIN_STORES}/${storeId}`);
        // Refresh data after deletion
        setStoreCurrentPage(1); // Reset pagination for re-fetch
        // alert('Store deleted successfully!'); // Will re-fetch anyway
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete store.');
      }
    }
  };

  if (loading) return <div className="container">Loading dashboard...</div>;
  if (error) return <div className="container error-message">{error}</div>;

  return (
    <div className="container admin-dashboard">
      <h2>Admin Dashboard</h2>

      <div className="stats-cards flex-container">
        {stats && (
          <>
            <div className="card stat-card flex-item">
              <h3>Total Users</h3>
              <p>{stats.totalUsers}</p>
            </div>
            <div className="card stat-card flex-item">
              <h3>Total Stores</h3>
              <p>{stats.totalStores}</p>
            </div>
            <div className="card stat-card flex-item">
              <h3>Total Ratings</h3>
              <p>{stats.totalRatings}</p>
            </div>
          </>
        )}
      </div>

      <div className="card section-card">
        <h3>User Management</h3>
        <button className="button primary" onClick={() => navigate('/admin/add-user')}>Add New User</button>
        <div className="filters-container">
            <div className="form-group">
                <label htmlFor="userSearch">Search Users:</label>
                <input
                    type="text"
                    id="userSearch"
                    placeholder="Name, Email, or Address"
                    value={userSearchQuery}
                    onChange={(e) => { setUserSearchQuery(e.target.value); setUserCurrentPage(1); }}
                />
            </div>
            <div className="form-group">
                <label htmlFor="userRoleFilter">Filter by Role:</label>
                <select id="userRoleFilter" value={userRoleFilter} onChange={(e) => { setUserRoleFilter(e.target.value); setUserCurrentPage(1); }}>
                    <option value="">All Roles</option>
                    {Object.values(USER_ROLES).map(role => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                </select>
            </div>
        </div>
        <Table
          data={users}
          columns={userColumns}
          onSortChange={handleUserSortChange}
          initialSortField={userSortField}
          initialSortOrder={userSortOrder}
          renderRowActions={(userItem) => (
            <>
              {/* Add Edit User page later */}
              <button className="button danger small" onClick={() => handleDeleteUser(userItem.id)}>Delete</button>
            </>
          )}
        />
        {userTotalPages > 1 && (
            <div className="pagination">
                {[...Array(userTotalPages)].map((_, index) => (
                    <button
                        key={index}
                        className={`button pagination-button ${userCurrentPage === index + 1 ? 'active' : ''}`}
                        onClick={() => setUserCurrentPage(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        )}
      </div>

      <div className="card section-card">
        <h3>Store Management</h3>
        <button className="button primary" onClick={() => navigate('/admin/add-store')}>Add New Store</button>
        <div className="filters-container">
            <div className="form-group">
                <label htmlFor="storeSearch">Search Stores:</label>
                <input
                    type="text"
                    id="storeSearch"
                    placeholder="Name, Email, or Address"
                    value={storeSearchQuery}
                    onChange={(e) => { setStoreSearchQuery(e.target.value); setStoreCurrentPage(1); }}
                />
            </div>
        </div>
        <Table
          data={stores}
          columns={storeColumns}
          onSortChange={handleStoreSortChange}
          initialSortField={storeSortField}
          initialSortOrder={storeSortOrder}
          renderRowActions={(storeItem) => (
            <>
              {/* Add Edit Store page later */}
              <button className="button danger small" onClick={() => handleDeleteStore(storeItem.id)}>Delete</button>
            </>
          )}
        />
        {storeTotalPages > 1 && (
            <div className="pagination">
                {[...Array(storeTotalPages)].map((_, index) => (
                    <button
                        key={index}
                        className={`button pagination-button ${storeCurrentPage === index + 1 ? 'active' : ''}`}
                        onClick={() => setStoreCurrentPage(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;