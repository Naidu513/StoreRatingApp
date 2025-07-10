
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db'); 

const app = express();
const PORT = process.env.PORT || 5000;


const corsOptions = {
    origin: 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204, 
};
app.use(cors(corsOptions));
app.use(express.json());

// --- ROUTES ---
const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes); // This ensures /api/register and /api/login are handled correctly

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const storeRoutes = require('./routes/storeRoutes');

app.use('/api/stores', storeRoutes);

const ownerRoutes = require('./routes/ownerRoutes');
app.use('/api/owner', ownerRoutes);

// --- Import the specific table creation functions ---
const { checkAndCreateUsersTable } = require('./controllers/userController');
const { checkAndCreateStoresTable } = require('./controllers/storeController');
const { checkAndCreateRatingsTable } = require('./controllers/ratingController');

// --- FALLBACK ERROR HANDLING (optional, but good practice) ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// --- Catch-all for 404s that aren't handled by any other route ---
app.use((req, res, next) => {
    console.log(`404: No route found for ${req.method} ${req.originalUrl}`);
    res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Initialize database only once when server starts
    db.serialize(() => {
        db.run('PRAGMA foreign_keys = ON;', (err) => {
            if (err) {
                console.error("Error enabling foreign keys:", err.message);
            } else {
                console.log("Foreign keys enabled.");
            }
        });
        // Call the imported functions directly, passing the 'db' object
        checkAndCreateUsersTable(db);
        checkAndCreateStoresTable(db);
        checkAndCreateRatingsTable(db);
    });
    console.log('Connected to SQLite database.');
    console.log('Database indexes checked/created.');
});