import pool from './db.js';

async function alterTable() {
  try {
    const query = "ALTER TABLE orders MODIFY status ENUM('Pending', 'Preparing', 'Ready', 'Served', 'Cancelled') DEFAULT 'Pending';";
    await pool.query(query);
    console.log("Successfully altered status ENUM to include 'Ready'.");
  } catch (e) {
    console.error("Failed to alter table:", e);
  } finally {
    process.exit();
  }
}

alterTable();
