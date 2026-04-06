import express from 'express';
import StockController from '../controllers/stockController.js';

const router = express.Router();

router.get('/', StockController.list);
router.get('/:id', StockController.getOne);
router.post('/', StockController.create);
router.put('/:id', StockController.update);
router.delete('/:id', StockController.remove);

export default router;
