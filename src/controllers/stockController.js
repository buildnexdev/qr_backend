import StockModel from '../models/stockModel.js';

function num(v, fallback = 0) {
  if (v === undefined || v === null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

class StockController {
  static async list(req, res) {
    try {
      res.json(await StockModel.getAll());
    } catch (error) {
      console.error('Error fetching stock items:', error);
      res.status(500).json({ error: 'Failed to fetch stock items' });
    }
  }

  static async getOne(req, res) {
    try {
      const row = await StockModel.getById(req.params.id);
      if (!row) return res.status(404).json({ error: 'Stock item not found' });
      res.json(row);
    } catch (error) {
      console.error('Error fetching stock item:', error);
      res.status(500).json({ error: 'Failed to fetch stock item' });
    }
  }

  static async create(req, res) {
    try {
      const { name, category, quantity, unit, minThreshold, lastRestocked, notes } = req.body || {};
      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }
      const insertId = await StockModel.create({
        name: String(name).trim(),
        category: category != null ? String(category).trim() : 'General',
        quantity: num(quantity, 0),
        unit: unit != null ? String(unit).trim() : 'kg',
        minThreshold: num(minThreshold, 0),
        lastRestocked: lastRestocked != null && String(lastRestocked).trim() ? String(lastRestocked).trim().slice(0, 10) : null,
        notes: notes != null ? String(notes).trim() : '',
      });
      const row = await StockModel.getById(insertId);
      res.status(201).json(row);
    } catch (error) {
      console.error('Error creating stock item:', error);
      res.status(500).json({ error: 'Failed to create stock item' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, category, quantity, unit, minThreshold, lastRestocked, notes } = req.body || {};
      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }
      const affected = await StockModel.update(id, {
        name: String(name).trim(),
        category: category != null ? String(category).trim() : 'General',
        quantity: num(quantity, 0),
        unit: unit != null ? String(unit).trim() : 'kg',
        minThreshold: num(minThreshold, 0),
        lastRestocked: lastRestocked != null && String(lastRestocked).trim() ? String(lastRestocked).trim().slice(0, 10) : null,
        notes: notes != null ? String(notes).trim() : '',
      });
      if (!affected) return res.status(404).json({ error: 'Stock item not found' });
      res.json(await StockModel.getById(id));
    } catch (error) {
      console.error('Error updating stock item:', error);
      res.status(500).json({ error: 'Failed to update stock item' });
    }
  }

  static async remove(req, res) {
    try {
      const affected = await StockModel.deleteById(req.params.id);
      if (!affected) return res.status(404).json({ error: 'Stock item not found' });
      res.json({ message: 'Stock item deleted' });
    } catch (error) {
      console.error('Error deleting stock item:', error);
      res.status(500).json({ error: 'Failed to delete stock item' });
    }
  }
}

export default StockController;
