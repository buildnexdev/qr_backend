import pool from '../../db.js';

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    email: row.email || '',
    role: row.role || '',
    branch: row.branch || '',
    qualification: row.qualification || '',
    address: row.address || '',
    image: row.image || `https://i.pravatar.cc/150?u=${row.id}`,
    status: Boolean(row.status),
  };
}

class StaffModel {
  static async getAll() {
    const [rows] = await pool.query(
      'SELECT id, name, phone, email, role, branch, qualification, address, image, status FROM staff ORDER BY id DESC'
    );
    return rows.map(mapRow);
  }

  static async getById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, phone, email, role, branch, qualification, address, image, status FROM staff WHERE id = ?',
      [id]
    );
    return mapRow(rows[0]);
  }

  static async create(payload) {
    const {
      name,
      phone,
      email,
      password,
      role,
      branch,
      qualification,
      address,
      image,
      status,
    } = payload;
    const [result] = await pool.query(
      `INSERT INTO staff (name, phone, email, password, role, branch, qualification, address, image, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        phone || null,
        email || null,
        password || null,
        role || null,
        branch || null,
        qualification || null,
        address || null,
        image || null,
        status ? 1 : 0,
      ]
    );
    return result.insertId;
  }

  static async update(id, payload) {
    const {
      name,
      phone,
      email,
      password,
      role,
      branch,
      qualification,
      address,
      image,
      status,
    } = payload;

    let result;
    if (password) {
      [result] = await pool.query(
        `UPDATE staff SET name = ?, phone = ?, email = ?, password = ?, role = ?, branch = ?, qualification = ?, address = ?, image = ?, status = ?
         WHERE id = ?`,
        [
          name,
          phone || null,
          email || null,
          password,
          role || null,
          branch || null,
          qualification || null,
          address || null,
          image || null,
          status ? 1 : 0,
          id,
        ]
      );
    } else {
      [result] = await pool.query(
        `UPDATE staff SET name = ?, phone = ?, email = ?, role = ?, branch = ?, qualification = ?, address = ?, image = ?, status = ?
         WHERE id = ?`,
        [
          name,
          phone || null,
          email || null,
          role || null,
          branch || null,
          qualification || null,
          address || null,
          image || null,
          status ? 1 : 0,
          id,
        ]
      );
    }
    return result.affectedRows;
  }

  static async deleteById(id) {
    const [result] = await pool.query('DELETE FROM staff WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

export default StaffModel;
