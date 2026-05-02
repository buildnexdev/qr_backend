import express from 'express';
import CategoryController from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', CategoryController.list);
router.get('/next-code', CategoryController.nextCode);
router.post('/', CategoryController.create);
router.patch('/:id/active', CategoryController.patchActive);
router.get('/:id', CategoryController.getOne);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.remove);

export default router;
