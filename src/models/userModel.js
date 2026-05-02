import pool from '../../db.js';

class UserModel {
  static async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT userID AS id, username, password, roleID AS role, companyID, branchID, fullName AS name FROM tblUser WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  static async findByPhonenumber(phone) {
    const [rows] = await pool.query(
      'SELECT userID AS id, username, password, roleID AS role, companyID, branchID, fullName AS name FROM tblUser WHERE phone = ?',
      [phone]
    );
    return rows[0];
  }
}

export default UserModel;
