

const db = require('../config/db'); 

// Function to check and create the stores table
const checkAndCreateStoresTable = (db) => {
    const createTableSql = `
        CREATE TABLE IF NOT EXISTS stores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            location TEXT,
            contact_email TEXT UNIQUE,
            phone_number TEXT,
            website TEXT,
            description TEXT,
            opening_hours TEXT,
            store_owner_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (store_owner_id) REFERENCES users(id) ON DELETE SET NULL
        );
    `;
    db.run(createTableSql, (err) => {
        if (err) {
            console.error('Error creating stores table:', err.message);
        } else {
            console.log('Stores table checked/created.');
        }
    });
};


// Admin: Add a new store
const addStore = (req, res) => {
    // ADJUSTED TO USE contact_email and location consistent with other files/schema
    const { name, location, contact_email, phone_number, website, description, opening_hours, store_owner_id } = req.body;

    db.get('SELECT id FROM stores WHERE name = ? OR contact_email = ?', [name, contact_email], (err, row) => {
        if (err) {
            console.error("DB error checking existing store:", err.message);
            return res.status(500).json({ message: 'Database error.', error: err.message });
        }
        if (row) {
            return res.status(409).json({ message: 'Store with this name or contact email already exists.' });
        }

        db.run(
            'INSERT INTO stores (name, location, contact_email, phone_number, website, description, opening_hours, store_owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, location, contact_email, phone_number, website, description, opening_hours, store_owner_id || null],
            function (insertErr) {
                if (insertErr) {
                    console.error("DB error inserting store:", insertErr.message);
                    if (insertErr.message.includes('FOREIGN KEY constraint failed')) {
                        return res.status(400).json({ message: 'Invalid store owner ID provided. Owner must be an existing user.' });
                    }
                    if (insertErr.message.includes('UNIQUE constraint failed')) {
                         return res.status(409).json({ message: 'Store name or contact email already exists.' });
                    }
                    return res.status(500).json({ message: 'Failed to add store.', error: insertErr.message });
                }
                res.status(201).json({ message: 'Store added successfully!', storeId: this.lastID });
            }
        );
    });
};

// Public route / Admin / Owner: Get all stores (with optional average rating and owner info, AND user's rating)
const getAllStores = (req, res) => {
    const { search = '', sort = 'name', order = 'asc', page = 1, limit = 10, ownerId } = req.query;
    const userId = req.user ? req.user.id : null; // Get user ID from token if logged in

    let baseQuery = `
        SELECT
            s.id,
            s.name,
            s.location,       -- Changed from s.address
            s.contact_email,  -- Changed from s.email
            s.phone_number,
            s.website,
            s.description,
            s.opening_hours,
            s.store_owner_id, -- Changed from s.owner_id
            u.name AS owner_name,
            AVG(r.rating) AS average_rating
            ${userId ? `, (SELECT rating FROM ratings WHERE user_id = ${userId} AND store_id = s.id) AS user_submitted_rating` : ''}
        FROM stores s
        LEFT JOIN users u ON s.store_owner_id = u.id -- Changed from s.owner_id
        LEFT JOIN ratings r ON s.id = r.store_id
        WHERE 1=1
    `;
    const params = [];

    if (search) {
        baseQuery += ` AND (s.name LIKE ? OR s.location LIKE ? OR s.contact_email LIKE ?)`; 
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (ownerId) {
        baseQuery += ` AND s.store_owner_id = ?`; 
        params.push(ownerId);
    }

    baseQuery += ` GROUP BY s.id`;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const validSortFields = ['name', 'location', 'contact_email', 'owner_name', 'average_rating']; 
    const finalSort = validSortFields.includes(sort.toLowerCase()) ? `s.${sort.toLowerCase()}` : 's.name';
    const validOrder = ['asc', 'desc'].includes(order.toLowerCase()) ? order.toLowerCase() : 'asc';

    // Count total items
    const countParams = [...params]; // Clone params for count query
    const countQuery = `SELECT COUNT(DISTINCT s.id) AS total FROM stores s WHERE 1=1 ${search ? `AND (s.name LIKE ? OR s.location LIKE ? OR s.contact_email LIKE ?)` : ''} ${ownerId ? `AND s.store_owner_id = ?` : ''}`; // Changed

    db.get(countQuery, countParams, (err, countRow) => {
        if (err) {
            console.error("Error counting stores:", err.message);
            return res.status(500).json({ message: 'Error counting stores.', error: err.message });
        }
        const totalItems = countRow.total;
        const totalPages = Math.ceil(totalItems / limit);

        // Fetch paginated and sorted stores
        const finalQuery = `${baseQuery} ORDER BY ${finalSort} ${validOrder} LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);

        db.all(finalQuery, params, (err, stores) => {
            if (err) {
                console.error("Error fetching stores:", err.message);
                return res.status(500).json({ message: 'Error fetching stores.', error: err.message });
            }
            res.json({
                stores: stores.map(store => ({
                    ...store,
                    average_rating: store.average_rating ? parseFloat(store.average_rating).toFixed(1) : 'N/A'
                })),
                totalPages,
                currentPage: parseInt(page),
                totalItems
            });
        });
    });
};

// Admin/Owner: Get a single store by ID
const getStoreById = (req, res) => {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null; // Get user ID if logged in

    db.get(`
        SELECT
            s.id,
            s.name,
            s.location,       -- Changed from s.address
            s.contact_email,  -- Changed from s.email
            s.phone_number,
            s.website,
            s.description,
            s.opening_hours,
            s.store_owner_id, -- Changed from s.owner_id
            u.name AS owner_name,
            AVG(r.rating) AS average_rating
            ${userId ? `, (SELECT rating FROM ratings WHERE user_id = ${userId} AND store_id = s.id) AS user_submitted_rating` : ''}
        FROM stores s
        LEFT JOIN users u ON s.store_owner_id = u.id -- Changed from s.owner_id
        LEFT JOIN ratings r ON s.id = r.store_id
        WHERE s.id = ?
        GROUP BY s.id
    `, [id], (err, store) => {
        if (err) {
            console.error("DB error fetching store:", err.message);
            return res.status(500).json({ message: 'Failed to fetch store.', error: err.message });
        }
        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }
        res.json({
            ...store,
            average_rating: store.average_rating ? parseFloat(store.average_rating).toFixed(1) : 'N/A'
        });
    });
};

// Admin: Update store details
const updateStore = (req, res) => {
    const { id } = req.params;
    // ADJUSTED TO USE contact_email and location consistent with other files/schema
    const { name, location, contact_email, phone_number, website, description, opening_hours, store_owner_id } = req.body;

    let updateFields = [];
    const params = [];

    if (name) { updateFields.push('name = ?'); params.push(name); }
    if (location) { updateFields.push('location = ?'); params.push(location); } 
    if (contact_email) { updateFields.push('contact_email = ?'); params.push(contact_email); } 
    if (phone_number) { updateFields.push('phone_number = ?'); params.push(phone_number); }
    if (website) { updateFields.push('website = ?'); params.push(website); }
    if (description) { updateFields.push('description = ?'); params.push(description); }
    if (opening_hours) { updateFields.push('opening_hours = ?'); params.push(opening_hours); }

    if (store_owner_id !== undefined) {
        updateFields.push('store_owner_id = ?'); params.push(store_owner_id); 
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No fields to update.' });
    }

    params.push(id);
    const query = `UPDATE stores SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    db.run(query, params, function (err) {
        if (err) {
            console.error("DB error updating store:", err.message);
            if (err.message.includes('UNIQUE constraint failed: stores.name') || err.message.includes('UNIQUE constraint failed: stores.contact_email')) { // Changed
                return res.status(409).json({ message: 'Store with this name or contact email already exists.' });
            }
            if (err.message.includes('FOREIGN KEY constraint failed')) {
                return res.status(400).json({ message: 'Invalid owner ID provided or owner does not exist.' });
            }
            return res.status(500).json({ message: 'Failed to update store.', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Store not found or no changes made.' });
        }
        res.json({ message: 'Store updated successfully.' });
    });
};

// Admin: Delete a store
const deleteStore = (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM stores WHERE id = ?', [id], function (err) {
        if (err) {
            console.error("DB error deleting store:", err.message);
            return res.status(500).json({ message: 'Failed to delete store.', error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Store not found.' });
        }
        res.json({ message: 'Store deleted successfully.' });
    });
};

const getPublicStores = (req, res) => {
    const { search = '', page = 1, limit = 5 } = req.query;
    const offset = (page - 1) * limit;

    let whereClauses = [];
    let params = [];

    if (search) {
        whereClauses.push('(s.name LIKE ? OR s.location LIKE ? OR s.contact_email LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereSql = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    db.get(`SELECT COUNT(*) AS count FROM stores s ${whereSql}`, params, (err, countRow) => {
        if (err) {
            console.error('Error counting public stores:', err.message);
            return res.status(500).json({ message: 'Failed to fetch public stores count.' });
        }
        const totalStores = countRow.count;
        const totalPages = Math.ceil(totalStores / limit);

        const sql = `
            SELECT
                s.id,
                s.name,
                s.location,
                s.contact_email,
                s.phone_number,
                s.website,
                s.description,
                s.opening_hours,
                s.store_owner_id,
                u.name AS owner_name,
                AVG(r.rating) AS average_rating
            FROM
                stores s
            LEFT JOIN
                users u ON s.store_owner_id = u.id
            LEFT JOIN
                ratings r ON s.id = r.store_id
            ${whereSql}
            GROUP BY
                s.id, s.name, s.location, s.contact_email, s.phone_number, s.website, s.description, s.opening_hours, s.store_owner_id, owner_name
            LIMIT ? OFFSET ?
        `;
        db.all(sql, [...params, limit, offset], (err, stores) => {
            if (err) {
                console.error('Error fetching public stores data:', err.message);
                return res.status(500).json({ message: 'Failed to fetch public stores data.' });
            }
            res.json({ stores, totalStores, totalPages, currentPage: parseInt(page) });
        });
    });
};

module.exports = {
    checkAndCreateStoresTable, 
    addStore,
    getPublicStores,
    getAllStores,
    getStoreById,
    updateStore,
    deleteStore
};