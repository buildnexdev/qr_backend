import pool from '../../db.js';

class UserModel {
  static async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT id, username, password, role FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }
}

export default UserModel;
