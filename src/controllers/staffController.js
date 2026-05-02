import StaffModel from '../models/staffModel.js';

function normalizePayload(body, { requirePassword = false } = {}) {
  const name = body.name != null ? String(body.name).trim() : '';
  if (!name) return { error: 'Name is required' };
  if (requirePassword) {
    const pw = body.password != null ? String(body.password).trim() : '';
    if (!pw) return { error: 'Password is required for new staff' };
  }
  return {
    payload: {
      name,
      phone: body.phone,
      email: body.email,
      password: body.password != null ? String(body.password) : undefined,
      role: body.role,
      branch: body.branch,
      qualification: body.qualification,
      address: body.address,
      image: body.image,
      status: body.status !== undefined ? Boolean(body.status) : true,
      employeeId: body.employeeId,
      gender: body.gender,
      dateOfBirth: body.dateOfBirth || null,
      alternatePhone: body.alternatePhone,
      department: body.department,
      shiftTiming: body.shiftTiming,
      joiningDate: body.joiningDate || null,
      username: body.username,
      isPublish: body.isPublish !== undefined ? Boolean(body.isPublish) : true,
      permissionsJson:
        typeof body.permissionsJson === 'string'
          ? body.permissionsJson
          : body.permissionsJson != null
            ? JSON.stringify(body.permissionsJson)
            : null,
      documentsJson:
        typeof body.documentsJson === 'string'
          ? body.documentsJson
          : body.documentsJson != null
            ? JSON.stringify(body.documentsJson)
            : null,
    },
  };
}

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
      const norm = normalizePayload(req.body, { requirePassword: true });
      if (norm.error) return res.status(400).json({ error: norm.error });
      const insertId = await StaffModel.create(norm.payload);
      res.status(201).json(await StaffModel.getById(insertId));
    } catch (error) {
      console.error('Error creating staff:', error);
      res.status(500).json({ error: 'Failed to create staff' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const norm = normalizePayload(req.body, { requirePassword: false });
      if (norm.error) return res.status(400).json({ error: norm.error });
      const existing = await StaffModel.getById(id);
      if (!existing) return res.status(404).json({ error: 'Staff not found' });

      const affected = await StaffModel.update(id, norm.payload);
      if (!affected) return res.status(404).json({ error: 'Staff not found' });
      res.json(await StaffModel.getById(id));
    } catch (error) {
      console.error('Error updating staff:', error);
      res.status(500).json({ error: 'Failed to update staff' });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { id } = req.params;
      const pw = req.body?.password != null ? String(req.body.password).trim() : '';
      if (!pw) return res.status(400).json({ error: 'Password is required' });
      const existing = await StaffModel.getById(id);
      if (!existing) return res.status(404).json({ error: 'Staff not found' });
      const affected = await StaffModel.updatePassword(id, pw);
      if (!affected) return res.status(404).json({ error: 'Staff not found' });
      res.json({ message: 'Password updated' });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ error: 'Failed to reset password' });
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
