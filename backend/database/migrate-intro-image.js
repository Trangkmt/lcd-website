const mysql = require('mysql2/promise');
require('dotenv').config();

const runMigration = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Running migration: Adding intro_image column to categories table...');

        // Check if column exists
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'categories' 
            AND COLUMN_NAME = 'intro_image' 
            AND TABLE_SCHEMA = '${process.env.DB_DATABASE}'
        `);

        if (columns.length === 0) {
            console.log('Column does not exist. Adding intro_image column...');
            await connection.query(`
                ALTER TABLE categories 
                ADD COLUMN intro_image VARCHAR(500) AFTER description
            `);
            console.log('✅ Column intro_image added successfully!');
        } else {
            console.log('✅ Column intro_image already exists!');
        }

        // Update sample category if needed
        console.log('Updating thuong-nien category with sample image...');
        await connection.query(`
            UPDATE categories 
            SET intro_image = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80'
            WHERE slug = 'thuong-nien'
        `);
        console.log('✅ Sample image added!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await connection.end();
        process.exit(0);
    }
};

runMigration();
