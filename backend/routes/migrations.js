const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../database/connection-sqlserver.js');

// Migration endpoint - Add intro_image column to categories
router.post('/migrate-intro-image', async (req, res) => {
    try {
        const pool = await getConnection();

        console.log('Running migration: Adding intro_image column to categories table...');

        // For MySQL, we need to check if column exists and add it if it doesn't
        try {
            // Try to query the column - if it fails, we know it doesn't exist
            await pool.request().query('SELECT intro_image FROM categories LIMIT 1');
            console.log('Column intro_image already exists');
            return res.json({
                success: true,
                message: 'Column intro_image already exists',
                action: 'none'
            });
        } catch (colError) {
            if (colError.code === 'ER_BAD_FIELD_ERROR') {
                console.log('Column does not exist. Adding intro_image column...');

                // Add the column
                await pool.request().query(`
                    ALTER TABLE categories 
                    ADD COLUMN intro_image VARCHAR(500) AFTER description
                `);

                console.log('✅ Column intro_image added successfully!');

                // Update sample category
                await pool.request().query(`
                    UPDATE categories 
                    SET intro_image = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80'
                    WHERE slug = 'thuong-nien'
                `);

                return res.json({
                    success: true,
                    message: 'Column intro_image added successfully',
                    action: 'added'
                });
            } else {
                throw colError;
            }
        }
    } catch (error) {
        console.error('❌ Migration failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            sqlMessage: error.sqlMessage
        });
    }
});

// Migration endpoint - Add contact_manager to users.role enum
router.post('/migrate-user-role', async (req, res) => {
    try {
        const pool = await getConnection();

        console.log('Running migration: add contact_manager to users.role enum...');

        const [columns] = await pool.request().query(`
            SELECT COLUMN_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'users'
              AND COLUMN_NAME = 'role'
            LIMIT 1
        `);

        const columnType = String(columns?.[0]?.COLUMN_TYPE || '').toLowerCase();
        if (!columnType.includes('contact_manager')) {
            await pool.request().query(`
                ALTER TABLE users
                MODIFY COLUMN role ENUM('admin_full', 'utility_only', 'contact_manager', 'post_author') NOT NULL DEFAULT 'post_author'
            `);
        }

        await pool.request().query(`
            UPDATE users
            SET role = 'post_author'
            WHERE role NOT IN ('admin_full', 'utility_only', 'contact_manager', 'post_author')
        `);

        return res.json({
            success: true,
            message: 'users.role enum updated successfully',
        });
    } catch (error) {
        console.error('❌ Migration failed:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            sqlMessage: error.sqlMessage
        });
    }
});

// Migration endpoint - Add soft-delete columns to contact_info
router.post('/migrate-contact-soft-delete', async (req, res) => {
    try {
        const pool = await getConnection();
        console.log('Running migration: Adding soft-delete columns to contact_info...');

        const added = [];

        // Check and add is_deleted
        try {
            await pool.request().query('SELECT is_deleted FROM contact_info LIMIT 1');
            console.log('Column is_deleted already exists');
        } catch (e) {
            if (e.code === 'ER_BAD_FIELD_ERROR') {
                await pool.request().query(`ALTER TABLE contact_info ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0`);
                added.push('is_deleted');
                console.log('✅ Added column: is_deleted');
            } else throw e;
        }

        // Check and add deleted_by
        try {
            await pool.request().query('SELECT deleted_by FROM contact_info LIMIT 1');
            console.log('Column deleted_by already exists');
        } catch (e) {
            if (e.code === 'ER_BAD_FIELD_ERROR') {
                await pool.request().query(`ALTER TABLE contact_info ADD COLUMN deleted_by INT NULL`);
                added.push('deleted_by');
                console.log('✅ Added column: deleted_by');
            } else throw e;
        }

        // Check and add deleted_at
        try {
            await pool.request().query('SELECT deleted_at FROM contact_info LIMIT 1');
            console.log('Column deleted_at already exists');
        } catch (e) {
            if (e.code === 'ER_BAD_FIELD_ERROR') {
                await pool.request().query(`ALTER TABLE contact_info ADD COLUMN deleted_at DATETIME NULL`);
                added.push('deleted_at');
                console.log('✅ Added column: deleted_at');
            } else throw e;
        }

        return res.json({
            success: true,
            message: added.length > 0 ? `Added columns: ${added.join(', ')}` : 'All columns already exist',
            added
        });
    } catch (error) {
        console.error('❌ Migration failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Migration endpoint - Add category_id to timeline_events and link to categories
router.post('/migrate-timeline-category-link', async (req, res) => {
    try {
        const pool = await getConnection();
        console.log('Running migration: Linking timeline_events to categories...');

        // Check and add category_id
        try {
            await pool.request().query('SELECT category_id FROM timeline_events LIMIT 1');
            console.log('Column category_id already exists');
        } catch (e) {
            if (e.code === 'ER_BAD_FIELD_ERROR') {
                await pool.request().query(`ALTER TABLE timeline_events ADD COLUMN category_id INT AFTER id`);
                
                // Add foreign key constraint
                try {
                    await pool.request().query(`
                        ALTER TABLE timeline_events 
                        ADD CONSTRAINT fk_timeline_category 
                        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
                    `);
                    console.log('✅ Added foreign key constraint: fk_timeline_category');
                } catch (fkError) {
                    console.warn('⚠️ Could not add foreign key (it might already exist):', fkError.message);
                }
                
                console.log('✅ Added column: category_id');
            } else {
                throw e;
            }
        }

        // Update data based on event_name mapping to category names
        // This links existing events like 'Chào tân sinh viên K68' to 'Chào tân sinh viên'
        await pool.request().query(`
            UPDATE timeline_events t
            JOIN categories c ON c.page_type = 'event_annual' AND t.event_name LIKE CONCAT('%', c.name, '%')
            SET t.category_id = c.id
            WHERE t.category_id IS NULL
        `);

        return res.json({
            success: true,
            message: 'timeline_events updated with category_id and linked successfully'
        });
    } catch (error) {
        console.error('❌ Migration failed:', error);
        res.status(500).json({ success: false, error: error.message, sqlMessage: error.sqlMessage });
    }
});

module.exports = router;
