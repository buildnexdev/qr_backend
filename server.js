import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const MENU_FILE = path.join(__dirname, 'data', 'menu.json');
const TABLES_FILE = path.join(__dirname, 'data', 'tables.json');
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

// Ensure data files exist
async function ensureDataFiles() {
  try { await fs.access(MENU_FILE); } catch { await fs.writeFile(MENU_FILE, '[]'); }
  try { await fs.access(TABLES_FILE); } catch { await fs.writeFile(TABLES_FILE, '[]'); }
  try { await fs.access(ORDERS_FILE); } catch { await fs.writeFile(ORDERS_FILE, '[]'); }
}
ensureDataFiles();

// Menu Routes
app.get('/api/menu', async (req, res) => {
  try {
    const data = await fs.readFile(MENU_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read menu data' });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    await fs.writeFile(MENU_FILE, JSON.stringify(req.body, null, 2));
    res.json({ message: 'Menu updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update menu data' });
  }
});

// Tables Routes
app.get('/api/tables', async (req, res) => {
  try {
    const data = await fs.readFile(TABLES_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read tables data' });
  }
});

app.post('/api/tables', async (req, res) => {
  try {
    await fs.writeFile(TABLES_FILE, JSON.stringify(req.body, null, 2));
    res.json({ message: 'Tables updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tables data' });
  }
});

// Orders Routes
app.get('/api/orders', async (req, res) => {
  try {
    const data = await fs.readFile(ORDERS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read orders data' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const data = await fs.readFile(ORDERS_FILE, 'utf8');
    const orders = JSON.parse(data);
    const newOrder = {
      ...req.body,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    orders.push(newOrder);
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
    res.json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

app.post('/api/orders/update-status', async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const data = await fs.readFile(ORDERS_FILE, 'utf8');
    const orders = JSON.parse(data);
    const updatedOrders = orders.map((o) => o.id === orderId ? { ...o, status } : o);
    await fs.writeFile(ORDERS_FILE, JSON.stringify(updatedOrders, null, 2));
    res.json({ message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
