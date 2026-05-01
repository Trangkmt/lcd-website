const { getConnection } = require('./database/connection-sqlserver');
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        const pool = await getConnection();
        const sqlFilePath = path.join(__dirname, '..', 'MySql.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        // Split by semicolon, but simple split might break on semicolons inside strings
        // However, for this seed file, most statements are clean.
        const statements = sqlContent
            .split(/;\s*$/m)
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`Executing ${statements.length} SQL statements...`);

        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            try {
                // Skip USE MyAppDB and CREATE DATABASE IF NOT EXISTS because our connection is already pooled
                if (stmt.toUpperCase().startsWith('USE ') || stmt.toUpperCase().startsWith('CREATE DATABASE ')) {
                    continue;
                }
                
                await pool.request().query(stmt);
            } catch (err) {
                console.error(`Error at statement ${i}: ${stmt.substring(0, 50)}...`);
                console.error(err.message);
            }
        }

        console.log('Seed completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Fatal error during seed:', err);
        process.exit(1);
    }
}

run();
