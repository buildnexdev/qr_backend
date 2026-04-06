import pool from '../../db.js';

function formatDate(val) {
  if (val == null) return null;
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  const s = String(val);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    category: row.category || 'General',
    quantity: Number(row.quantity),
    unit: row.unit || 'kg',
    minThreshold: Number(row.min_threshold),
    lastRestocked: formatDate(row.last_restocked),
    notes: row.notes || '',
  };
}

class StockModel {
  static async getAll() {
    const [rows] = await pool.query(
      'SELECT * FROM stock_items ORDER BY category ASC, name ASC'
    );
    return rows.map(mapRow);
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM stock_items WHERE id = ?', [id]);
    return mapRow(rows[0]);
  }

  static async create({ name, category, quantity, unit, minThreshold, lastRestocked, notes }) {
    const [result] = await pool.query(
      `INSERT INTO stock_items (name, category, quantity, unit, min_threshold, last_restocked, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        category || 'General',
        quantity ?? 0,
        unit || 'kg',
        minThreshold ?? 0,
        lastRestocked || null,
        notes || null,
      ]
    );
    return result.insertId;
  }

  static async update(id, { name, category, quantity, unit, minThreshold, lastRestocked, notes }) {
    const [result] = await pool.query(
      `UPDATE stock_items SET name = ?, category = ?, quantity = ?, unit = ?, min_threshold = ?, last_restocked = ?, notes = ?
       WHERE id = ?`,
      [
        name,
        category || 'General',
        quantity ?? 0,
        unit || 'kg',
        minThreshold ?? 0,
        lastRestocked || null,
        notes != null ? notes : null,
        id,
      ]
    );
    return result.affectedRows;
  }

  static async deleteById(id) {
    const [result] = await pool.query('DELETE FROM stock_items WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

export default StockModel;
