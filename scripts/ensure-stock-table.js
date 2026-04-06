/** Creates stock_items if missing. Run: node scripts/ensure-stock-table.js */
import pool from '../db.js';

const sql = `
CREATE TABLE IF NOT EXISTS stock_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL DEFAULT 'General',
    quantity DECIMAL(12, 3) NOT NULL DEFAULT 0,
    unit VARCHAR(32) NOT NULL DEFAULT 'kg',
    min_threshold DECIMAL(12, 3) NOT NULL DEFAULT 0,
    last_restocked DATE NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;

try {
  await pool.query(sql);
  console.log('Table stock_items is ready.');
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  process.exit();
}
