/**
 * Creates registration_requests if missing. Run: node scripts/ensure-registration-table.js
 */
import pool from '../db.js';

const sql = `
CREATE TABLE IF NOT EXISTS registration_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    message TEXT,
    email_sent BOOLEAN DEFAULT FALSE,
    email_error VARCHAR(512) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

try {
  await pool.query(sql);
  console.log('Table registration_requests is ready.');
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  process.exit();
}
