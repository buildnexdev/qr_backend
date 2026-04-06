import express from 'express';
import BranchController from '../controllers/branchController.js';

const router = express.Router();

router.get('/', BranchController.getBranches);
router.get('/:id', BranchController.getBranch);
router.post('/', BranchController.addBranch);
router.put('/:id', BranchController.updateBranch);
router.delete('/:id', BranchController.deleteBranch);

export default router;
