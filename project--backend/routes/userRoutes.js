const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validateUserData } = require('../middleware/validationMiddleware');

router.put(
    '/update-password',
    authenticateToken,
    authorizeRoles(['Normal User', 'Store Owner', 'System Administrator']),
    validateUserData,
    userController.updatePassword
);

module.exports = router;