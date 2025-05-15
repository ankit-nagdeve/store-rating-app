// backend/db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'storeratingsdb',
  password: '1234567890', // Replace with your actual password
  port: 5432,
});

module.exports = pool;
