import express from 'express';
import CategoryController from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', CategoryController.list);
router.get('/:id', CategoryController.getOne);
router.post('/', CategoryController.create);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.remove);

export default router;
