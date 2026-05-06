const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { buildMySqlConfig } = require('./mysql-config');

async function initDb() {
    const config = buildMySqlConfig({ multipleStatements: true });
    const sqlPath = path.join(__dirname, '../../MySql.sql');
    
    if (!fs.existsSync(sqlPath)) {
        console.error('Không tìm thấy file MySql.sql tại:', sqlPath);
        process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Tách cấu hình để kết nối ban đầu (không chọn database ngay)
    const { database, ...configWithoutDb } = config;
    let connection;
    
    try {
        console.log('Đang kết nối tới MySQL...');
        connection = await mysql.createConnection(configWithoutDb);
        
        console.log(`Đảm bảo database ${database} tồn tại...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        
        await connection.query(`USE \`${database}\`;`);
        
        console.log('Đang thực thi các câu lệnh SQL từ MySql.sql...');
        await connection.query(sql);
        
        console.log('Khởi tạo cơ sở dữ liệu thành công!');
    } catch (err) {
        console.error('Lỗi khi khởi tạo cơ sở dữ liệu:', err);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initDb();
