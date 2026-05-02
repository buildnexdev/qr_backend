import UserModel from '../models/userModel.js';
import pool from '../../db.js';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your_super_secret_key_change_me';

class AuthController {
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const user = await UserModel.findByPhonenumber(username);

      if (!user) {
        return res.status(401).json({ error: 'Invalid Phonenumber' });
      }

      if (user.password !== password) {
        return res.status(401).json({ error: 'Invalid Password' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role, companyID: user.companyID, branchID: user.branchID },
        SECRET_KEY,
        { expiresIn: '24h' }
      );

      let company_name = null;
      if (user.companyID != null) {
        try {
          const [coRows] = await pool.query(
            'SELECT company_name FROM tblCompany WHERE id = ? LIMIT 1',
            [user.companyID]
          );
          if (coRows.length) company_name = coRows[0].company_name;
        } catch {
          company_name = null;
        }
      }

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          userid: user.id,
          username: user.username,
          role: user.role,
          companyid: user.companyID,
          branchid: user.branchID,
          name: user.name,
          company_name,
        }
      });

    } catch (error) {
      console.error('CRITICAL LOGIN ERROR:', error);
      res.status(500).json({ 
        error: 'An error occurred during login',
        details: error.message 
      });
    }
  }
}
export default AuthController;
