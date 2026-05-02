import BranchModel from '../models/branchModel.js';

class BranchController {
  static async getBranches(req, res) {
    try {
      const branches = await BranchModel.getAll();
      res.json(branches);
    } catch (error) {
      console.error('Error fetching branches:', error);
      res.status(500).json({ error: 'Failed to fetch branches' });
    }
  }

  static async getBranch(req, res) {
    try {
      const { id } = req.params;
      const branch = await BranchModel.getById(id);
      if (!branch) {
        return res.status(404).json({ error: 'Branch not found' });
      }
      res.json(branch);
    } catch (error) {
      console.error('Error fetching branch:', error);
      res.status(500).json({ error: 'Failed to fetch branch' });
    }
  }

  static async addBranch(req, res) {
    try {
      if (!req.body.branchName || !req.body.branchCode) {
        return res.status(400).json({ error: 'Branch name and code are required' });
      }
      const insertId = await BranchModel.create(req.body);
      const branch = await BranchModel.getById(insertId);
      res.status(201).json(branch);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Branch code already exists' });
      }
      console.error('Error adding branch:', error);
      res.status(500).json({ error: 'Failed to add branch' });
    }
  }

  static async updateBranch(req, res) {
    try {
      const { id } = req.params;
      if (!req.body.branchName || !req.body.branchCode) {
        return res.status(400).json({ error: 'Branch name and code are required' });
      }
      const affected = await BranchModel.update(id, req.body);
      if (affected === 0) {
        return res.status(404).json({ error: 'Branch not found' });
      }
      const branch = await BranchModel.getById(id);
      res.json(branch);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Branch code already exists' });
      }
      console.error('Error updating branch:', error);
      res.status(500).json({ error: 'Failed to update branch' });
    }
  }

  static async deleteBranch(req, res) {
    try {
      const { id } = req.params;
      const affected = await BranchModel.deleteById(id);
      if (affected === 0) {
        return res.status(404).json({ error: 'Branch not found' });
      }
      res.json({ message: 'Branch deleted successfully' });
    } catch (error) {
      console.error('Error deleting branch:', error);
      res.status(500).json({ error: 'Failed to delete branch' });
    }
  }
}

export default BranchController;
