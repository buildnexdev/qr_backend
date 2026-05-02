import pool from '../db.js';

async function migrate() {
  try {
    const [cols] = await pool.query(`SHOW COLUMNS FROM tblCompany LIKE 'is_published'`);
    if (cols.length === 0) {
      await pool.query(`ALTER TABLE tblCompany ADD COLUMN is_published TINYINT(1) DEFAULT 0`);
      console.log('✅ is_published column added successfully.');
    } else {
      console.log('ℹ️  is_published column already exists.');
    }
  } catch (e) {
    console.error('Migration error:', e.message);
  } finally {
    process.exit();
  }
}

migrate();
