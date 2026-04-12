const mysql = require('mysql2/promise');
require('dotenv').config();

const runMigration = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Running migration: creating timeline_events table if missing...');

        const [tables] = await connection.query(`
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = ?
              AND TABLE_NAME = 'timeline_events'
            LIMIT 1
        `, [process.env.DB_DATABASE]);

        if (tables.length === 0) {
            await connection.query(`
                CREATE TABLE timeline_events (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    event_type ENUM('annual') NOT NULL DEFAULT 'annual',
                    month TINYINT NOT NULL,
                    event_name VARCHAR(255) NOT NULL,
                    summary TEXT,
                    sort_order INT DEFAULT 0,
                    is_published BOOLEAN DEFAULT TRUE,
                    created_by INT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    CONSTRAINT chk_timeline_month CHECK (month BETWEEN 1 AND 12),
                    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
                )
            `);

            await connection.query('CREATE INDEX idx_timeline_month_published ON timeline_events(month, is_published)');
            await connection.query('CREATE INDEX idx_timeline_sort ON timeline_events(sort_order, month)');
            console.log('✅ timeline_events table created successfully');
        } else {
            console.log('✅ timeline_events table already exists');

            const [eventTypeColumn] = await connection.query(`
                SELECT COLUMN_NAME
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = ?
                  AND TABLE_NAME = 'timeline_events'
                  AND COLUMN_NAME = 'event_type'
                LIMIT 1
            `, [process.env.DB_DATABASE]);

            if (eventTypeColumn.length === 0) {
                await connection.query(`
                    ALTER TABLE timeline_events
                    ADD COLUMN event_type ENUM('annual') NOT NULL DEFAULT 'annual' AFTER id
                `);
                console.log('✅ Added event_type column for annual-only timeline');
            }

            await connection.query(`
                UPDATE timeline_events
                SET event_type = 'annual'
                WHERE event_type IS NULL OR event_type <> 'annual'
            `);
        }

        const [seedRows] = await connection.query('SELECT COUNT(*) as total FROM timeline_events');
        const currentTotal = seedRows?.[0]?.total || 0;

        if (currentTotal === 0) {
            await connection.query(`
                INSERT INTO timeline_events (event_type, month, event_name, summary, sort_order, is_published, created_by)
                VALUES
                ('annual', 1, 'Khởi động học kỳ xuân', 'Ra quân đội ngũ cộng tác viên và triển khai kế hoạch học kỳ mới.', 1, TRUE, 1),
                ('annual', 3, 'Chuỗi workshop học thuật', 'Tổ chức chuyên đề học thuật theo nhóm công nghệ và định hướng nghề nghiệp.', 1, TRUE, 1),
                ('annual', 5, 'Chiến dịch tình nguyện', 'Các đội hình tình nguyện thực hiện hoạt động cộng đồng tại địa phương.', 1, TRUE, 1),
                ('annual', 8, 'Hackathon sinh viên FIT', 'Sân chơi công nghệ thường niên cho các đội thi liên ngành.', 1, TRUE, 1),
                ('annual', 9, 'Chào tân sinh viên', 'Sự kiện kết nối tân sinh viên với các ban chuyên môn của Liên Chi đoàn.', 1, TRUE, 1),
                ('annual', 10, 'FIT Cup', 'Giải thể thao thường niên với các nội dung thi đấu và cổ vũ tập thể.', 1, TRUE, 1),
                ('annual', 12, 'Tổng kết cuối năm', 'Tổng kết thành tích, vinh danh và công bố định hướng năm tới.', 1, TRUE, 1)
            `);
            console.log('✅ Seed timeline events inserted');
        } else {
            console.log('✅ Timeline table already has data, skip seeding');
        }
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await connection.end();
        process.exit(0);
    }
};

runMigration();
