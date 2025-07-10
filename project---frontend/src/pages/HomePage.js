
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../utils/constants'; 

function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuth();

  React.useEffect(() => {
    console.log("HomePage useEffect triggered:");
    console.log("  Loading:", loading);
    console.log("  Is Authenticated:", isAuthenticated);
    console.log("  User:", user);
    console.log("  Current Path:", window.location.pathname);

    
    if (!loading && isAuthenticated && user) {
      let redirectTo = '';
      if (user.role === USER_ROLES.SYSTEM_ADMINISTRATOR) {
        redirectTo = '/admin/dashboard';
      } else if (user.role === USER_ROLES.NORMAL_USER) {
        redirectTo = '/stores';
      } else if (user.role === USER_ROLES.STORE_OWNER) {
        redirectTo = '/owner/dashboard';
      } else {
        console.warn("Unknown user role detected, falling back to generic dashboard:", user.role);
        redirectTo = '/dashboard';
      }

      console.log("  Calculated Redirect To:", redirectTo);

      
      if (window.location.pathname !== redirectTo) {
        console.log(`  Navigating from ${window.location.pathname} to ${redirectTo}`);
        navigate(redirectTo, { replace: true });
      } else {
        console.log(`  Already on target path: ${redirectTo}. No navigation needed.`);
      }
    } else if (!loading && !isAuthenticated) {
      console.log("  Not authenticated and loading complete. Staying on home page or waiting for login.");
      // Optional: If you want to force unauthenticated users to '/', you can add:
      // if (window.location.pathname !== '/') {
      //   navigate('/', { replace: true });
      // }
    } else {
        console.log("  Still loading authentication state or conditions not met for redirection.");
    }
  }, [loading, isAuthenticated, user, navigate]); 
  if (loading) {
    return <div className="loading-screen">Loading application...</div>;
  }

  
  if (isAuthenticated) {
    return null; 
  }

  // If not authenticated, render the home page content for role selection
  return (
    <div className="home-page-container">
      <header className="hero-section">
        <h1>Welcome to Store Rater!</h1>
        <p>Choose your role to log in or register.</p>
        <div className="home-buttons">
          <button className="button primary large" onClick={() => navigate('/login/normal-user')}>
            Login as Normal User
          </button>
          <button className="button secondary large" onClick={() => navigate('/register/normal-user')}>
            Register as Normal User
          </button>
        </div>
      </header>

      <section className="features-section">
        <h2>Access by Role</h2>
        <div className="feature-cards-grid">
          <div className="card feature-card">
            <h3>Normal Users</h3>
            <ul>
              <li>Browse and search stores.</li>
              <li>Submit and modify ratings.</li>
              <li>Update password.</li>
            </ul>
            <button className="button small" onClick={() => navigate('/login/normal-user')}>Login</button>
            <button className="button small" onClick={() => navigate('/register/normal-user')}>Register</button>
          </div>

          <div className="card feature-card">
            <h3>Store Owners</h3>
            <ul>
              <li>View store's average rating.</li>
              <li>See who rated their store.</li>
              <li>Update password.</li>
            </ul>
            <button className="button small" onClick={() => navigate('/login/store-owner')}>Login</button>
            <button className="button small" onClick={() => navigate('/register/store-owner')}>Register</button>
          </div>

          <div className="card feature-card">
            <h3>System Administrator</h3>
            <ul>
              <li>Manage all users and stores.</li>
              <li>View system statistics.</li>
              <li>Add new users and stores.</li>
            </ul>
            <button className="button small" onClick={() => navigate('/login/admin')}>Login</button>
            <button className="button small" onClick={() => navigate('/register/admin')}>Register</button>
          </div>
        </div>
      </section>

      <footer className="footer-section">
        <p>&copy; 2025 Store Rater. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;