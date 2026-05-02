import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import pool from './db.js';
import authRoutes from './src/routes/authRoutes.js';
import tableRoutes from './src/routes/tableRoutes.js';
import branchRoutes from './src/routes/branchRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import staffRoutes from './src/routes/staffRoutes.js';
import registerRoutes from './src/routes/registerRoutes.js';
import stockRoutes from './src/routes/stockRoutes.js';
import companyRoutes from './src/routes/companyRoutes.js';
import roleRoutes from './src/routes/roleRoutes.js';
import authMiddleware from './src/middleware/authMiddleware.js';

dotenv.config();

function mapMenuRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    category: row.category,
    description: row.description || '',
    image: row.image || '',
    status: Boolean(row.is_available),
    rate: row.rating != null ? Number(row.rating) : undefined,
    code: row.item_code != null && row.item_code !== '' ? String(row.item_code) : undefined,
  };
}

/** Normalize category for DB: comma-separated names from multi-select or legacy single string */
function normalizeMenuCategories(body) {
  if (Array.isArray(body.categories) && body.categories.length) {
    return body.categories
      .map((c) => String(c).trim())
      .filter(Boolean)
      .join(', ');
  }
  if (body.category != null) return String(body.category);
  return '';
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '15mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '15mb' }));

// --- Modular Routes ---
app.use('/api', authRoutes); // This will handle /api/login
app.use('/api/tables', authMiddleware, tableRoutes);
app.use('/api/branches', authMiddleware, branchRoutes);
app.use('/api/categories', authMiddleware, categoryRoutes);
app.use('/api/staff', authMiddleware, staffRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/stocks', authMiddleware, stockRoutes);
app.use('/api/company', authMiddleware, companyRoutes);
app.use('/api/roles', authMiddleware, roleRoutes);

// --- Menu Routes ---

// Get all menu items
app.get('/api/menu', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu ORDER BY category, name');
    res.json(rows.map(mapMenuRow));
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu data' });
  }
});

// Get one menu item by id
app.get('/api/menu/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Menu item not found' });
    res.json(mapMenuRow(rows[0]));
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

// Add a new menu item
app.post('/api/menu', async (req, res) => {
  try {
    const { name, price, description, image, status, rate, code } = req.body;
    const category = normalizeMenuCategories(req.body);
    const item_code = code != null && String(code).trim() !== '' ? String(code).trim() : null;
    const is_available = status !== undefined ? Boolean(status) : true;
    const rating =
      rate != null && rate !== '' && !Number.isNaN(parseFloat(rate)) ? parseFloat(rate) : null;
    const [result] = await pool.query(
      'INSERT INTO menu (name, price, category, description, image, is_available, rating, item_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, price, category, description, image || '', is_available ? 1 : 0, rating, item_code]
    );
    const [inserted] = await pool.query('SELECT * FROM menu WHERE id = ?', [result.insertId]);
    res.status(201).json(mapMenuRow(inserted[0]));
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
});

// Update a menu item
app.put('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, image, is_available, status, rate, code } = req.body;
    const category = normalizeMenuCategories(req.body);
    const item_code = code != null && String(code).trim() !== '' ? String(code).trim() : null;
    const avail =
      status !== undefined
        ? Boolean(status)
        : is_available !== undefined
          ? Boolean(is_available)
          : true;
    const rating =
      rate != null && rate !== '' && !Number.isNaN(parseFloat(rate)) ? parseFloat(rate) : null;
    const [result] = await pool.query(
      'UPDATE menu SET name = ?, price = ?, category = ?, description = ?, image = ?, is_available = ?, rating = ?, item_code = ? WHERE id = ?',
      [name, price, category, description, image || '', avail ? 1 : 0, rating, item_code, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    const [updated] = await pool.query('SELECT * FROM menu WHERE id = ?', [id]);
    res.json(mapMenuRow(updated[0]));
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete a menu item
app.delete('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM menu WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
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
        'SELECT oi.*, oi.price_at_time AS price, m.name, m.image FROM order_items oi JOIN menu m ON oi.menu_id = m.id WHERE oi.order_id = ?',
        [order.id]
      );
      return {
        id: order.id,
        customerName: order.customer_name,
        tableId: order.table_id,
        total: order.total_amount,
        status: order.status,
        timestamp: order.created_at,
        items
      };
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
    res.json({
      id: orderId,
      message: 'Order placed successfully',
      customerName,
      tableId,
      items,
      total,
      status: 'Pending',
      timestamp: new Date().toISOString()
    });
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
