import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading authentication...</div>; // Or a more elaborate loading spinner
  }

  if (!isAuthenticated) {
    // Not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Authenticated but not authorized, redirect to home or an unauthorized page
    return <Navigate to="/" replace />; // Or a specific /unauthorized page
  }

  return children;
}

export default ProtectedRoute;