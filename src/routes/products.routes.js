const express = require("express");
const { getPool } = require("../db");
const { authRequired } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { pickFields } = require("../utils/sql");

const router = express.Router();

// GET /api/products
router.get("/", authRequired, async (req, res) => {
  try {
    const pool = getPool();
    const { q, active } = req.query;

    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];
    let idx = 1;

    if (active !== undefined) {
      sql += ` AND is_active = $${idx++}`;
      params.push(active === "true");
    }

    if (q) {
      sql += ` AND (name ILIKE $${idx} OR sku ILIKE $${idx + 1})`;
      params.push(`%${q}%`, `%${q}%`);
      idx += 2;
    }

    sql += " ORDER BY created_at DESC";
    const result = await pool.query(sql, params);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/products/:id
router.get("/:id", authRequired, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ message: "Product not found" });
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/products (admin)
router.post("/", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const pool = getPool();
    const { sku, name, description, unit_cost, reorder_level, on_hand, is_active } = req.body;

    if (!sku || !name) return res.status(400).json({ message: "sku and name are required" });

    const result = await pool.query(
      `INSERT INTO products (sku, name, description, unit_cost, reorder_level, on_hand, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        sku,
        name,
        description ?? null,
        Number(unit_cost ?? 0),
        Number(reorder_level ?? 0),
        Number(on_hand ?? 0),
        is_active === undefined ? true : Boolean(is_active),
      ]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (String(err.message).includes("unique") || String(err.code) === "23505") {
      return res.status(409).json({ message: "SKU already exists" });
    }
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/products/:id (admin)
router.put("/:id", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const pool = getPool();
    const allowed = ["sku", "name", "description", "unit_cost", "reorder_level", "on_hand", "is_active"];
    const patch = pickFields(req.body, allowed);

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ message: "No valid fields provided" });
    }

    const sets = [];
    const params = [];
    let idx = 1;
    for (const [k, v] of Object.entries(patch)) {
      sets.push(`${k} = $${idx++}`);
      params.push(v);
    }
    params.push(req.params.id);

    const result = await pool.query(
      `UPDATE products SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`,
      params
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Product not found" });
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /api/products/:id (admin, soft delete)
router.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query(
      "UPDATE products SET is_active = false WHERE id = $1",
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Product not found" });
    return res.json({ message: "Product deactivated" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
