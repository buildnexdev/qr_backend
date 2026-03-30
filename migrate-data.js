import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');

async function migrate() {
  console.log('Starting migration...');

  // 1. Migrate Menu
  try {
    const menuData = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'menu.json'), 'utf8'));
    for (const item of menuData) {
      await pool.query(
        'INSERT INTO menu (id, name, price, category, description, image) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
        [item.id, item.name, item.price, item.category, item.description, item.image]
      );
    }
    console.log('Menu migrated.');
  } catch (err) { console.error('Menu migration failed:', err.message); }

  // 2. Migrate Tables
  try {
    const tablesData = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'tables.json'), 'utf8'));
    for (const table of tablesData) {
      await pool.query(
        'INSERT INTO tables (id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)',
        [table.id, table.name]
      );
    }
    console.log('Tables migrated.');
  } catch (err) { console.error('Tables migration failed:', err.message); }

  // 3. Migrate Orders
  try {
    const ordersData = JSON.parse(await fs.readFile(path.join(DATA_DIR, 'orders.json'), 'utf8'));
    for (const order of ordersData) {
      const [orderResult] = await pool.query(
        'INSERT INTO orders (id, customer_name, table_id, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status=VALUES(status)',
        [
          order.id, 
          order.customerName, 
          order.tableId === 'General' ? null : order.tableId, 
          order.total, 
          order.status, 
          new Date(order.timestamp)
        ]
      );
      
      // Migrate Order Items
      for (const item of order.items) {
        await pool.query(
          'INSERT INTO order_items (order_id, menu_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
          [order.id, item.id, item.quantity, item.price]
        );
      }
    }
    console.log('Orders migrated.');
  } catch (err) { console.error('Orders migration failed:', err.message); }

  console.log('Migration completed!');
  process.exit(0);
}

migrate();
