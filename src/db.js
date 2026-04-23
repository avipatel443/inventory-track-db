const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DB_URI,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  const client = await pool.connect();
  console.log("PostgreSQL Database connected");
  client.release();
}

function getPool() {
  return pool;
}

module.exports = { pool, initDb, getPool };
