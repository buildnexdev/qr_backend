import pool from '../db.js';
async function ensureCompanyTable() {
  try {
    const [rows] = await pool.query("SHOW TABLES LIKE 'tblCompany'");
    if (rows.length === 0) {
      console.log('Creating tblCompany table...');
      await pool.query(`
        CREATE TABLE tblCompany (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_name VARCHAR(255) NOT NULL,
          company_code VARCHAR(50) UNIQUE,
          legal_name VARCHAR(255),
          business_type VARCHAR(100),
          industry_category VARCHAR(100),
          gst_number VARCHAR(50),
          pan_number VARCHAR(50),
          cin_number VARCHAR(50),
          
          address_line1 TEXT,
          address_line2 TEXT,
          area_street VARCHAR(255),
          city VARCHAR(100),
          state VARCHAR(100),
          country VARCHAR(100),
          pincode VARCHAR(20),
          map_location VARCHAR(255),
          landmark VARCHAR(255),
          
          primary_phone VARCHAR(20),
          secondary_phone VARCHAR(20),
          whatsapp_number VARCHAR(20),
          email_id VARCHAR(255),
          website_url VARCHAR(255),
          
          owner_name VARCHAR(255),
          owner_mobile VARCHAR(20),
          owner_email VARCHAR(255),
          admin_username VARCHAR(100),
          admin_password VARCHAR(255),
          
          multi_branch BOOLEAN DEFAULT FALSE,
          default_branch_name VARCHAR(255),
          branch_code_prefix VARCHAR(10),
          max_branch_limit INT DEFAULT 1,
          
          plan_name VARCHAR(50) DEFAULT 'Free',
          plan_start_date DATE,
          plan_expiry_date DATE,
          payment_status VARCHAR(50) DEFAULT 'Trial',
          amount_paid DECIMAL(10, 2) DEFAULT 0.00,
          billing_cycle VARCHAR(50) DEFAULT 'Monthly',
          
          qr_enabled BOOLEAN DEFAULT TRUE,
          table_ordering BOOLEAN DEFAULT TRUE,
          takeaway_enabled BOOLEAN DEFAULT TRUE,
          delivery_enabled BOOLEAN DEFAULT FALSE,
          token_system_enabled BOOLEAN DEFAULT FALSE,
          auto_order_accept BOOLEAN DEFAULT FALSE,
          
          currency VARCHAR(10) DEFAULT 'INR',
          tax_type VARCHAR(20) DEFAULT 'Inclusive',
          gst_default DECIMAL(5, 2) DEFAULT 5.00,
          service_charge DECIMAL(5, 2) DEFAULT 0.00,
          price_rounding BOOLEAN DEFAULT TRUE,
          
          cash_enabled BOOLEAN DEFAULT TRUE,
          upi_enabled BOOLEAN DEFAULT TRUE,
          razorpay_key_id VARCHAR(255),
          razorpay_secret VARCHAR(255),
          ccavenue_config TEXT,
          payment_auto_confirm BOOLEAN DEFAULT FALSE,
          
          invoice_prefix VARCHAR(10) DEFAULT 'INV',
          invoice_footer_note TEXT,
          print_logo BOOLEAN DEFAULT TRUE,
          thermal_print_enabled BOOLEAN DEFAULT TRUE,
          gst_invoice_enabled BOOLEAN DEFAULT TRUE,
          
          kds_enabled BOOLEAN DEFAULT FALSE,
          order_priority_system BOOLEAN DEFAULT FALSE,
          sound_alert_enabled BOOLEAN DEFAULT TRUE,
          multiple_kitchen_sections BOOLEAN DEFAULT FALSE,
          
          staff_limit INT DEFAULT 10,
          role_based_access BOOLEAN DEFAULT TRUE,
          
          inventory_enabled BOOLEAN DEFAULT FALSE,
          low_stock_alert BOOLEAN DEFAULT FALSE,
          auto_deduction BOOLEAN DEFAULT FALSE,
          unit_types TEXT,
          
          coupon_enabled BOOLEAN DEFAULT FALSE,
          auto_discount_rules BOOLEAN DEFAULT FALSE,
          promo_code_system BOOLEAN DEFAULT FALSE,
          
          delivery_radius DECIMAL(10, 2),
          delivery_charge DECIMAL(10, 2),
          free_delivery_limit DECIMAL(10, 2),
          third_party_delivery TEXT,
          
          sms_enabled BOOLEAN DEFAULT FALSE,
          email_notifications BOOLEAN DEFAULT TRUE,
          whatsapp_api_key TEXT,
          order_alerts_type VARCHAR(50) DEFAULT 'Both',
          
          company_logo TEXT,
          favicon TEXT,
          theme_color VARCHAR(20) DEFAULT '#f59e0b',
          invoice_theme VARCHAR(50) DEFAULT 'Classic',
          qr_design_style VARCHAR(50) DEFAULT 'Default',
          
          session_timeout INT DEFAULT 30,
          auto_logout_time TIME,
          login_otp_enabled BOOLEAN DEFAULT FALSE,
          ip_restriction TEXT,
          
          gst_certificate TEXT,
          fssai_license TEXT,
          business_license TEXT,
          bank_proof TEXT,
          
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);
      console.log('tblCompany table created successfully.');
    } else {
      console.log('tblCompany table already exists.');
    }
  } catch (error) {
    console.error('Error creating tblCompany table:', error);
  } finally {
    process.exit();
  }
}
ensureCompanyTable();
