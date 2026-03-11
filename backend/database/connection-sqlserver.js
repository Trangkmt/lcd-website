const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_DATABASE || 'MyAppDB',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERTIFICATE === 'true',
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool = null;

const getConnection = async () => {
  try {
    if (pool) {
      return pool;
    }

    pool = await sql.connect(config);
    console.log('✅ Đã kết nối SQL Server thành công!');
    return pool;
  } catch (err) {
    console.error('❌ Lỗi kết nối SQL Server:', err);
    throw err;
  }
};

const closeConnection = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('Đã đóng kết nối SQL Server');
    }
  } catch (err) {
    console.error('Lỗi khi đóng kết nối:', err);
  }
};

module.exports = {
  sql,
  getConnection,
  closeConnection,
  config
};