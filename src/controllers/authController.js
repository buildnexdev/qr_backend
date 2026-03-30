import UserModel from '../models/userModel.js';

class AuthController {
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const user = await UserModel.findByUsername(username);

      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Simple password comparison (consistent with schema's plain text password123)
      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Success response
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'An error occurred during login' });
    }
  }
}

export default AuthController;
