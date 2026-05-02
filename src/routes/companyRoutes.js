import express from 'express';
import CompanyController from '../controllers/companyController.js';

const router = express.Router();

router.get('/',         CompanyController.getAll);
router.get('/:id',      CompanyController.getOne);
router.post('/',        CompanyController.create);
router.put('/:id',      CompanyController.update);
router.patch('/:id/publish', CompanyController.togglePublish);

export default router;
