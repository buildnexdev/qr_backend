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
    name: row.name,
    subtitle: row.subtitle || '',
    description: row.description || '',
    displayOrder: row.display_order != null ? String(row.display_order) : '',
    itemsCount: Number(row.itemsCount) || 0,
    status: Boolean(row.status),
    tags: parseTags(row.tags),
  };
}

class CategoryModel {
  static async getAll() {
    const [rows] = await pool.query(`
      SELECT mc.id, mc.name, mc.subtitle, mc.description, mc.display_order, mc.status, mc.tags,
        (SELECT COUNT(*) FROM menu m WHERE m.category = mc.name) AS itemsCount
      FROM menu_categories mc
      ORDER BY mc.display_order ASC, mc.name ASC
    `);
    return rows.map(mapRow);
  }

  static async getById(id) {
    const [rows] = await pool.query(
      `SELECT mc.id, mc.name, mc.subtitle, mc.description, mc.display_order, mc.status, mc.tags,
        (SELECT COUNT(*) FROM menu m WHERE m.category = mc.name) AS itemsCount
       FROM menu_categories mc WHERE mc.id = ?`,
      [id]
    );
    return mapRow(rows[0]);
  }

  static async create({ name, subtitle, description, displayOrder, status, tags }) {
    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);
    const [result] = await pool.query(
      `INSERT INTO menu_categories (name, subtitle, description, display_order, status, tags)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        subtitle || null,
        description || null,
        displayOrder ?? 0,
        status ? 1 : 0,
        tagsJson,
      ]
    );
    return result.insertId;
  }

  static async update(id, { name, subtitle, description, displayOrder, status, tags }) {
    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);
    const [result] = await pool.query(
      `UPDATE menu_categories SET name = ?, subtitle = ?, description = ?, display_order = ?, status = ?, tags = ?
       WHERE id = ?`,
      [
        name,
        subtitle || null,
        description || null,
        displayOrder ?? 0,
        status ? 1 : 0,
        tagsJson,
        id,
      ]
    );
    return result.affectedRows;
  }

  static async deleteById(id) {
    const [result] = await pool.query('DELETE FROM menu_categories WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

export default CategoryModel;
