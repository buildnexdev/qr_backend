import express from 'express';
import RegisterController from '../controllers/registerController.js';

const router = express.Router();

router.post('/', RegisterController.submit);

export default router;
