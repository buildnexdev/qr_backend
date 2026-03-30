import pool from './db.js';

async function check() {
  try {
    const [menu] = await pool.query('SELECT COUNT(*) as count FROM menu');
    const [tables] = await pool.query('SELECT COUNT(*) as count FROM tables');
    const [orders] = await pool.query('SELECT COUNT(*) as count FROM orders');
    const [orderItems] = await pool.query('SELECT COUNT(*) as count FROM order_items');

    console.log('Menu count:', menu[0].count);
    console.log('Tables count:', tables[0].count);
    console.log('Orders count:', orders[0].count);
    console.log('Order Items count:', orderItems[0].count);

    if (menu[0].count > 0) {
      const [firstItem] = await pool.query('SELECT * FROM menu LIMIT 1');
      console.log('First menu item:', firstItem[0].name);
    }
  } catch (err) {
    console.error('Check failed:', err.message);
  } finally {
    process.exit(0);
  }
}

check();
