const { getConnection, closeConnection } = require('./connection-sqlserver');

async function testConnection() {
  console.log('🔍 Đang kiểm tra kết nối SQL Server...\n');
  
  try {
    // Kết nối
    const pool = await getConnection();
    
    // Test query
    const result = await pool.request().query('SELECT @@VERSION as version');
    console.log('📊 SQL Server Version:');
    console.log(result.recordset[0].version);
    console.log('\n✅ Kết nối thành công!\n');
    
    // Kiểm tra database
    const dbCheck = await pool.request().query(`
      SELECT 
        name as TableName,
        (SELECT COUNT(*) FROM sys.columns WHERE object_id = t.object_id) as ColumnCount
      FROM sys.tables t
      ORDER BY name
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