const path = require('path');
const dotenv = require('dotenv');

let envLoaded = false;

const isTruthy = (value) => ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());

const loadDbEnv = () => {
    if (envLoaded) {
        return;
    }

    dotenv.config({ path: path.resolve(__dirname, '../.env') });
    dotenv.config();
    envLoaded = true;
};

const buildMySqlConfig = ({ multipleStatements = false, includePoolOptions = false } = {}) => {
    loadDbEnv();

    const sslMode = (process.env.DB_SSL_MODE || '').toUpperCase();
    const shouldUseSsl = ['REQUIRED', 'VERIFY_CA', 'VERIFY_IDENTITY'].includes(sslMode) || isTruthy(process.env.DB_SSL);
    const shouldVerifyCertificate = ['VERIFY_CA', 'VERIFY_IDENTITY'].includes(sslMode) || isTruthy(process.env.DB_SSL_VERIFY);

    const config = {
        host: process.env.DB_HOST || process.env.DB_SERVER || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        database: process.env.DB_DATABASE || 'MyAppDB',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
        multipleStatements,
        timezone: 'Z'
    };

    if (includePoolOptions) {
        config.waitForConnections = true;
        config.connectionLimit = parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10;
        config.queueLimit = 0;
    }

    if (shouldUseSsl) {
        config.ssl = {
            rejectUnauthorized: shouldVerifyCertificate
        };

        if (process.env.DB_SSL_CA) {
            config.ssl.ca = process.env.DB_SSL_CA.replace(/\\n/g, '\n');
        }
    }

    return config;
};

module.exports = {
    loadDbEnv,
    buildMySqlConfig
};