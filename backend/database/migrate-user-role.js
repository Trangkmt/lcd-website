const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    try {
        console.log('Running migration: add contact_manager to users.role enum...');

        const [columns] = await connection.query(
            `
            SELECT COLUMN_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ?
              AND TABLE_NAME = 'users'
              AND COLUMN_NAME = 'role'
            LIMIT 1
            `,
            [process.env.DB_DATABASE]
        );

        if (columns.length === 0) {
            throw new Error("Column 'role' does not exist in table 'users'.");
        }

        const columnType = String(columns[0].COLUMN_TYPE || '').toLowerCase();
        const expectedValue = "'contact_manager'";

        if (columnType.includes('contact_manager')) {
            console.log('✅ users.role already supports contact_manager');
        } else {
            await connection.query(`
                ALTER TABLE users
                MODIFY COLUMN role ENUM('admin_full', 'utility_only', 'contact_manager', 'post_author') NOT NULL DEFAULT 'post_author'
            `);
            console.log('✅ users.role enum updated successfully');
        }

        const [legacyRows] = await connection.query(`
            SELECT COUNT(*) AS total
            FROM users
            WHERE role NOT IN ('admin_full', 'utility_only', 'contact_manager', 'post_author')
        `);

        if ((legacyRows?.[0]?.total || 0) > 0) {
            await connection.query(`
                UPDATE users
                SET role = 'post_author'
                WHERE role NOT IN ('admin_full', 'utility_only', 'contact_manager', 'post_author')
            `);
            console.log('✅ Normalized legacy role values to post_author');
        }
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exitCode = 1;
    } finally {
        await connection.end();
    }
}

runMigration();
