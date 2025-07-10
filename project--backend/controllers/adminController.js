

const db = require('../config/db'); 

// Function to get admin dashboard statistics (total users, stores, ratings)
const getAdminDashboardStats = (req, res) => {
    const stats = {};

    db.get('SELECT COUNT(*) AS totalUsers FROM users', (err, userRow) => {
        if (err) {
            console.error('Error fetching total users for admin dashboard:', err.message);
            return res.status(500).json({ message: 'Error fetching dashboard stats.' });
        }
        stats.totalUsers = userRow.totalUsers;

        db.get('SELECT COUNT(*) AS totalStores FROM stores', (err, storeRow) => {
            if (err) {
                console.error('Error fetching total stores for admin dashboard:', err.message);
                return res.status(500).json({ message: 'Error fetching dashboard stats.' });
            }
            stats.totalStores = storeRow.totalStores;

            db.get('SELECT COUNT(*) AS totalRatings FROM ratings', (err, ratingRow) => {
                if (err) {
                    console.error('Error fetching total ratings for admin dashboard:', err.message);
                    return res.status(500).json({ message: 'Error fetching dashboard stats.' });
                }
                stats.totalRatings = ratingRow.totalRatings;

                res.json({
                    message: 'Admin Dashboard Stats fetched successfully!',
                    stats: stats
                });
            });
        });
    });
};

// Function to get all users with pagination, search, filter, and sort
const getAllUsers = (req, res) => {
    const { role, search, page = 1, limit = 10, sort = 'name', order = 'asc' } = req.query;
    const offset = (page - 1) * limit;

    let whereClauses = [];
    let params = [];

    if (role) {
        whereClauses.push('role = ?');
        params.push(role);
    }
    if (search) {
        whereClauses.push('(name LIKE ? OR email LIKE ? OR address LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereSql = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';
    const orderBySql = `ORDER BY ${sort} ${order.toUpperCase()}`;

    db.get(`SELECT COUNT(*) AS count FROM users ${whereSql}`, params, (err, countRow) => {
        if (err) {
            console.error('Error counting users:', err.message);
            return res.status(500).json({ message: 'Failed to fetch users.' });
        }
        const totalUsers = countRow.count;
        const totalPages = Math.ceil(totalUsers / limit);

        db.all(`SELECT id, name, email, address, role FROM users ${whereSql} ${orderBySql} LIMIT ? OFFSET ?`, [...params, limit, offset], (err, users) => {
            if (err) {
                console.error('Error fetching users:', err.message);
                return res.status(500).json({ message: 'Failed to fetch users.' });
            }
            res.json({ users, totalUsers, totalPages, currentPage: parseInt(page) });
        });
    });
};

// Function to delete a user
const deleteUser = (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM users WHERE id = ?', id, function(err) {
        if (err) {
            console.error('Error deleting user:', err.message);
            return res.status(500).json({ message: 'Failed to delete user.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json({ message: 'User deleted successfully.' });
    });
};

// Admin: Add a new store
const addStore = (req, res) => {
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

// Admin/Owner/Normal User: Get all stores (with optional average rating and owner info, AND user's rating)
const getAllStores = (req, res) => {
    const { search = '', sort = 'name', order = 'asc', page = 1, limit = 10, ownerId } = req.query;
    const userId = req.user ? req.user.id : null;

    let baseQuery = `
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
            ${userId ? `, (SELECT rating FROM ratings WHERE user_id = ${userId} AND store_id = s.id) AS user_submitted_rating` : ''}
        FROM stores s
        LEFT JOIN users u ON s.store_owner_id = u.id
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

    const countParams = [...params];
    const countQuery = `SELECT COUNT(DISTINCT s.id) AS total FROM stores s WHERE 1=1 ${search ? `AND (s.name LIKE ? OR s.location LIKE ? OR s.contact_email LIKE ?)` : ''} ${ownerId ? `AND s.store_owner_id = ?` : ''}`;

    db.get(countQuery, countParams, (err, countRow) => {
        if (err) {
            console.error("Error counting stores (getAllStores):", err.message);
            return res.status(500).json({ message: 'Error counting stores.', error: err.message });
        }
        const totalItems = countRow.total;
        const totalPages = Math.ceil(totalItems / limit);

        const finalQuery = `${baseQuery} ORDER BY ${finalSort} ${validOrder} LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), offset);

        db.all(finalQuery, params, (err, stores) => {
            if (err) {
                console.error("Error fetching stores (getAllStores data):", err.message);
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
    const userId = req.user ? req.user.id : null;

    db.get(`
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
            ${userId ? `, (SELECT rating FROM ratings WHERE user_id = ${userId} AND store_id = s.id) AS user_submitted_rating` : ''}
        FROM stores s
        LEFT JOIN users u ON s.store_owner_id = u.id
        LEFT JOIN ratings r ON s.id = r.store_id
        WHERE s.id = ?
        GROUP BY s.id
    `, [id], (err, store) => {
        if (err) {
            console.error("DB error fetching single store:", err.message);
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
            if (err.message.includes('UNIQUE constraint failed: stores.name') || err.message.includes('UNIQUE constraint failed: stores.contact_email')) {
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


module.exports = {
    getAdminDashboardStats,
    getAllUsers,
    deleteUser,
    addStore,        
    getAllStores,    
    getStoreById,    
    updateStore,     
    deleteStore      
};