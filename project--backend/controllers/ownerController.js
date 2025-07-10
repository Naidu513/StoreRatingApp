
const db = require('../config/db');

const getOwnerStores = (req, res) => {
    const ownerId = req.user.id;
    const sql = `
        SELECT
            s.id,
            s.name,
            s.location,
            s.contact_email AS email,
            AVG(r.rating) AS average_rating
        FROM stores s
        LEFT JOIN ratings r ON s.id = r.store_id
        WHERE s.store_owner_id = ?
        GROUP BY s.id, s.name, s.location, s.contact_email;
    `;
    db.all(sql, [ownerId], (err, stores) => {
        if (err) {
            console.error("Error fetching owner's stores:", err.message);
            return res.status(500).json({ message: 'Failed to fetch owner stores.', error: err.message });
        }
        res.json({ stores: stores.map(store => ({
            ...store,
            average_rating: store.average_rating ? parseFloat(store.average_rating).toFixed(1) : 'N/A'
        })) });
    });
};

const getRatingsForOwnerStores = (req, res) => {
    const ownerId = req.user.id;
    const sql = `
        SELECT
            r.id AS rating_id,
            r.rating,
            r.comment,
            r.created_at,
            s.name AS store_name,
            u.name AS user_name,
            u.email AS user_email
        FROM ratings r
        JOIN stores s ON r.store_id = s.id
        JOIN users u ON r.user_id = u.id
        WHERE s.store_owner_id = ?
        ORDER BY r.created_at DESC;
    `;
    db.all(sql, [ownerId], (err, ratings) => {
        if (err) {
            console.error("Error fetching ratings for owner's stores:", err.message);
            return res.status(500).json({ message: 'Failed to fetch ratings.', error: err.message });
        }
        res.json(ratings);
    });
};

module.exports = {
    getOwnerStores,
    getRatingsForOwnerStores
};