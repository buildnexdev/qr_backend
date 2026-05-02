import pool from './db.js';

async function setup() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tblBranch (
        branchID BIGINT AUTO_INCREMENT PRIMARY KEY,
        companyID BIGINT NOT NULL,
        branchName VARCHAR(255) NOT NULL,
        branchCode VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(255),
        address1 VARCHAR(255),
        address2 VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(10),
        latitude DECIMAL(10,6),
        longitude DECIMAL(10,6),
        isActive BOOLEAN DEFAULT TRUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log('Table tblBranch created successfully.');
    
    // Add extra columns if they don't exist
    try {
      await pool.query(`ALTER TABLE tblBranch ADD COLUMN branchType VARCHAR(100)`);
    } catch(e) {}
    try {
      await pool.query(`ALTER TABLE tblBranch ADD COLUMN description TEXT`);
    } catch(e) {}
    try {
      await pool.query(`ALTER TABLE tblBranch ADD COLUMN area VARCHAR(255)`);
    } catch(e) {}
    try {
      await pool.query(`ALTER TABLE tblBranch ADD COLUMN landmark VARCHAR(255)`);
    } catch(e) {}
    try {
      await pool.query(`ALTER TABLE tblBranch ADD COLUMN alternateNumber VARCHAR(20)`);
    } catch(e) {}
    try {
      await pool.query(`ALTER TABLE tblBranch ADD COLUMN whatsappNumber VARCHAR(20)`);
    } catch(e) {}
    try {
      await pool.query(`ALTER TABLE tblBranch ADD COLUMN managerName VARCHAR(255)`);
    } catch(e) {}
    try {
      await pool.query(`ALTER TABLE tblBranch ADD COLUMN managerMobile VARCHAR(20)`);
    } catch(e) {}
    try {
      await pool.query(`ALTER TABLE tblBranch ADD COLUMN managerEmail VARCHAR(255)`);
    } catch(e) {}
    try {
      await pool.query(`ALTER TABLE tblBranch ADD COLUMN managerUser BIGINT`);
    } catch(e) {}
    try {
      await pool.query(`ALTER TABLE tblBranch ADD COLUMN orderSettings JSON`);
    } catch(e) {}
    try {
      await pool.query(`ALTER TABLE tblBranch ADD COLUMN kitchenSettings JSON`);
    } catch(e) {}
    try {
      await pool.query(`ALTER TABLE tblBranch ADD COLUMN billingSettings JSON`);
    } catch(e) {}
    try {
      await pool.query(`ALTER TABLE tblBranch ADD COLUMN paymentSetup JSON`);
    } catch(e) {}
    try {
      await pool.query(`ALTER TABLE tblBranch ADD COLUMN branding JSON`);
    } catch(e) {}
    try {
      await pool.query(`ALTER TABLE tblBranch ADD COLUMN workingHours JSON`);
    } catch(e) {}
    try {
      await pool.query(`ALTER TABLE tblBranch ADD COLUMN allowOnlineOrders BOOLEAN DEFAULT FALSE`);
    } catch(e) {}
    try {
      await pool.query(`ALTER TABLE tblBranch ADD COLUMN allowQROrdering BOOLEAN DEFAULT FALSE`);
    } catch(e) {}

    console.log('Extra columns added successfully.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

setup();
