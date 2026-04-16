const mysql = require("mysql2/promise");
require("dotenv").config();

// For development, use a simple in-memory store if MySQL is not available
let useMockDb = false;
let mockUsers = [];
let mockProducts = [];
let mockMovements = [];

function getDbConfig() {
  if (process.env.DB_URI) {
    const dbUrl = new URL(process.env.DB_URI);
    const sslMode = dbUrl.searchParams.get("ssl-mode");
    return {
      host: dbUrl.hostname,
      port: Number(dbUrl.port),
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.replace(/^\//, ""),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: sslMode === "REQUIRED" ? { rejectUnauthorized: false } : undefined,
    };
  }

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false }, // Aiven MySQL
  };
}

const pool = mysql.createPool(getDbConfig());

// Add this function
async function initDb() {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL Database connected");
    connection.release();
    useMockDb = false;
  } catch (err) {
    console.error("Database connection failed, using mock data:", err.message);
    console.log("⚠️  Using mock database for development");
    useMockDb = true;

    // Initialize mock data
    mockUsers = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        password_hash: '$2b$10$.KzMlpsnZKz8AwHPcj8NbeUDMiSFtp9vbdxQo1ffG1/pe1mC51jj6', // password
        role: 'admin',
        created_at: new Date()
      }
    ];

    mockProducts = [
      { id: 1, sku: 'SKU-001', name: 'Wireless Headphones', unit_cost: 99.99, reorder_level: 10, on_hand: 45, is_active: 1 },
      { id: 2, sku: 'SKU-002', name: 'Mechanical Keyboard', unit_cost: 149.99, reorder_level: 20, on_hand: 5, is_active: 1 },
      { id: 3, sku: 'SKU-003', name: 'USB-C Cable', unit_cost: 19.99, reorder_level: 50, on_hand: 120, is_active: 1 },
      { id: 4, sku: 'SKU-004', name: 'Ergonomic Mouse', unit_cost: 79.99, reorder_level: 15, on_hand: 8, is_active: 1 },
    ];
  }
}

function getPool() {
  if (useMockDb) {
    // Return a mock pool object with the query method
    return {
      query: mockQuery,
      getConnection: async () => ({ release: () => {} })
    };
  }
  return pool;
}

// Mock database functions
async function mockQuery(sql, params = []) {
  console.log('Mock query:', sql, params);

  if (sql.includes('SELECT id FROM users WHERE email = ?')) {
    const [email] = params;
    const user = mockUsers.find(u => u.email === email);
    return user ? [[{ id: user.id }]] : [[]];
  }

  if (sql.includes('SELECT id, name, email, password_hash, role FROM users WHERE email = ?')) {
    const [email] = params;
    const user = mockUsers.find(u => u.email === email);
    return user ? [[user]] : [[]];
  }

  if (sql.includes('INSERT INTO users')) {
    const [name, email, password_hash, role] = params;
    const newUser = {
      id: mockUsers.length + 1,
      name,
      email,
      password_hash,
      role: role || 'staff',
      created_at: new Date()
    };
    mockUsers.push(newUser);
    return [{ insertId: newUser.id }];
  }

  if (sql.includes('SELECT * FROM users WHERE email = ?')) {
    const [email] = params;
    const user = mockUsers.find(u => u.email === email);
    return user ? [[user]] : [[]];
  }

  if (sql.includes('SELECT * FROM products')) {
    return [mockProducts];
  }

  return [[]];
}

module.exports = { pool, initDb, getPool, useMockDb };