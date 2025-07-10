import React from 'react';

function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  
  return (
    <div className="container">
      <h2>Your Dashboard</h2>
      {user ? (
        <p>Welcome, {user.name} ({user.role})! This is a generic dashboard. You will be redirected to a role-specific dashboard shortly.</p>
      ) : (
        <p>Please log in to view your dashboard.</p>
      )}
    </div>
  );
}

export default Dashboard;