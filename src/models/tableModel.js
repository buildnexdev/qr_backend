import pool from '../../db.js';

class TableModel {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM tables ORDER BY id ASC');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM tables WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(name) {
    const [result] = await pool.query('INSERT INTO tables (name) VALUES (?)', [name]);
    return result.insertId;
  }

  static async deleteById(id) {
    const [result] = await pool.query('DELETE FROM tables WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

export default TableModel;
