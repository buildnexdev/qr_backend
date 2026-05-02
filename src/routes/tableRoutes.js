import express from 'express';
import TableController from '../controllers/tableController.js';

const router = express.Router();

router.get('/next-code', TableController.nextCode);
router.get('/', TableController.getTables);
router.post('/add', TableController.addTable);
router.post('/', TableController.addTable);
router.get('/:id', TableController.getTable);
router.put('/:id', TableController.updateTable);
router.patch('/:id/status', TableController.patchStatus);
router.delete('/:id', TableController.deleteTable);

export default router;
