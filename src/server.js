require("dotenv").config({ path: "../.env" });
const bcrypt = require("bcryptjs");
const app = require("./app");
const { initDb, getPool } = require("./db");

const PORT = Number(process.env.PORT || 5000);

async function seedDemoUsers() {
  const pool = getPool();
  const hash = await bcrypt.hash("password", 10);

  const demos = [
    ["Admin User", "admin@demo.com", hash, "admin"],
    ["Staff User", "staff@demo.com", hash, "staff"],
  ];

  for (const [name, email, password_hash, role] of demos) {
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [name, email, password_hash, role]
    );
  }
  console.log("Demo users ready: admin@demo.com and staff@demo.com (password: password)");
}

async function start() {
  try {
    await initDb();
    await seedDemoUsers();
    app.listen(PORT, () => console.log(`API running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
