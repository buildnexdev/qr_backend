import express from 'express';
import RoleController from '../controllers/roleController.js';

const router = express.Router();

router.get('/', RoleController.list);
router.get('/:id', RoleController.getOne);
router.post('/', RoleController.create);
router.put('/:id', RoleController.update);
router.delete('/:id', RoleController.remove);

export default router;
