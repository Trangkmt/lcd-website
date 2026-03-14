const mysql = require('mysql2/promise');
require('dotenv').config();

const buildConfig = (host) => ({
    host,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'MyAppDB'
});

async function testConnection(config) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 Test MySQL ${config.host}:${config.port}`);
    console.log(`${'='.repeat(60)}`);
    console.log('Database:', config.database);
    console.log('User:', config.user);

    let connection;
    try {
        connection = await mysql.createConnection(config);
        const [infoRows] = await connection.query('SELECT @@version as version, DATABASE() as dbname');
        const [tables] = await connection.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            ORDER BY table_name
        `);

        console.log('✅ KẾT NỐI THÀNH CÔNG!');
        console.log('\n📊 Thông tin:');
        console.log('Database:', infoRows[0].dbname);
        console.log('Version:', infoRows[0].version);
        console.log('\n📋 Số bảng:', tables.length);
        console.log('Bảng:', tables.map((table) => table.table_name).join(', '));

        return true;
    } catch (err) {
        console.log('❌ LỖI:', err.message);
        return false;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function runTests() {
    console.log('🚀 BẮT ĐẦU TEST KẾT NỐI MYSQL\n');

    const candidateHosts = [
        process.env.DB_HOST,
        process.env.DB_SERVER,
        'localhost',
        '127.0.0.1'
    ].filter(Boolean);

    const uniqueHosts = [...new Set(candidateHosts)];
    let successHost = null;

    for (const host of uniqueHosts) {
        const config = buildConfig(host);
        const success = await testConnection(config);
        if (success && !successHost) {
            successHost = host;
        }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('📝 KẾT QUẢ');
    console.log(`${'='.repeat(60)}`);

    if (successHost) {
        console.log('\n✅ CẤU HÌNH THÀNH CÔNG:', successHost);
        console.log('\n📄 Cập nhật file backend/.env:');
        console.log('─'.repeat(60));
        console.log(`DB_HOST=${successHost}`);
        console.log(`DB_PORT=${parseInt(process.env.DB_PORT, 10) || 3306}`);
        console.log(`DB_DATABASE=${process.env.DB_DATABASE || 'MyAppDB'}`);
        console.log(`DB_USER=${process.env.DB_USER || 'root'}`);
        console.log('DB_PASSWORD=your_password');
    } else {
        console.log('\n❌ KHÔNG KẾT NỐI ĐƯỢC TỚI MYSQL');
        console.log('\n💡 Hướng dẫn khắc phục:');
        console.log('1. Kiểm tra MySQL service đang chạy');
        console.log('2. Xác nhận user/password trong file .env đúng');
        console.log('3. Xác nhận database đã được tạo');
        console.log('4. Kiểm tra cổng 3306 (hoặc DB_PORT bạn cấu hình)');
    }

    console.log('\n');
}

runTests().catch(console.error);
