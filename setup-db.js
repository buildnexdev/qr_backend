import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setup() {
  const ports = [3306, 8889];
  let connection;
  
  for (const port of ports) {
    try {
      console.log(`Attempting to connect on port ${port}...`);
      connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        port: port
      });
      console.log(`Connected to MySQL on port ${port}!`);
      break;
    } catch (err) {
      console.error(`Failed on port ${port}: ${err.message}`);
    }
  }

  if (!connection) {
    throw new Error('Could not connect to MySQL on any common MAMP ports.');
  }

  const schema = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
  
  // Split schema into individual queries
  const queries = schema
    .split(';')
    .map(q => q.trim())
    .filter(q => q.length > 0);

  for (const query of queries) {
    try {
      await connection.query(query);
      console.log('Executed:', query.substring(0, 50) + '...');
    } catch (err) {
      if (err.code === 'ER_DB_CREATE_EXISTS') {
        console.log('Database already exists.');
      } else {
        console.error('Error executing query:', err);
      }
    }
  }

  await connection.end();
  console.log('Database setup completed!');
}

setup().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
