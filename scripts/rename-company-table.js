import pool from '../db.js';

async function renameTable() {
  try {
    // Check if old table exists
    const [old] = await pool.query("SHOW TABLES LIKE 'company_settings'");
    if (old.length > 0) {
      await pool.query('RENAME TABLE company_settings TO tblCompany');
      console.log('✅ Renamed company_settings → tblCompany');
    } else {
      const [already] = await pool.query("SHOW TABLES LIKE 'tblCompany'");
      if (already.length > 0) {
        console.log('ℹ️  tblCompany already exists, nothing to do.');
      } else {
        console.log('⚠️  Neither company_settings nor tblCompany found.');
      }
    }
  } catch (e) {
    console.error('Migration error:', e.message);
  } finally {
    process.exit();
  }
}

renameTable();
