const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DB_URI,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  const client = await pool.connect();
  console.log("PostgreSQL Database connected");
  try {
    const schema = fs.readFileSync(path.join(__dirname, "../sql/schema.sql"), "utf8");
    await client.query(schema);
    console.log("Schema applied");
  } finally {
    client.release();
  }
}

function getPool() {
  return pool;
}

module.exports = { pool, initDb, getPool };
