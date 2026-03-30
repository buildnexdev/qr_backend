import express from 'express';
import TableController from '../controllers/tableController.js';

const router = express.Router();

router.get('/', TableController.getTables);
router.post('/add', TableController.addTable);
router.delete('/:id', TableController.deleteTable);

export default router;
