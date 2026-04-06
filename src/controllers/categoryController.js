import CategoryModel from '../models/categoryModel.js';

class CategoryController {
  static async list(req, res) {
    try {
      res.json(await CategoryModel.getAll());
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  static async getOne(req, res) {
    try {
      const row = await CategoryModel.getById(req.params.id);
      if (!row) return res.status(404).json({ error: 'Category not found' });
      res.json(row);
    } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ error: 'Failed to fetch category' });
    }
  }

  static async create(req, res) {
    try {
      const { name, subtitle, description, displayOrder, status, tags } = req.body;
      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }
      const order = displayOrder !== undefined && displayOrder !== '' ? parseInt(String(displayOrder), 10) || 0 : 0;
      const insertId = await CategoryModel.create({
        name: String(name).trim(),
        subtitle: subtitle || '',
        description: description || '',
        displayOrder: order,
        status: status !== undefined ? Boolean(status) : true,
        tags: Array.isArray(tags) ? tags : [],
      });
      const row = await CategoryModel.getById(insertId);
      res.status(201).json(row);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Category name already exists' });
      }
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, subtitle, description, displayOrder, status, tags } = req.body;
      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }
      const order = displayOrder !== undefined && displayOrder !== '' ? parseInt(String(displayOrder), 10) || 0 : 0;
      const affected = await CategoryModel.update(id, {
        name: String(name).trim(),
        subtitle: subtitle || '',
        description: description || '',
        displayOrder: order,
        status: status !== undefined ? Boolean(status) : true,
        tags: Array.isArray(tags) ? tags : [],
      });
      if (!affected) return res.status(404).json({ error: 'Category not found' });
      res.json(await CategoryModel.getById(id));
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Category name already exists' });
      }
      console.error('Error updating category:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  }

  static async remove(req, res) {
    try {
      const affected = await CategoryModel.deleteById(req.params.id);
      if (!affected) return res.status(404).json({ error: 'Category not found' });
      res.json({ message: 'Category deleted' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }
}

export default CategoryController;
