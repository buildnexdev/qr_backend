import pool from '../../db.js';

function mapRow(row) {
  if (!row) return null;
  return {
    roleID: row.roleID,
    roleName: row.roleName,
    roleCode: row.roleCode ?? null,
    description: row.description ?? '',
    status: row.status === 'Inactive' ? 'Inactive' : 'Active',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

class RoleModel {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM tblRole ORDER BY roleID DESC');
    return rows.map(mapRow);
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM tblRole WHERE roleID = ?', [id]);
    return mapRow(rows[0]);
  }

  static async create(data) {
    const status = data.status === 'Inactive' ? 'Inactive' : 'Active';
    const roleCode =
      data.roleCode != null && String(data.roleCode).trim() !== '' ? String(data.roleCode).trim() : null;
    const [result] = await pool.query(
      `INSERT INTO tblRole (roleName, roleCode, description, status) VALUES (?, ?, ?, ?)`,
      [String(data.roleName).trim(), roleCode, data.description || null, status]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const status = data.status === 'Inactive' ? 'Inactive' : 'Active';
    const roleCode =
      data.roleCode != null && String(data.roleCode).trim() !== '' ? String(data.roleCode).trim() : null;
    const [result] = await pool.query(
      `UPDATE tblRole SET roleName = ?, roleCode = ?, description = ?, status = ? WHERE roleID = ?`,
      [String(data.roleName).trim(), roleCode, data.description || null, status, id]
    );
    return result.affectedRows;
  }

  static async deleteById(id) {
    const [result] = await pool.query('DELETE FROM tblRole WHERE roleID = ?', [id]);
    return result.affectedRows;
  }
}

export default RoleModel;
