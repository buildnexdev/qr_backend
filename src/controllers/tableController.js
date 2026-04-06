import TableModel from '../models/tableModel.js';

class TableController {
  static async getTables(req, res) {
    try {
      const tables = await TableModel.getAll();
      res.json(tables);
    } catch (error) {
      console.error('Error fetching tables:', error);
      res.status(500).json({ error: 'Failed to fetch tables' });
    }
  }

  static async addTable(req, res) {
    try {
      const { data, name: fallbackName } = req.body;
      let name = fallbackName;

      // Handle Base64 encoded payload
      if (data) {
        const decodedBuffer = Buffer.from(data, 'base64');
        const decodedString = decodedBuffer.toString('utf-8');
        const parsedData = JSON.parse(decodedString);
        name = parsedData?.table_details?.name;
      }

      if (!name) {
        return res.status(400).json({ error: 'Table name is required' });
      }

      const insertId = await TableModel.create(name);
      const row = await TableModel.getById(insertId);
      res.status(201).json({
        id: row.id,
        name: row.name,
        status: row.status,
        message: 'Table added',
      });
    } catch (error) {
      console.error('Error adding table:', error);
      res.status(500).json({ error: 'Failed to add table' });
    }
  }

  static async deleteTable(req, res) {
    try {
      const { id } = req.params;
      const affected = await TableModel.deleteById(id);
      if (affected === 0) {
        return res.status(404).json({ error: 'Table not found' });
      }
      res.json({ message: 'Table deleted successfully' });
    } catch (error) {
      console.error('Error deleting table:', error);
      res.status(500).json({ error: 'Failed to delete table' });
    }
  }
}

export default TableController;
