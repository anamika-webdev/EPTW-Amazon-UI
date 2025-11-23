const mysql = require('mysql2');
const logger = require('../utils/logger');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'amazon_eptw_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    logger.error('Database connection failed:', err);
    console.error('❌ Database connection failed:', err.message);
    return;
  }
  logger.info('Database connected successfully');
  console.log('✅ Database connected successfully');
  connection.release();
});

// Promisify for async/await
const promisePool = pool.promise();

module.exports = promisePool;