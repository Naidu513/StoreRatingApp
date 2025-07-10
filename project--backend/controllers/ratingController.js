const db = require('../config/db');

// Normal User: Submit or update a rating for a store
const submitRating = (req, res) => {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id; // From authenticated token

    db.get('SELECT id FROM stores WHERE id = ?', [storeId], (err, store) => {
        if (err) return res.status(500).json({ message: 'Database error.', error: err.message });
        if (!store) return res.status(404).json({ message: 'Store not found.' });

        // Check if user has already rated this store
        db.get('SELECT id FROM ratings WHERE user_id = ? AND store_id = ?', [userId, storeId], (err, existingRating) => {
            if (err) return res.status(500).json({ message: 'Database error.', error: err.message });

            if (existingRating) {
                // Update existing rating
                db.run(
                    'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [rating, existingRating.id],
                    function (updateErr) {
                        if (updateErr) {
                            console.error("DB error updating rating:", updateErr.message);
                            return res.status(500).json({ message: 'Failed to update rating.', error: updateErr.message });
                        }
                        res.json({ message: 'Rating updated successfully!' });
                    }
                );
            } else {
                // Insert new rating
                db.run(
                    'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
                    [userId, storeId, rating],
                    function (insertErr) {
                        if (insertErr) {
                            console.error("DB error inserting rating:", insertErr.message);
                            return res.status(500).json({ message: 'Failed to submit rating.', error: insertErr.message });
                        }
                        res.status(201).json({ message: 'Rating submitted successfully!', ratingId: this.lastID });
                    }
                );
            }
        });
    });
};

// Get ratings for a specific store (for store detail page)
const getRatingsForStore = (req, res) => {
    const { storeId } = req.params;
    db.all(`
        SELECT 
            r.id, 
            r.rating, 
            r.created_at, 
            u.name AS user_name,
            u.email AS user_email
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        WHERE r.store_id = ?
        ORDER BY r.created_at DESC
    `, [storeId], (err, ratings) => {
        if (err) {
            console.error("DB error fetching ratings for store:", err.message);
            return res.status(500).json({ message: 'Failed to fetch ratings.', error: err.message });
        }
        res.json(ratings);
    });
};

// Get average rating for a store (can be used independently or as part of store data)
const getAverageRatingForStore = (req, res) => {
    const { storeId } = req.params;
    db.get('SELECT AVG(rating) AS average_rating FROM ratings WHERE store_id = ?', [storeId], (err, row) => {
        if (err) {
            console.error("DB error fetching average rating:", err.message);
            return res.status(500).json({ message: 'Failed to fetch average rating.', error: err.message });
        }
        res.json({ average_rating: row.average_rating ? parseFloat(row.average_rating).toFixed(1) : null });
    });
};

// Owner: Get all ratings for their stores
const getRatingsForOwnerStores = (req, res) => {
    const ownerId = req.user.id; // Authenticated owner's ID
    db.all(`
        SELECT 
            r.id, 
            r.rating, 
            r.created_at, 
            u.name AS user_name,
            u.email AS user_email,
            s.name AS store_name
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        JOIN stores s ON r.store_id = s.id
        WHERE s.owner_id = ?
        ORDER BY s.name, r.created_at DESC
    `, [ownerId], (err, ratings) => {
        if (err) {
            console.error("DB error fetching owner's store ratings:", err.message);
            return res.status(500).json({ message: "Failed to fetch ratings for your stores.", error: err.message });
        }
        res.json(ratings);
    });
};

// Admin: Delete a specific rating
const deleteRating = (req, res) => {
    const { id } = req.params; // Rating ID

    db.run('DELETE FROM ratings WHERE id = ?', [id], function (err) {
        if (err) {
            console.error("DB error deleting rating:", err.message);
            return res.status(500).json({ message: 'Failed to delete rating.', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Rating not found.' });
        }
        res.json({ message: 'Rating deleted successfully.' });
    });
};


module.exports = {
    submitRating,
    getRatingsForStore,
    getAverageRatingForStore,
    getRatingsForOwnerStores,
    deleteRating
};
// backend/controllers/ratingController.js

// Assuming your SQLite database connection (db) is available or passed in.
// Example: const db = require('../config/db'); // Adjust path as needed

// Function to check and create the ratings table
const checkAndCreateRatingsTable = (db) => { // Make sure it accepts 'db' as an argument
    const createTableSql = `
        CREATE TABLE IF NOT EXISTS ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            store_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            rating INTEGER NOT NULL, -- e.g., 1 to 5 stars
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `;
    db.run(createTableSql, (err) => {
        if (err) {
            console.error('Error creating ratings table:', err.message);
        } else {
            console.log('Ratings table checked/created.');
        }
    });
};

// --- Add your other rating controller functions below (addRating, getRatings, etc.) ---
// Example:
/*
const addRating = (req, res) => {
    // Your add rating logic here
};
*/

// Export the function(s) you want to be accessible from other files
module.exports = {
    checkAndCreateRatingsTable, // <--- IMPORTANT: This must be exported
    // If you have other controller functions, list them here.
    // addRating,
    // getRatingsByStoreId,
    // ...
};