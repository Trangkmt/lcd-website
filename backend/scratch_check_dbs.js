const { getConnection } = require('./database/connection-sqlserver');

async function run() {
    try {
        const pool = await getConnection();
        const res = await pool.request().query('SHOW DATABASES');
        console.log('Databases:', JSON.stringify(res.recordset, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
