import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';

// Login components
import AdminLoginPage from './pages/Login/AdminLoginPage';
import OwnerLoginPage from './pages/Login/OwnerLoginPage';
import NormalUserLoginPage from './pages/Login/NormalUserLoginPage';

// Registration components
import NormalUserRegisterPage from './pages/Register/NormalUserRegisterPage';
import AdminRegisterPage from './pages/Register/AdminRegisterPage';
import OwnerRegisterPage from './pages/Register/OwnerRegisterPage';

import StoreListPage from './pages/StoreListPage';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import AddUserPage from './pages/AddUserPage';
import AddStorePage from './pages/AddStorePage';
import './App.css';

import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import { USER_ROLES } from './utils/constants';

function App() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, loading } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/'); // Navigate to home page after logout
  };

  if (loading) {
    return <div className="loading-screen">Loading application...</div>;
  }

  return (
    <div className="App">
      <nav className="navbar">
        <Link to="/" className="nav-brand">Store Rater</Link>
        <div className="nav-links">
          {!isAuthenticated ? (
            <Link to="/" className="nav-item">Home</Link>
          ) : (
            <>
              {user.role === USER_ROLES.NORMAL_USER && <Link to="/stores" className="nav-item">Stores</Link>}
              {user.role === USER_ROLES.SYSTEM_ADMINISTRATOR && <Link to="/admin/dashboard" className="nav-item">Admin Dashboard</Link>}
              {user.role === USER_ROLES.STORE_OWNER && <Link to="/owner/dashboard" className="nav-item">Owner Dashboard</Link>}
              <Link to="/update-password" className="nav-item">Update Password</Link>
              <button onClick={handleLogout} className="nav-item logout-button">Logout</button>
            </>
          )}
        </div>
      </nav>

      <div className="content">
        <Routes>
          {/* HomePage element will handle all initial '/' logic, including redirection */}
          <Route path="/" element={<HomePage />} />

          {/* Login Routes - These should simply call context.login() */}
          <Route path="/login/admin" element={<AdminLoginPage />} />
          <Route path="/login/store-owner" element={<OwnerLoginPage />} />
          <Route path="/login/normal-user" element={<NormalUserLoginPage />} />

          {/* Registration Routes */}
          <Route path="/register/normal-user" element={<NormalUserRegisterPage />} />
          <Route path="/register/admin" element={<AdminRegisterPage />} />
          <Route path="/register/store-owner" element={<OwnerRegisterPage />} />

          {/* Protected Routes */}
          <Route path="/update-password" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.NORMAL_USER, USER_ROLES.STORE_OWNER, USER_ROLES.SYSTEM_ADMINISTRATOR]}>
              <UpdatePasswordPage />
            </ProtectedRoute>
          } />

          <Route path="/stores" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.NORMAL_USER]}>
              <StoreListPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.SYSTEM_ADMINISTRATOR]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/add-user" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.SYSTEM_ADMINISTRATOR]}>
              <AddUserPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/add-store" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.SYSTEM_ADMINISTRATOR]}>
              <AddStorePage />
            </ProtectedRoute>
          } />

          <Route path="/owner/dashboard" element={
            <ProtectedRoute allowedRoles={[USER_ROLES.STORE_OWNER]}>
              <OwnerDashboard />
            </ProtectedRoute>
          } />

          {/* Generic /dashboard route, can be a fallback */}
          <Route path="/dashboard" element={
             isAuthenticated ? (
                <div className="container">
                  <h2>Welcome to your Dashboard!</h2>
                  <p>You are logged in as a **{user?.role}**.</p>
                  <p>Please use the navigation bar above to access your specific functionalities.</p>
                </div>
              ) : <HomePage />
          } />

          {/* Catch-all for unknown routes */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;