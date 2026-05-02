import CategoryModel from '../models/categoryModel.js';

class CategoryController {
  /** Next `code` value that will be used on POST create (MAX(code)+1). */
  static async nextCode(req, res) {
    try {
      const nextCode = await CategoryModel.getNextCode();
      res.json({ nextCode });
    } catch (error) {
      console.error('Error resolving next category code:', error);
      res.status(500).json({ error: 'Failed to resolve next category code' });
    }
  }

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
      const { name, description } = req.body;
      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }
      const insertId = await CategoryModel.create({
        name: String(name).trim(),
        description: description != null ? String(description).trim() : '',
      });
      const row = await CategoryModel.getById(insertId);
      res.status(201).json(row);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: 'Category name already exists' });
      }
      if (error.code === 'ER_BAD_FIELD_ERROR' && String(error.sqlMessage || '').includes('code')) {
        return res.status(500).json({
          error:
            'Database missing category code column. Run migrations/add_menu_category_code.sql on your database.',
        });
      }
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }
      const affected = await CategoryModel.updateBasics(id, {
        name: String(name).trim(),
        description: description != null ? String(description).trim() : '',
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

  static async patchActive(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ error: 'isActive (boolean) is required' });
      }
      const affected = await CategoryModel.setActive(id, isActive);
      if (!affected) return res.status(404).json({ error: 'Category not found' });
      res.json(await CategoryModel.getById(id));
    } catch (error) {
      console.error('Error updating category status:', error);
      res.status(500).json({ error: 'Failed to update category status' });
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
