import express from 'express';
import StaffController from '../controllers/staffController.js';

const router = express.Router();

router.get('/', StaffController.list);
router.get('/:id', StaffController.getOne);
router.post('/', StaffController.create);
router.put('/:id', StaffController.update);
router.delete('/:id', StaffController.remove);

export default router;
