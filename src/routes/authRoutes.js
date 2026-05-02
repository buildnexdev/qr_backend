import express from 'express';
import AuthController from '../controllers/authController.js';

const router = express.Router();

router.post('/login', AuthController.login);
router.get('/login', (req, res) => {
  res.status(405).json({ 
    error: 'Method Not Allowed', 
    message: 'Please use POST for login. If you are seeing this after a redirect, ensure your frontend is using the correct HTTPS URL.' 
  });
});

export default router;
