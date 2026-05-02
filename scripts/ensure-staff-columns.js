/**
 * Adds extended columns to `staff` for employee management (idempotent).
 * Run: node scripts/ensure-staff-columns.js
 */
import pool from '../db.js';

const ALTERS = [
  "ALTER TABLE staff ADD COLUMN employeeId VARCHAR(64) NULL",
  "ALTER TABLE staff ADD COLUMN gender VARCHAR(20) NULL",
  "ALTER TABLE staff ADD COLUMN dateOfBirth DATE NULL",
  "ALTER TABLE staff ADD COLUMN alternatePhone VARCHAR(32) NULL",
  "ALTER TABLE staff ADD COLUMN department VARCHAR(64) NULL",
  "ALTER TABLE staff ADD COLUMN shiftTiming VARCHAR(64) NULL",
  "ALTER TABLE staff ADD COLUMN joiningDate DATE NULL",
  "ALTER TABLE staff ADD COLUMN username VARCHAR(128) NULL",
  "ALTER TABLE staff ADD COLUMN isPublish TINYINT(1) NOT NULL DEFAULT 1",
  "ALTER TABLE staff ADD COLUMN permissionsJson LONGTEXT NULL",
  "ALTER TABLE staff ADD COLUMN documentsJson LONGTEXT NULL",
];

async function run() {
  for (const sql of ALTERS) {
    try {
      await pool.query(sql);
      console.log('OK:', sql.slice(0, 60) + '…');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME' || e.errno === 1060) {
        console.log('Skip (exists):', sql.slice(30, 70));
      } else {
        console.error(e);
        throw e;
      }
    }
  }
  console.log('ensure-staff-columns done.');
  process.exit(0);
}

run().catch(() => process.exit(1));
