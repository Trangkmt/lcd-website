const { getConnection } = require('./database/connection-sqlserver');

async function run() {
    const pool = await getConnection();

    async function count(table, where = '') {
        const q = `SELECT COUNT(*) as cnt FROM ${table}${where ? ' WHERE ' + where : ''}`;
        const result = await pool.request().query(q);
        return result.recordset[0]?.cnt ?? result.recordset[0]?.['COUNT(*)'] ?? '?';
    }

    console.log('=== DATABASE EVIDENCE ===');
    console.log('posts (total):', await count('posts'));
    console.log('posts (is_published=1):', await count('posts', 'is_published = 1'));
    console.log('posts (is_featured=1):', await count('posts', 'is_featured = 1'));
    console.log('posts (is_published=1 AND is_featured=1):', await count('posts', 'is_published = 1 AND is_featured = 1'));
    console.log('categories (total):', await count('categories'));
    console.log('timeline_events (total):', await count('timeline_events'));
    console.log('timeline_events (is_published=1):', await count('timeline_events', 'is_published = 1'));
    console.log('users (total):', await count('users'));
    console.log('teams (total):', await count('teams'));

    // Sample 2 posts to see actual data
    const sample = await pool.request().query('SELECT id, title, is_published, is_featured, category_id FROM posts LIMIT 3');
    console.log('\n=== SAMPLE POSTS ===');
    console.log(JSON.stringify(sample.recordset, null, 2));

    process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
