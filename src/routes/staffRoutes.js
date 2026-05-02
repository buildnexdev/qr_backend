import express from 'express';
import StaffController from '../controllers/staffController.js';

const router = express.Router();

router.get('/', StaffController.list);
router.post('/', StaffController.create);
router.post('/:id/reset-password', StaffController.resetPassword);
router.get('/:id', StaffController.getOne);
router.put('/:id', StaffController.update);
router.delete('/:id', StaffController.remove);

export default router;
