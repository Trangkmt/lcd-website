const mysql = require('mysql2/promise');
require('dotenv').config();

function toArray(value) {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    return String(value)
        .split(/[,;|]/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function pickSinglePosition(value) {
    const positions = toArray(value);
    return positions[0] || 'thành viên';
}

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    try {
        console.log('Running migration: users.department_position -> JSON map by department...');

        const [columnRows] = await connection.query(
            `
            SELECT DATA_TYPE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ?
              AND TABLE_NAME = 'users'
              AND COLUMN_NAME = 'department_position'
            LIMIT 1
            `,
            [process.env.DB_DATABASE]
        );

        if (columnRows.length === 0) {
            throw new Error("Column 'department_position' does not exist in table 'users'.");
        }

        const currentDataType = String(columnRows[0].DATA_TYPE || '').toLowerCase();
        if (currentDataType !== 'text' && currentDataType !== 'longtext') {
            await connection.query('ALTER TABLE users MODIFY COLUMN department_position TEXT');
            console.log('✅ Updated users.department_position to TEXT');
        } else {
            console.log('✅ users.department_position already TEXT-compatible');
        }

        const [students] = await connection.query(`
            SELECT id, department, department_position
            FROM users
            WHERE member_type = 'student'
              AND department IS NOT NULL
              AND department_position IS NOT NULL
        `);

        let converted = 0;
        for (const student of students) {
            const rawPosition = String(student.department_position || '').trim();
            if (!rawPosition) continue;

            let isJsonMap = false;
            if (rawPosition.startsWith('{') && rawPosition.endsWith('}')) {
                try {
                    const parsed = JSON.parse(rawPosition);
                    isJsonMap = !!parsed && typeof parsed === 'object' && !Array.isArray(parsed);
                } catch (error) {
                    isJsonMap = false;
                }
            }
            if (isJsonMap) continue;

            const departments = toArray(student.department);
            if (departments.length === 0) continue;

            const singlePosition = pickSinglePosition(student.department_position);
            const nextMap = {};
            departments.forEach((department) => {
                nextMap[department] = [singlePosition];
            });

            await connection.query(
                'UPDATE users SET department_position = ? WHERE id = ?',
                [JSON.stringify(nextMap), student.id]
            );
            converted += 1;
        }

        console.log(`✅ Converted ${converted} student record(s) to JSON map format`);
        console.log('✅ Migration completed');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exitCode = 1;
    } finally {
        await connection.end();
    }
}

runMigration();
