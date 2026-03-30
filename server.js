import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import pool from './db.js';
import authRoutes from './src/routes/authRoutes.js';
import tableRoutes from './src/routes/tableRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// --- Modular Routes ---
app.use('/api', authRoutes); // This will handle /api/login
app.use('/api/tables', tableRoutes);

// --- Menu Routes ---

// Get all menu items
app.get('/api/menu', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu ORDER BY category, name');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu data' });
  }
});

// Add a new menu item
app.post('/api/menu', async (req, res) => {
  try {
    const { name, price, category, description, image } = req.body;
    const [result] = await pool.query(
      'INSERT INTO menu (name, price, category, description, image) VALUES (?, ?, ?, ?, ?)',
      [name, price, category, description, image]
    );
    res.json({ id: result.insertId, message: 'Menu item added' });
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
});

// Update a menu item
app.put('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, description, image, is_available } = req.body;
    await pool.query(
      'UPDATE menu SET name = ?, price = ?, category = ?, description = ?, image = ?, is_available = ? WHERE id = ?',
      [name, price, category, description, image, is_available, id]
    );
    res.json({ message: 'Menu item updated' });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// --- Orders Routes ---

// Get all orders with items
app.get('/api/orders', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    
    // For each order, fetch its items
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const [items] = await pool.query(
        'SELECT oi.*, m.name, m.image FROM order_items oi JOIN menu m ON oi.menu_id = m.id WHERE oi.order_id = ?',
        [order.id]
      );
      return { ...order, items };
    }));
    
    res.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Place a new order
app.post('/api/orders', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { customerName, tableId, items, total } = req.body;

    // 1. Insert order
    const [orderResult] = await connection.query(
      'INSERT INTO orders (customer_name, table_id, total_amount, status) VALUES (?, ?, ?, ?)',
      [customerName, tableId === 'General' ? null : tableId, total, 'Pending']
    );
    const orderId = orderResult.insertId;

    // 2. Insert order items
    for (const item of items) {
      await connection.query(
        'INSERT INTO order_items (order_id, menu_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      );
    }

    await connection.commit();
    res.json({ id: orderId, message: 'Order placed successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Failed to place order' });
  } finally {
    connection.release();
  }
});

// Update order status
app.post('/api/orders/update-status', async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    res.json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
