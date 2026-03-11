const sql = require('mssql');

// Cấu hình 1: MSSQLSERVER với localhost và port 1433
const config1 = {
    server: 'localhost',
    database: 'MyAppDB',
    port: 1433,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    authentication: {
        type: 'default' // Windows Authentication
    }
};

// Cấu hình 2: Dùng dấu chấm
const config2 = {
    server: '.',
    database: 'MyAppDB',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    authentication: {
        type: 'default'
    }
};

// Cấu hình 3: Dùng 127.0.0.1
const config3 = {
    server: '127.0.0.1',
    database: 'MyAppDB',
    port: 1433,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    authentication: {
        type: 'default'
    }
};

// Cấu hình 4: Dùng localhost\\MSSQLSERVER
const config4 = {
    server: 'localhost\\MSSQLSERVER',
    database: 'MyAppDB',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    authentication: {
        type: 'default'
    }
};

async function testConnection(config, name) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 Test ${name}`);
    console.log(`${'='.repeat(60)}`);
    console.log('Server:', config.server);
    console.log('Port:', config.port || 'default');
    console.log('Database:', config.database);
    console.log('Auth:', config.authentication.type);

    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT @@VERSION as version, DB_NAME() as dbname');

        console.log('✅ KẾT NỐI THÀNH CÔNG!');
        console.log('\n📊 Thông tin:');
        console.log('Database:', result.recordset[0].dbname);
        console.log('Version:', result.recordset[0].version.split('\n')[0]);

        // Test query bảng
        const tables = await pool.request().query(`
            SELECT name FROM sys.tables ORDER BY name
        `);
        console.log('\n📋 Số bảng:', tables.recordset.length);
        console.log('Bảng:', tables.recordset.map(t => t.name).join(', '));

        await pool.close();
        return true;
    } catch (err) {
        console.log('❌ LỖI:', err.message);
        return false;
    }
}

async function runTests() {
    console.log('🚀 BẮT ĐẦU TEST KẾT NỐI SQL SERVER\n');

    const configs = [
        { config: config1, name: 'localhost:1433' },
        { config: config2, name: 'dấu chấm (.)' },
        { config: config3, name: '127.0.0.1:1433' },
        { config: config4, name: 'localhost\\MSSQLSERVER' }
    ];

    let successConfig = null;

    for (const { config, name } of configs) {
        const success = await testConnection(config, name);
        if (success && !successConfig) {
            successConfig = { config, name };
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay 1s
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('📝 KẾT QUẢ');
    console.log(`${'='.repeat(60)}`);

    if (successConfig) {
        console.log('\n✅ CẤU HÌNH THÀNH CÔNG:', successConfig.name);
        console.log('\n📄 Cập nhật file backend/.env:');
        console.log('─'.repeat(60));
        if (successConfig.config.port) {
            console.log(`DB_SERVER=${successConfig.config.server}`);
            console.log(`DB_PORT=${successConfig.config.port}`);
        } else {
            console.log(`DB_SERVER=${successConfig.config.server}`);
        }
        console.log('DB_DATABASE=MyAppDB');
        console.log('DB_TRUST_CERTIFICATE=true');
        console.log('DB_ENCRYPT=true');
    } else {
        console.log('\n❌ TẤT CẢ CẤU HÌNH ĐỀU THẤT BẠI');
        console.log('\n💡 Hướng dẫn khắc phục:');
        console.log('1. Kiểm tra SQL Server đang chạy (services.msc)');
        console.log('2. Mở SQL Server Configuration Manager');
        console.log('3. Enable TCP/IP trong Protocols for MSSQLSERVER');
        console.log('4. Restart SQL Server service');
        console.log('5. Kiểm tra port 1433 trong TCP/IP Properties');
    }

    console.log('\n');
}

runTests().catch(console.error);
