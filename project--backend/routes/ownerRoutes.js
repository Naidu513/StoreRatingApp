
const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const authMiddleware = require('../middleware/authMiddleware'); 
// Route for OWNER_MY_STORES
router.get('/stores', authMiddleware.authenticateToken, authMiddleware.authorizeRoles(['Store Owner']), ownerController.getOwnerStores);

// Route for OWNER_MY_RATINGS
router.get('/ratings', authMiddleware.authenticateToken, authMiddleware.authorizeRoles(['Store Owner']), ownerController.getRatingsForOwnerStores);

module.exports = router;