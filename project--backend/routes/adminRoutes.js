
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController'); 
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware'); 

console.log('adminRoutes.js loaded and defining routes...');


router.get(
    '/dashboard-stats',
    authenticateToken, 
    authorizeRoles(['System Administrator']), 
    adminController.getAdminDashboardStats
);

router.get(
    '/users',
    authenticateToken, 
    authorizeRoles(['System Administrator']), 
    adminController.getAllUsers
);

router.get(
    '/stores',
    authenticateToken, 
    authorizeRoles(['System Administrator']), 
    adminController.getAllStores
);

router.delete(
    '/users/:id',
    authenticateToken, 
    authorizeRoles(['System Administrator']), 
    adminController.deleteUser
);

router.delete(
    '/stores/:id',
    authenticateToken, 
    authorizeRoles(['System Administrator']), 
    adminController.deleteStore
);

module.exports = router;