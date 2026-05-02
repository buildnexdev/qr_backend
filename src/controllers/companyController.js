import pool from '../../db.js';

class CompanyController {

  // GET /api/company — list all companies
  static async getAll(req, res) {
    try {
      const [rows] = await pool.query(
        'SELECT id, company_name, company_code, address_line1, city, state, pincode, is_published, created_at FROM tblCompany ORDER BY id DESC'
      );
      res.json(rows);
    } catch (error) {
      console.error('Error fetching companies:', error);
      res.status(500).json({ error: 'Failed to fetch companies' });
    }
  }

  // GET /api/company/:id — get single company
  static async getOne(req, res) {
    try {
      const [rows] = await pool.query('SELECT * FROM tblCompany WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Company not found' });
      res.json(rows[0]);
    } catch (error) {
      console.error('Error fetching company:', error);
      res.status(500).json({ error: 'Failed to fetch company' });
    }
  }

  // POST /api/company — create new company
  static async create(req, res) {
    try {
      const data = { ...req.body };
      delete data.id;
      delete data.created_at;
      delete data.updated_at;

      // Auto-generate company code if not provided
      if (!data.company_code) {
        const prefix = (data.company_name || 'CO').substring(0, 3).toUpperCase();
        const [countRows] = await pool.query('SELECT COUNT(*) as cnt FROM tblCompany');
        data.company_code = `${prefix}${String(countRows[0].cnt + 1).padStart(4, '0')}`;
      }

      const [result] = await pool.query('INSERT INTO tblCompany SET ?', [data]);
      res.status(201).json({ message: 'Company created successfully', id: result.insertId, company_code: data.company_code });
    } catch (error) {
      console.error('Error creating company:', error);
      res.status(500).json({ error: 'Failed to create company' });
    }
  }

  // PUT /api/company/:id — update company
  static async update(req, res) {
    try {
      const data = { ...req.body };
      delete data.id;
      delete data.created_at;
      delete data.updated_at;

      await pool.query('UPDATE tblCompany SET ? WHERE id = ?', [data, req.params.id]);
      res.json({ message: 'Company updated successfully' });
    } catch (error) {
      console.error('Error updating company:', error);
      res.status(500).json({ error: 'Failed to update company' });
    }
  }

  // PATCH /api/company/:id/publish — toggle publish status
  static async togglePublish(req, res) {
    try {
      const [rows] = await pool.query('SELECT is_published FROM tblCompany WHERE id = ?', [req.params.id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Company not found' });

      const newStatus = rows[0].is_published ? 0 : 1;
      await pool.query('UPDATE tblCompany SET is_published = ? WHERE id = ?', [newStatus, req.params.id]);
      res.json({ message: 'Publish status updated', is_published: Boolean(newStatus) });
    } catch (error) {
      console.error('Error toggling publish:', error);
      res.status(500).json({ error: 'Failed to toggle publish status' });
    }
  }
}

export default CompanyController;
