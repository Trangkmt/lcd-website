const express = require('express');
const cors = require('cors');
const { getConnection } = require('./database/connection-sqlserver.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const DB_HOST = process.env.DB_HOST || process.env.DB_SERVER || 'localhost';

// --- CẤU HÌNH MIDDLEWARE ---

// Cho phép các domain khác truy cập API (CORS)
app.use(cors());

// Giới hạn kích thước dữ liệu gửi lên là 10mb
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware ghi log các yêu cầu (Request Logging)
// Mỗi khi có ai gọi API, nó sẽ in ra: Thời gian - Phương thức (GET/POST) - Đường dẫn
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Import routes
const usersRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const postsRoutes = require('./routes/posts');
const documentsRoutes = require('./routes/documents');

const teamsRoutes = require('./routes/teams');
const contactRoutes = require('./routes/contact');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');

const uploadsRoutes = require('./routes/uploads');
const sharedFoldersRoutes = require('./routes/sharedFolders');
const postTemplatesRoutes = require('./routes/postTemplates');
const timelineRoutes = require('./routes/timeline');

/**
 * ENDPOINT KIỂM TRA SỨC KHỎE (Health Check)
 * Dùng để xem Server và Database có đang kết nối tốt không.
 */
app.get('/api/health', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT @@version as version, DATABASE() as dbname');
        res.json({
            status: 'OK',
            database: 'Connected',
            dbname: result.recordset[0].dbname,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            status: 'ERROR',
            message: err.message
        });
    }
});

// --- ĐĂNG KÝ CÁC ĐƯỜNG DẪN API (Routes) ---

app.use('/api/users', usersRoutes);       // Quản lý người dùng
app.use('/api/categories', categoriesRoutes); // Quản lý danh mục bài viết
app.use('/api/posts', postsRoutes);       // Quản lý bài viết/tin tức
app.use('/api/documents', documentsRoutes); // Quản lý tài liệu/file

app.use('/api/teams', teamsRoutes);       // Quản lý các Ban/Tổ chức
app.use('/api/contact', contactRoutes);   // Xử lý form liên hệ
app.use('/api/auth', authRoutes);         // Xử lý đăng nhập/đăng xuất
app.use('/api/ai', aiRoutes);             // Tích hợp trí tuệ nhân tạo (Gemini)

app.use('/api/uploads', uploadsRoutes);   // Xử lý upload ảnh/file
app.use('/api/shared-folders', sharedFoldersRoutes); // Thư mục chia sẻ
app.use('/api/post-templates', postTemplatesRoutes); // Mẫu bài viết có sẵn
app.use('/api/timeline', timelineRoutes); // Dòng thời gian sự kiện

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'My App API Server',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            users: '/api/users',
            categories: '/api/categories',
            posts: '/api/posts',
            documents: '/api/documents',
            
            organizations: '/api/teams',
            contact: '/api/contact',
            auth: '/api/auth',
            ai: '/api/ai',
            uploads: '/api/uploads',
            sharedFolders: '/api/shared-folders',
            postTemplates: '/api/post-templates',
            timeline: '/api/timeline'
        }
    });
});

/**
 * XỬ LÝ KHI KHÔNG TÌM THẤY ĐƯỜNG DẪN (404 Not Found)
 */
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint không tồn tại',
        path: req.path
    });
});

/**
 * XỬ LÝ LỖI TẬP TRUNG (Global Error Handler)
 * Bất kỳ lỗi nào phát sinh trong code mà không được bắt sẽ rơi vào đây.
 */
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log(`Database: ${process.env.DB_DATABASE || 'MyAppDB'}`);
    console.log(`Server: ${DB_HOST}`);
    console.log('\nAPI Endpoints:');
    console.log(`  GET  http://localhost:${PORT}/api/health`);
    console.log(`  GET  http://localhost:${PORT}/api/users`);
    console.log(`  GET  http://localhost:${PORT}/api/categories`);
    console.log(`  GET  http://localhost:${PORT}/api/posts`);
    console.log(`  GET  http://localhost:${PORT}/api/documents`);
    
    console.log(`  GET  http://localhost:${PORT}/api/teams`);
    console.log(`  GET  http://localhost:${PORT}/api/contact`);
    console.log(`  POST http://localhost:${PORT}/api/auth/login`);
    console.log(`  POST http://localhost:${PORT}/api/ai/generate-post`);
    console.log(`  POST http://localhost:${PORT}/api/uploads/image`);
    console.log(`  GET  http://localhost:${PORT}/api/shared-folders`);
    console.log(`  GET  http://localhost:${PORT}/api/post-templates`);
    console.log(`  GET  http://localhost:${PORT}/api/timeline`);
    console.log('\n');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nĐang tắt server...');
    process.exit(0);
});
