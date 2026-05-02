/** Creates tblRole if missing. Run: node scripts/ensure-role-table.js */
import pool from '../db.js';

const sql = `
CREATE TABLE IF NOT EXISTS tblRole (
    roleID BIGINT AUTO_INCREMENT PRIMARY KEY,
    roleName VARCHAR(100) NOT NULL,
    roleCode VARCHAR(50) UNIQUE,
    description TEXT,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;

try {
  await pool.query(sql);
  console.log('Table tblRole is ready.');
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  process.exit();
}
