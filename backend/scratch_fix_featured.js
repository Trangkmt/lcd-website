const { getConnection } = require('./database/connection-sqlserver');

async function run() {
    try {
        const pool = await getConnection();
        console.log('Updating posts to be featured...');
        await pool.request().query('UPDATE posts SET is_featured = 1');
        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
