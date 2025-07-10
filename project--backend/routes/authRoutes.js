
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

console.log('authRoutes.js loaded and defining routes...');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

module.exports = router;