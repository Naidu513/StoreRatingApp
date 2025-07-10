

export const USER_ROLES = {
  NORMAL_USER: 'Normal User',
  STORE_OWNER: 'Store Owner',
  SYSTEM_ADMINISTRATOR: 'System Administrator',
};

export const API_ENDPOINTS = {
  // Authentication Endpoints
  REGISTER: '/register',
  LOGIN: '/login',
  UPDATE_PASSWORD: '/update-password',

  // Admin Endpoints
  ADMIN_DASHBOARD_STATS: '/admin/dashboard-stats',
  ADMIN_USERS: '/admin/users',
  ADMIN_STORES: '/admin/stores',
  ADMIN_ADD_USER: '/admin/users',
  ADMIN_ADD_STORE: '/admin/stores',
  ADMIN_DELETE_USER: '/admin/users',
  ADMIN_DELETE_STORE: '/admin/stores',

  // Normal User Endpoints
  STORES: '/stores',
  RATINGS: '/ratings',

  // Store Owner Endpoints
  OWNER_DASHBOARD_STATS: '/owner/dashboard-stats',
  OWNER_STORES: '/owner/stores',
};


export const DASHBOARD_ROUTES = {
    NORMAL_USER: '/stores', 
    STORE_OWNER: '/owner/dashboard', 
    ADMIN: '/admin/dashboard', 
    GENERIC: '/dashboard', 
};