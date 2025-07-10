
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const updatePassword = async (req, res) => {
    const { password } = req.body;
    const userId = req.user.id;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(
            'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedPassword, userId],
            function (err) {
                if (err) {
                    console.error("DB error updating password:", err.message);
                    return res.status(500).json({ message: 'Failed to update password.', error: err.message });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ message: 'User not found or password not changed.' });
                }
                res.json({ message: 'Password updated successfully.' });
            }
        );
    } catch (error) {
        console.error("Server error during password update:", error);
        res.status(500).json({ message: 'Server error during password update.', error: error.message });
    }
};

module.exports = { updatePassword };
// backend/controllers/userController.js
// ... (any other imports like db connection, bcrypt, etc.) ...

// Example of how checkAndCreateUsersTable might be defined
const checkAndCreateUsersTable = (db) => {
    const createTableSql = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            address TEXT,
            role TEXT NOT NULL DEFAULT 'Normal User'
        );
    `;
    db.run(createTableSql, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table checked/created.');
        }
    });
};


module.exports = {
    checkAndCreateUsersTable, 
    
};