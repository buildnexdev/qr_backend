import pool from '../../db.js';

class BranchModel {
  static async getAll() {
    const [rows] = await pool.query(
      'SELECT * FROM tblBranch ORDER BY branchID DESC'
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM tblBranch WHERE branchID = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async create(data) {
    // Basic defaults
    const companyID = data.companyID || 1; // Assuming a single company context or provided by req
    
    // Convert objects to JSON strings
    const orderSettings = data.orderSettings ? JSON.stringify(data.orderSettings) : null;
    const kitchenSettings = data.kitchenSettings ? JSON.stringify(data.kitchenSettings) : null;
    const billingSettings = data.billingSettings ? JSON.stringify(data.billingSettings) : null;
    const paymentSetup = data.paymentSetup ? JSON.stringify(data.paymentSetup) : null;
    const branding = data.branding ? JSON.stringify(data.branding) : null;
    const workingHours = data.workingHours ? JSON.stringify(data.workingHours) : null;

    const [result] = await pool.query(
      `INSERT INTO tblBranch (
        companyID, branchName, branchCode, branchType, description,
        phone, alternateNumber, email, whatsappNumber,
        address1, address2, area, city, state, pincode, landmark, latitude, longitude,
        managerName, managerMobile, managerEmail, managerUser,
        orderSettings, kitchenSettings, billingSettings, paymentSetup, branding, workingHours,
        allowOnlineOrders, allowQROrdering, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyID, data.branchName, data.branchCode, data.branchType, data.description,
        data.phone, data.alternateNumber, data.email, data.whatsappNumber,
        data.address1, data.address2, data.area, data.city, data.state, data.pincode, data.landmark, data.latitude || null, data.longitude || null,
        data.managerName, data.managerMobile, data.managerEmail, data.managerUser || null,
        orderSettings, kitchenSettings, billingSettings, paymentSetup, branding, workingHours,
        data.allowOnlineOrders ? 1 : 0, data.allowQROrdering ? 1 : 0, data.isActive === false ? 0 : 1
      ]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const orderSettings = data.orderSettings ? JSON.stringify(data.orderSettings) : null;
    const kitchenSettings = data.kitchenSettings ? JSON.stringify(data.kitchenSettings) : null;
    const billingSettings = data.billingSettings ? JSON.stringify(data.billingSettings) : null;
    const paymentSetup = data.paymentSetup ? JSON.stringify(data.paymentSetup) : null;
    const branding = data.branding ? JSON.stringify(data.branding) : null;
    const workingHours = data.workingHours ? JSON.stringify(data.workingHours) : null;

    const [result] = await pool.query(
      `UPDATE tblBranch SET
        branchName = ?, branchCode = ?, branchType = ?, description = ?,
        phone = ?, alternateNumber = ?, email = ?, whatsappNumber = ?,
        address1 = ?, address2 = ?, area = ?, city = ?, state = ?, pincode = ?, landmark = ?, latitude = ?, longitude = ?,
        managerName = ?, managerMobile = ?, managerEmail = ?, managerUser = ?,
        orderSettings = ?, kitchenSettings = ?, billingSettings = ?, paymentSetup = ?, branding = ?, workingHours = ?,
        allowOnlineOrders = ?, allowQROrdering = ?, isActive = ?
       WHERE branchID = ?`,
      [
        data.branchName, data.branchCode, data.branchType, data.description,
        data.phone, data.alternateNumber, data.email, data.whatsappNumber,
        data.address1, data.address2, data.area, data.city, data.state, data.pincode, data.landmark, data.latitude || null, data.longitude || null,
        data.managerName, data.managerMobile, data.managerEmail, data.managerUser || null,
        orderSettings, kitchenSettings, billingSettings, paymentSetup, branding, workingHours,
        data.allowOnlineOrders ? 1 : 0, data.allowQROrdering ? 1 : 0, data.isActive === false ? 0 : 1,
        id
      ]
    );
    return result.affectedRows;
  }

  static async deleteById(id) {
    const [result] = await pool.query('DELETE FROM tblBranch WHERE branchID = ?', [id]);
    return result.affectedRows;
  }
}

export default BranchModel;
