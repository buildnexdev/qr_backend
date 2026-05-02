import pool from '../../db.js';

function parseTags(raw) {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [];
  } catch {
    return String(raw)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code != null ? Number(row.code) : row.id,
    name: row.name,
    subtitle: row.subtitle || '',
    description: row.description || '',
    displayOrder: row.display_order != null ? String(row.display_order) : '0',
    itemsCount: Number(row.itemsCount) || 0,
    status: Boolean(row.status),
    tags: parseTags(row.tags),
  };
}

class CategoryModel {
  static async getNextCode() {
    const [rows] = await pool.query(
      'SELECT COALESCE(MAX(code), 0) + 1 AS n FROM menu_categories'
    );
    const n = rows[0]?.n;
    return n != null ? Number(n) : 1;
  }

  static async getAll() {
    const [rows] = await pool.query(`
      SELECT mc.id, mc.code, mc.name, mc.subtitle, mc.description, mc.display_order, mc.status, mc.tags,
        (SELECT COUNT(*) FROM menu m WHERE m.category = mc.name) AS itemsCount
      FROM menu_categories mc
      ORDER BY mc.code ASC, mc.name ASC
    `);
    return rows.map(mapRow);
  }

  static async getById(id) {
    const [rows] = await pool.query(
      `SELECT mc.id, mc.code, mc.name, mc.subtitle, mc.description, mc.display_order, mc.status, mc.tags,
        (SELECT COUNT(*) FROM menu m WHERE m.category = mc.name) AS itemsCount
       FROM menu_categories mc WHERE mc.id = ?`,
      [id]
    );
    return mapRow(rows[0]);
  }

  static async create({ name, description }) {
    const code = await CategoryModel.getNextCode();
    const tagsJson = JSON.stringify([]);
    const [result] = await pool.query(
      `INSERT INTO menu_categories (code, name, subtitle, description, display_order, status, tags)
       VALUES (?, ?, ?, ?, 0, 1, ?)`,
      [code, name, '', description || null, tagsJson]
    );
    return result.insertId;
  }

  static async updateBasics(id, { name, description }) {
    const [result] = await pool.query(
      `UPDATE menu_categories SET name = ?, description = ? WHERE id = ?`,
      [name, description || null, id]
    );
    return result.affectedRows;
  }

  static async setActive(id, active) {
    const [result] = await pool.query(
      'UPDATE menu_categories SET status = ? WHERE id = ?',
      [active ? 1 : 0, id]
    );
    return result.affectedRows;
  }

  static async deleteById(id) {
    const [result] = await pool.query('DELETE FROM menu_categories WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

export default CategoryModel;
