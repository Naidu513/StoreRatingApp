
import React, { createContext, useState, useContext, useEffect } from 'react';
import { USER_ROLES } from '../utils/constants'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Derived state for isAdmin, isOwner, etc.
  const isAdmin = user && user.role === USER_ROLES.SYSTEM_ADMINISTRATOR; 
  const isOwner = user && user.role === USER_ROLES.STORE_OWNER;       
  const isNormalUser = user && user.role === USER_ROLES.NORMAL_USER;   

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Error loading auth data from localStorage:", error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, userToken) => {
    console.log("AuthContext: login called with userData:", userData);
    console.log("AuthContext: login called with userToken:", userToken);

    setUser(userData);
    setToken(userToken);

    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);

    console.log("AuthContext: State after login:", { user: userData, token: userToken });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, loading, isAdmin, isOwner, isNormalUser }}> {/* <--- ADD isAdmin, isOwner, isNormalUser here */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};