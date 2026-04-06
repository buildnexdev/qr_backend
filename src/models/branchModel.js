import pool from '../../db.js';

class BranchModel {
  static async getAll() {
    const [rows] = await pool.query(
      'SELECT id, name, code, location, pincode, manager, phone, status, staff_count AS staffCount, created_at, updated_at FROM branches ORDER BY id DESC'
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, code, location, pincode, manager, phone, status, staff_count AS staffCount, created_at, updated_at FROM branches WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async create({ name, code, location, pincode, manager, phone, status }) {
    const [result] = await pool.query(
      `INSERT INTO branches (name, code, location, pincode, manager, phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, code, location || null, pincode || null, manager || null, phone || null, status ? 1 : 0]
    );
    return result.insertId;
  }

  static async update(id, { name, code, location, pincode, manager, phone, status }) {
    const [result] = await pool.query(
      `UPDATE branches SET name = ?, code = ?, location = ?, pincode = ?, manager = ?, phone = ?, status = ?
       WHERE id = ?`,
      [name, code, location || null, pincode || null, manager || null, phone || null, status ? 1 : 0, id]
    );
    return result.affectedRows;
  }

  static async deleteById(id) {
    const [result] = await pool.query('DELETE FROM branches WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

export default BranchModel;
