const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validateRatingData } = require('../middleware/validationMiddleware');

// Normal User: Submit or update a rating
router.post('/:storeId', authenticateToken, authorizeRoles(['Normal User']), validateRatingData, ratingController.submitRating);

// Get ratings for a specific store (publicly accessible)
router.get('/:storeId', ratingController.getRatingsForStore);

// Get average rating for a specific store (publicly accessible)
router.get('/:storeId/average', ratingController.getAverageRatingForStore);

// Store Owner: Get all ratings for their stores
router.get('/owner/my-ratings', authenticateToken, authorizeRoles(['Store Owner']), ratingController.getRatingsForOwnerStores);

module.exports = router;