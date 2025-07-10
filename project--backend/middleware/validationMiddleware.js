const validateUserData = (req, res, next) => {
    const { name, email, password, address, role } = req.body;

    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {// backend/middleware/validationMiddleware.js
const { check, validationResult } = require('express-validator'); // If you want to use express-validator later, keep this.
                                                              // Your current validation is manual, so express-validator isn't strictly needed for validateUserData.

// Helper to check if a role is valid (optional but good practice) - Keep this here if validateUserData uses it
const isValidRole = (role) => ['Normal User', 'Store Owner', 'System Administrator'].includes(role);

const validateUserData = (req, res, next) => {
    const { name, email, password, address, role } = req.body;

    // --- Validation logic for name ---
    // If it's registration, 'name' must be present. For login or update, it might be optional.
    // Assuming for registration, it's always required.
    if (req.path === '/register') { // Adjust based on your API path, or make this specific for registration validation
        if (typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ message: 'Name is required and must be a string.' });
        }
        if (name.length < 20 || name.length > 60) {
            return res.status(400).json({ message: 'Name must be between 20 and 60 characters.' });
        }
    } else if (name !== undefined) { // For update user, if name is provided, validate it
        if (typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ message: 'Name must be a non-empty string if provided.' });
        }
        if (name.length < 20 || name.length > 60) {
            return res.status(400).json({ message: 'Name must be between 20 and 60 characters if provided.' });
        }
    }


    // --- Validation logic for address ---
    if (req.path === '/register') { // Assuming for registration, it's always required.
        if (typeof address !== 'string' || address.trim().length === 0) {
            return res.status(400).json({ message: 'Address is required and must be a string.' });
        }
        if (address.length > 400) {
            return res.status(400).json({ message: 'Address must not exceed 400 characters.' });
        }
    } else if (address !== undefined) { // For update user, if address is provided, validate it
        if (typeof address !== 'string' || address.trim().length === 0) {
            return res.status(400).json({ message: 'Address must be a non-empty string if provided.' });
        }
        if (address.length > 400) {
            return res.status(400).json({ message: 'Address must not exceed 400 characters if provided.' });
        }
    }


    // --- Validation logic for email ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (req.path === '/register' || req.path === '/login') { // Email is required for both register and login
        if (typeof email !== 'string' || email.trim().length === 0) {
            return res.status(400).json({ message: 'Email is required and must be a string.' });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }
    } else if (email !== undefined) { // For update user, if email is provided, validate it
        if (typeof email !== 'string' || email.trim().length === 0) {
            return res.status(400).json({ message: 'Email must be a non-empty string if provided.' });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format if provided.' });
        }
    }


    // --- Validation logic for password ---
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,16}$)/;
    if (req.path === '/register' || req.path === '/login') { // Password is required for both register and login
        if (typeof password !== 'string' || password.trim().length === 0) {
            return res.status(400).json({ message: 'Password is required and must be a string.' });
        }
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password must be 8-16 characters long, include at least one uppercase letter and one special character.'
            });
        }
    } else if (password !== undefined) { // For update user (e.g., change password)
        if (typeof password !== 'string' || password.trim().length === 0) {
            return res.status(400).json({ message: 'Password must be a non-empty string if provided.' });
        }
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'New password must be 8-16 characters long, include at least one uppercase letter and one special character.'
            });
        }
    }


    // --- Validation logic for role ---
    const allowedRoles = ['System Administrator', 'Normal User', 'Store Owner'];
    // For registration, role is generally expected. For login, it's optional from frontend.
    if (req.path === '/register') {
        if (typeof role !== 'string' || !allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid user role provided for registration.' });
        }
    } else if (role !== undefined) { // If role is provided (e.g., from a specific login page), validate it
        if (typeof role !== 'string' || !allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid user role provided.' });
        }
    }

    next();
};

const validateStoreData = (req, res, next) => {
    const { name, email, address } = req.body;

    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ message: 'Store Name is required and must be a string.' });
        }
    } else {
        return res.status(400).json({ message: 'Store Name is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email !== undefined) {
        if (typeof email !== 'string' || email.trim().length === 0) {
            return res.status(400).json({ message: 'Store Email is required and must be a string.' });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid store email format.' });
        }
    } else {
        return res.status(400).json({ message: 'Store Email is required.' });
    }

    if (address !== undefined) {
        if (typeof address !== 'string' || address.trim().length === 0) {
            return res.status(400).json({ message: 'Store Address is required and must be a string.' });
        }
        if (address.length > 400) {
            return res.status(400).json({ message: 'Store Address must not exceed 400 characters.' });
        }
    } else {
        return res.status(400).json({ message: 'Store Address is required.' });
    }

    next();
};

const validateRatingData = (req, res, next) => {
    const { rating } = req.body;

    if (rating === undefined || rating === null) {
        return res.status(400).json({ message: 'Rating is required.' });
    }
    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
    }

    next();
};

module.exports = { validateUserData, validateStoreData, validateRatingData };
            return res.status(400).json({ message: 'Name is required and must be a string.' });
        }
        if (name.length < 20 || name.length > 60) {
            return res.status(400).json({ message: 'Name must be between 20 and 60 characters.' });
        }
    }

    if (address !== undefined) {
        if (typeof address !== 'string' || address.trim().length === 0) {
            return res.status(400).json({ message: 'Address is required and must be a string.' });
        }
        if (address.length > 400) {
            return res.status(400).json({ message: 'Address must not exceed 400 characters.' });
        }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email !== undefined) {
        if (typeof email !== 'string' || email.trim().length === 0) {
            return res.status(400).json({ message: 'Email is required and must be a string.' });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,16}$)/;
    if (password !== undefined) {
        if (typeof password !== 'string' || password.trim().length === 0) {
            return res.status(400).json({ message: 'Password is required and must be a string.' });
        }
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password must be 8-16 characters long, include at least one uppercase letter and one special character.'
            });
        }
    }

    const allowedRoles = ['System Administrator', 'Normal User', 'Store Owner'];
    if (role !== undefined) {
        if (typeof role !== 'string' || !allowedRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid user role provided.' });
        }
    }

    next();
};

const validateStoreData = (req, res, next) => {
    const { name, email, address } = req.body;

    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ message: 'Store Name is required and must be a string.' });
        }
    } else {
        return res.status(400).json({ message: 'Store Name is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email !== undefined) {
        if (typeof email !== 'string' || email.trim().length === 0) {
            return res.status(400).json({ message: 'Store Email is required and must be a string.' });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid store email format.' });
        }
    } else {
        return res.status(400).json({ message: 'Store Email is required.' });
    }

    if (address !== undefined) {
        if (typeof address !== 'string' || address.trim().length === 0) {
            return res.status(400).json({ message: 'Store Address is required and must be a string.' });
        }
        if (address.length > 400) {
            return res.status(400).json({ message: 'Store Address must not exceed 400 characters.' });
        }
    } else {
        return res.status(400).json({ message: 'Store Address is required.' });
    }

    next();
};

const validateRatingData = (req, res, next) => {
    const { rating } = req.body;

    if (rating === undefined || rating === null) {
        return res.status(400).json({ message: 'Rating is required.' });
    }
    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ message: 'Rating must be a number between 1 and 5.' });
    }

    next();
};


module.exports = { validateUserData, validateStoreData, validateRatingData };