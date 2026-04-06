import StaffModel from '../models/staffModel.js';

class StaffController {
  static async list(req, res) {
    try {
      res.json(await StaffModel.getAll());
    } catch (error) {
      console.error('Error fetching staff:', error);
      res.status(500).json({ error: 'Failed to fetch staff' });
    }
  }

  static async getOne(req, res) {
    try {
      const row = await StaffModel.getById(req.params.id);
      if (!row) return res.status(404).json({ error: 'Staff not found' });
      res.json(row);
    } catch (error) {
      console.error('Error fetching staff:', error);
      res.status(500).json({ error: 'Failed to fetch staff' });
    }
  }

  static async create(req, res) {
    try {
      const body = req.body;
      if (!body.name || !String(body.name).trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }
      if (!body.password || !String(body.password).trim()) {
        return res.status(400).json({ error: 'Password is required for new staff' });
      }
      const insertId = await StaffModel.create({
        name: String(body.name).trim(),
        phone: body.phone,
        email: body.email,
        password: String(body.password),
        role: body.role,
        branch: body.branch,
        qualification: body.qualification,
        address: body.address,
        image: body.image || null,
        status: body.status !== undefined ? Boolean(body.status) : true,
      });
      res.status(201).json(await StaffModel.getById(insertId));
    } catch (error) {
      console.error('Error creating staff:', error);
      res.status(500).json({ error: 'Failed to create staff' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const body = req.body;
      if (!body.name || !String(body.name).trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }
      const existing = await StaffModel.getById(id);
      if (!existing) return res.status(404).json({ error: 'Staff not found' });

      const affected = await StaffModel.update(id, {
        name: String(body.name).trim(),
        phone: body.phone,
        email: body.email,
        password: body.password && String(body.password).trim() ? String(body.password) : null,
        role: body.role,
        branch: body.branch,
        qualification: body.qualification,
        address: body.address,
        image: body.image !== undefined ? body.image : existing.image,
        status: body.status !== undefined ? Boolean(body.status) : true,
      });
      if (!affected) return res.status(404).json({ error: 'Staff not found' });
      res.json(await StaffModel.getById(id));
    } catch (error) {
      console.error('Error updating staff:', error);
      res.status(500).json({ error: 'Failed to update staff' });
    }
  }

  static async remove(req, res) {
    try {
      const affected = await StaffModel.deleteById(req.params.id);
      if (!affected) return res.status(404).json({ error: 'Staff not found' });
      res.json({ message: 'Staff deleted' });
    } catch (error) {
      console.error('Error deleting staff:', error);
      res.status(500).json({ error: 'Failed to delete staff' });
    }
  }
}

export default StaffController;
