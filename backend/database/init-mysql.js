const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { buildMySqlConfig } = require('./mysql-config');

const config = buildMySqlConfig({
    multipleStatements: true
});

const normalizeScript = (rawSql) => {
    let script = rawSql;

    script = script.replace(/^\uFEFF/, '');

    script = script
        .replace(/CREATE\s+DATABASE\s+IF\s+NOT\s+EXISTS[\s\S]*?;/i, '')
        .replace(/USE\s+MyAppDB\s*;/gi, '')
        .replace(/\bMyAppDB\./gi, '');

    return script;
};

async function initDatabase() {
    const scriptPath = path.resolve(__dirname, '../../MySql.sql');

    if (!fs.existsSync(scriptPath)) {
        throw new Error(`Không tìm thấy file script: ${scriptPath}`);
    }

    const rawScript = fs.readFileSync(scriptPath, 'utf8');
    const baseScript = normalizeScript(rawScript);

    const connection = await mysql.createConnection(config);

    try {
        console.log('🚀 Bắt đầu khởi tạo schema từ MySql.sql...');
        await connection.query(baseScript);
        console.log('✅ Khởi tạo database thành công!');
    } finally {
        await connection.end();
    }
}

initDatabase().catch((error) => {
    console.error('❌ Khởi tạo database thất bại:', error.message);
    process.exit(1);
});
