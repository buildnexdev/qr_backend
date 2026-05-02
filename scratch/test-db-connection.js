import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const portsToTest = [3306, 8889, 3307];
const hostsToTest = ['127.0.0.1', 'localhost'];

async function testConnection(host, port) {
  console.log(`Testing ${host}:${port}...`);
  const connection = await mysql.createConnection({
    host: host,
    port: port,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectTimeout: 2000
  });

  try {
    await connection.query('SELECT 1');
    console.log(`✅ SUCCESS: Connected to ${host}:${port}`);
    return true;
  } catch (err) {
    console.log(`❌ FAILED: ${host}:${port} (${err.code})`);
    return false;
  } finally {
    await connection.end();
  }
}

async function runTests() {
  console.log('--- Database Connection Diagnostic ---');
  let found = false;
  for (const host of hostsToTest) {
    for (const port of portsToTest) {
      try {
        if (await testConnection(host, port)) {
          found = true;
          console.log(`\nSuggested .env change:\nDB_HOST=${host}\nDB_PORT=${port}`);
          break;
        }
      } catch (e) {
        console.log(`❌ ERROR: Could not even attempt ${host}:${port}`);
      }
    }
    if (found) break;
  }

  if (!found) {
    console.log('\n❌ No connection could be established. Please ensure MySQL is running in MAMP.');
  }
  process.exit(0);
}

runTests();
