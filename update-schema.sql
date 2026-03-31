CREATE DATABASE IF NOT EXISTS qr_ordering;
USE qr_ordering;

-- Role Table
CREATE TABLE IF NOT EXISTS tblRole (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    permissions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff Table
CREATE TABLE IF NOT EXISTS tblStaff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address TEXT,
    place VARCHAR(255),
    role_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES tblRole(id) ON DELETE SET NULL
);

-- Categories Table
CREATE TABLE IF NOT EXISTS tblCategory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Table
CREATE TABLE IF NOT EXISTS tblMenu ( 
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT,
    description TEXT,
    image VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES tblCategory(id) ON DELETE SET NULL
);

-- Tables Table
CREATE TABLE IF NOT EXISTS tblTable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status ENUM('Available', 'Occupied', 'Reserved') DEFAULT 'Available',
    qr_code_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS tblOrder (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255),
    table_id INT,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (table_id) REFERENCES tblTable(id) ON DELETE SET NULL
);

-- Kitchen Orders (Tracks order items for the kitchen)
CREATE TABLE IF NOT EXISTS tblKitchen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    menu_id INT NOT NULL,
    quantity INT NOT NULL,
    status ENUM('Pending', 'Preparing', 'Ready', 'Served') DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES tblOrder(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES tblMenu(id) ON DELETE CASCADE
);

-- Bills (Invoices based on orders)
CREATE TABLE IF NOT EXISTS tblBill (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('Cash', 'Card', 'UPI', 'Other') DEFAULT 'Cash',
    payment_status ENUM('Pending', 'Paid') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES tblOrder(id) ON DELETE CASCADE
);

-- Stocks Table (Inventory Management)
CREATE TABLE IF NOT EXISTS tblStock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit VARCHAR(50),
    min_threshold INT DEFAULT 10,
    last_restock_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports (can be a view or specific materialized table, mostly derived from orders/bills)
-- We will just add a table to log auto-generated reports if needed
CREATE TABLE IF NOT EXISTS tblReport (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_type ENUM('Daily', 'Weekly', 'Monthly', 'Inventory') NOT NULL,
    report_data JSON,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
