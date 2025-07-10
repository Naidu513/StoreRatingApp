const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../db/store_ratings.db'); // Point to the db folder

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        process.exit(1); // Exit if DB connection fails
    } else {
        console.log('Connected to SQLite database.');
        // Enable foreign key constraints
        db.run("PRAGMA foreign_keys = ON;", (pragmaErr) => {
            if (pragmaErr) {
                console.error("Error enabling foreign keys:", pragmaErr.message);
            } else {
                console.log("Foreign keys enabled.");
            }
        });
        initializeDatabase();
    }
});

const initializeDatabase = () => {
    db.serialize(() => {
        // Users Table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL CHECK(LENGTH(name) >= 20 AND LENGTH(name) <= 60),
                email TEXT UNIQUE NOT NULL CHECK(email LIKE '%_@__%.__%'),
                password TEXT NOT NULL,
                address TEXT NOT NULL CHECK(LENGTH(address) <= 400),
                role TEXT NOT NULL CHECK(role IN ('System Administrator', 'Normal User', 'Store Owner')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) console.error("Error creating users table:", err.message);
            else console.log("Users table checked/created.");
        });

        // Stores Table
        db.run(`
            CREATE TABLE IF NOT EXISTS stores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                location TEXT NOT NULL,
                contact_email TEXT UNIQUE,
                phone_number TEXT,
                website TEXT,
                description TEXT,
                opening_hours TEXT,
                store_owner_id INTEGER, -- Changed to allow NULL if a store can be added without an owner initially, or match your FOREIGN KEY ON DELETE SET NULL
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (store_owner_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `, (err) => {
            if (err) {
                console.error('Error creating Stores table:', err.message);
            } else {
                console.log('Stores table checked/created successfully!');
            }
        });

        // Ratings Table
        db.run(`
            CREATE TABLE IF NOT EXISTS ratings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                store_id INTEGER NOT NULL,
                rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (user_id, store_id), -- A user can only rate a store once
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) console.error("Error creating ratings table:", err.message);
            else console.log("Ratings table checked/created.");
        });


        // Indexes
        db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`);
        
        // *** IMPORTANT FIXES FOR STORES TABLE INDEXES ***
        db.run(`CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(name);`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_stores_location ON stores(location);`); // Changed from address
        db.run(`CREATE INDEX IF NOT EXISTS idx_stores_contact_email ON stores(contact_email);`); // Changed from email
        // Add an index for store_owner_id if it's frequently queried
        db.run(`CREATE INDEX IF NOT EXISTS idx_stores_store_owner_id ON stores(store_owner_id);`);


        db.run(`CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_ratings_store_id ON ratings(store_id);`);
        console.log("Database indexes checked/created.");
    });
};

module.exports = db;