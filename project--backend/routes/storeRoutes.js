
const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authMiddleware = require('../middleware/authMiddleware'); 

// 1. Route for GET /api/stores (which is the root '/' relative to how it's mounted)
router.get('/', storeController.getPublicStores);

// 2. Keep the /search route if frontend might still use it, or remove if not needed.
router.get('/search', storeController.getPublicStores);

// Admin-specific routes (example, adjust as per your design)

router.post('/', authMiddleware.authenticateToken, authMiddleware.authorizeRoles(['System Administrator']), storeController.addStore);
router.put('/:id', authMiddleware.authenticateToken, authMiddleware.authorizeRoles(['System Administrator']), storeController.updateStore);
router.delete('/:id', authMiddleware.authenticateToken, authMiddleware.authorizeRoles(['System Administrator']), storeController.deleteStore);

// Other routes like getStoreById
router.get('/:id', storeController.getStoreById); 

module.exports = router;