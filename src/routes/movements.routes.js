const express = require("express");
const { getPool } = require("../db");
const { authRequired } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const router = express.Router();

// GET /api/movements
router.get("/", authRequired, async (req, res) => {
  try {
    const pool = getPool();
    const { product_id, type } = req.query;

    let sql = `
      SELECT sm.*, p.sku, p.name AS product_name, u.name AS user_name
      FROM stock_movements sm
      JOIN products p ON p.id = sm.product_id
      JOIN users u ON u.id = sm.user_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (product_id) {
      sql += ` AND sm.product_id = $${idx++}`;
      params.push(product_id);
    }
    if (type) {
      sql += ` AND sm.type = $${idx++}`;
      params.push(String(type).toUpperCase());
    }

    sql += " ORDER BY sm.created_at DESC LIMIT 500";
    const result = await pool.query(sql, params);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/movements
router.post("/", authRequired, async (req, res) => {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const { product_id, type, quantity, note, from_location, to_location } = req.body;

    if (!product_id || !type || quantity === undefined) {
      return res.status(400).json({ message: "product_id, type, quantity are required" });
    }

    const t = String(type).trim().toUpperCase();
    if (!["IN", "OUT", "ADJUST"].includes(t)) {
      return res.status(400).json({ message: "type must be IN, OUT, or ADJUST" });
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty < 0) {
      return res.status(400).json({ message: "quantity must be a non-negative integer" });
    }

    const fromLoc = from_location != null ? String(from_location).trim() : null;
    const toLoc = to_location != null ? String(to_location).trim() : null;

    if (fromLoc && fromLoc.length > 100) return res.status(400).json({ message: "from_location max length is 100" });
    if (toLoc && toLoc.length > 100) return res.status(400).json({ message: "to_location max length is 100" });

    await client.query("BEGIN");

    const prodResult = await client.query(
      "SELECT id, on_hand FROM products WHERE id = $1 FOR UPDATE",
      [product_id]
    );

    if (!prodResult.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Product not found" });
    }

    const current = Number(prodResult.rows[0].on_hand);
    let newOnHand = current;

    if (t === "IN") newOnHand = current + qty;
    if (t === "OUT") {
      newOnHand = current - qty;
      if (newOnHand < 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Insufficient stock (cannot go negative)" });
      }
    }
    if (t === "ADJUST") newOnHand = qty;

    const ins = await client.query(
      `INSERT INTO stock_movements (product_id, user_id, type, quantity, from_location, to_location, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [product_id, req.user.id, t, qty, fromLoc, toLoc, note ?? null]
    );

    await client.query("UPDATE products SET on_hand = $1 WHERE id = $2", [newOnHand, product_id]);
    await client.query("COMMIT");

    return res.status(201).json({ movement: ins.rows[0], new_on_hand: newOnHand });
  } catch (err) {
    try { await client.query("ROLLBACK"); } catch {}
    return res.status(500).json({ message: "Server error", error: err.message });
  } finally {
    client.release();
  }
});

// PUT /api/movements/:id (admin-only)
router.put("/:id", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const pool = getPool();
    const { note, from_location, to_location } = req.body;

    const fromLoc = from_location != null ? String(from_location).trim() : null;
    const toLoc = to_location != null ? String(to_location).trim() : null;

    const result = await pool.query(
      "UPDATE stock_movements SET note = $1, from_location = $2, to_location = $3 WHERE id = $4 RETURNING *",
      [note ?? null, fromLoc, toLoc, req.params.id]
    );

    if (result.rowCount === 0) return res.status(404).json({ message: "Movement not found" });
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /api/movements/:id (admin-only)
router.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query("DELETE FROM stock_movements WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Movement not found" });
    return res.json({ message: "Movement deleted (note: product stock not recalculated)" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
