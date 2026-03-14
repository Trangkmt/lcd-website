const { getConnection, closeConnection } = require('./connection-sqlserver');

async function testConnection() {
  console.log('🔍 Đang kiểm tra kết nối MySQL...\n');

  try {
    const pool = await getConnection();

    const result = await pool.request().query('SELECT @@VERSION as version');
    console.log('📊 MySQL Version:');
    console.log(result.recordset[0].version);
    console.log('\n✅ Kết nối thành công!\n');

    const dbCheck = await pool.request().query(`
      SELECT 
        table_name as TableName,
        COUNT(*) as ColumnCount
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
      GROUP BY table_name
      ORDER BY table_name
    `);

    console.log('📋 Danh sách bảng trong database:');
    console.table(dbCheck.recordset);

    // Kiểm tra số lượng records
    const tables = ['users', 'categories', 'news', 'documents', 'activities', 'organizations', 'contact_info'];
    console.log('\n📊 Số lượng records:');

    for (const table of tables) {
      const count = await pool.request().query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`  - ${table}: ${count.recordset[0].count} records`);
    }

  } catch (err) {
    console.error('\n❌ Lỗi:', err.message);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

testConnection();