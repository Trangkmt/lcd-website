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

module.exports = router;
