const express = require('express');
const cors = require('cors');
const { getConnection } = require('./database/connection-sqlserver.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const DB_HOST = process.env.DB_HOST || process.env.DB_SERVER || 'localhost';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Import routes
const usersRoutes = require('./routes/users');
const categoriesRoutes = require('./routes/categories');
const newsRoutes = require('./routes/news');
const documentsRoutes = require('./routes/documents');
const activitiesRoutes = require('./routes/activities');
const organizationsRoutes = require('./routes/organizations');
const contactRoutes = require('./routes/contact');

// Health check endpoint
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

// API Routes
app.use('/api/users', usersRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/contact', contactRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'My App API Server',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            users: '/api/users',
            categories: '/api/categories',
            news: '/api/news',
            documents: '/api/documents',
            activities: '/api/activities',
            organizations: '/api/organizations',
            contact: '/api/contact'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint không tồn tại',
        path: req.path
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    console.log(`📊 Database: ${process.env.DB_DATABASE || 'MyAppDB'}`);
    console.log(`🔗 Server: ${DB_HOST}`);
    console.log('='.repeat(60));
    console.log('\n📋 API Endpoints:');
    console.log(`  GET  http://localhost:${PORT}/api/health`);
    console.log(`  GET  http://localhost:${PORT}/api/users`);
    console.log(`  GET  http://localhost:${PORT}/api/categories`);
    console.log(`  GET  http://localhost:${PORT}/api/news`);
    console.log(`  GET  http://localhost:${PORT}/api/documents`);
    console.log(`  GET  http://localhost:${PORT}/api/activities`);
    console.log(`  GET  http://localhost:${PORT}/api/organizations`);
    console.log(`  GET  http://localhost:${PORT}/api/contact`);
    console.log('\n');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Đang tắt server...');
    process.exit(0);
});