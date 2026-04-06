import pool from '../../db.js';

class RegistrationModel {
  static async create({ restaurantName, contactName, email, phone, message }) {
    const [r] = await pool.query(
      `INSERT INTO registration_requests (restaurant_name, contact_name, email, phone, message, email_sent)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [restaurantName, contactName, email, phone, message || '']
    );
    return r.insertId;
  }

  static async setEmailResult(id, sent, errorMessage) {
    await pool.query(
      'UPDATE registration_requests SET email_sent = ?, email_error = ? WHERE id = ?',
      [sent ? 1 : 0, errorMessage ? String(errorMessage).slice(0, 512) : null, id]
    );
  }
}

export default RegistrationModel;
