// This file is technically redundant if you export useAuth directly from AuthContext.js
// but can be kept for clarity or if you plan to add more auth-related custom hooks.
// For now, it just re-exports the useAuth from AuthContext.
import { useAuth } from '../context/AuthContext';
export default useAuth;

// If you want to put more complex login/logout logic here that interacts with the API
// This is where it would go. For now, the login/logout is simple state management
// and direct localStorage interaction in AuthContext.