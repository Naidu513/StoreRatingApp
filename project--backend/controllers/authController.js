
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); 

const JWT_SECRET = process.env.JWT_SECRET; 

// IMPORTANT: Move isValidRole to validationMiddleware.js if it's only used by validateUserData,
// OR if used by other auth functions, define it here.
// const isValidRole = (role) => ['Normal User', 'Store Owner', 'System Administrator'].includes(role);

const registerUser = async (req, res) => {
    const { name, email, password, address, role } = req.body;

    // The role validation should primarily happen in validateUserData middleware now.
    // If you still want a fallback here, keep this, but the middleware should handle it.
    // if (role && !isValidRole(role)) {
    //     return res.status(400).json({ message: 'Invalid role provided during registration.' });
    // }
    const userRoleToStore = role || 'Normal User'; // Use provided role or default

    try {
        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                console.error("DB error checking user existence:", err.message);
                return res.status(500).json({ message: 'Database error.', error: err.message });
            }
            if (row) {
                return res.status(409).json({ message: 'User with this email already exists.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            db.run(
                'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
                [name, email, hashedPassword, address, userRoleToStore],
                function (insertErr) {
                    if (insertErr) {
                        console.error("DB error inserting user:", insertErr.message);
                        return res.status(500).json({ message: 'Failed to register user.', error: insertErr.message });
                    }
                    res.status(201).json({ message: 'User registered successfully!', userId: this.lastID });
                }
            );
        });
    } catch (error) {
        console.error("Server error during registration:", error);
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
};

const loginUser = (req, res) => {
    const { email, password, role: requestedRole } = req.body;

    db.get('SELECT id, name, email, password, role FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            console.error("DB error during login:", err.message);
            return res.status(500).json({ message: 'Database error.', error: err.message });
        }
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Helper to check if a role is valid - if only used here, define it here
        const isValidRole = (role) => ['Normal User', 'Store Owner', 'System Administrator'].includes(role);

        let finalUserRole = user.role;

        if (requestedRole && isValidRole(requestedRole)) {
            const roleHierarchy = {
                'Normal User': 1,
                'Store Owner': 2,
                'System Administrator': 3
            };

            // This logic allows a user to "upgrade" their stored role if they log in via a higher role's page.
            // Be mindful of this as it changes user data implicitly.
            // A stricter approach would be to deny login if the requestedRole does not match the user.role,
            // or if requestedRole is higher, require an admin to change it.
            if (roleHierarchy[requestedRole] > roleHierarchy[user.role]) {
                finalUserRole = requestedRole;
                db.run('UPDATE users SET role = ? WHERE id = ?', [finalUserRole, user.id], (updateErr) => {
                    if (updateErr) {
                        console.error("DB error updating user role on login:", updateErr.message);
                    } else {
                        console.log(`User ${user.id} role updated to ${finalUserRole} in DB during login.`);
                    }
                });
            } else if (requestedRole !== user.role) {
                // If the user tries to log in as a role lower than their DB role, or a side-grade,
                // and it doesn't match their DB role, deny access.
                // For example, an Admin trying to log in as a Normal User.
                return res.status(403).json({ message: `Access Denied: Please use the appropriate login for your role (${user.role}).` });
            }
        } else if (requestedRole && requestedRole !== user.role) {
             // If a role was requested but it's invalid OR it's not a higher role and doesn't match the user's role.
            return res.status(403).json({ message: `Access Denied: Please use the appropriate login for your role (${user.role}).` });
        }
        // If no role was requested, or the requested role matches the user's DB role, proceed with user.role

        const token = jwt.sign({ id: user.id, email: user.email, role: finalUserRole }, JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: 'Logged in successfully!',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: finalUserRole }
        });
    });
};

module.exports = { registerUser, loginUser };