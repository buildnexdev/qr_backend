import RoleModel from '../models/roleModel.js';

class RoleController {
  static async list(req, res) {
    try {
      res.json(await RoleModel.getAll());
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  }

  static async getOne(req, res) {
    try {
      const row = await RoleModel.getById(req.params.id);
      if (!row) return res.status(404).json({ error: 'Role not found' });
      res.json(row);
    } catch (error) {
      console.error('Error fetching role:', error);
      res.status(500).json({ error: 'Failed to fetch role' });
    }
  }

  static async create(req, res) {
    try {
      const { roleName, roleCode, description, status } = req.body;
      if (!roleName || !String(roleName).trim()) {
        return res.status(400).json({ error: 'Role name is required' });
      }
      const insertId = await RoleModel.create({ roleName, roleCode, description, status });
      const row = await RoleModel.getById(insertId);
      res.status(201).json(row);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Role code already exists' });
      }
      console.error('Error creating role:', error);
      res.status(500).json({ error: 'Failed to create role' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { roleName, roleCode, description, status } = req.body;
      if (!roleName || !String(roleName).trim()) {
        return res.status(400).json({ error: 'Role name is required' });
      }
      const affected = await RoleModel.update(id, { roleName, roleCode, description, status });
      if (!affected) return res.status(404).json({ error: 'Role not found' });
      res.json(await RoleModel.getById(id));
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Role code already exists' });
      }
      console.error('Error updating role:', error);
      res.status(500).json({ error: 'Failed to update role' });
    }
  }

  static async remove(req, res) {
    try {
      const affected = await RoleModel.deleteById(req.params.id);
      if (!affected) return res.status(404).json({ error: 'Role not found' });
      res.json({ message: 'Role deleted' });
    } catch (error) {
      console.error('Error deleting role:', error);
      res.status(500).json({ error: 'Failed to delete role' });
    }
  }
}

export default RoleController;
