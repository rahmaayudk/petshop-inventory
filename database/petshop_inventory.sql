-- Tabel users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel products
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category ENUM('dry_food', 'wet_food', 'snack', 'sand') NOT NULL,
    animal_type ENUM('dog', 'cat', 'all') NOT NULL,
    current_stock INT DEFAULT 0,
    min_stock_threshold INT DEFAULT 10,
    price_buy DECIMAL(10,2) NOT NULL,
    price_sell DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel transactions
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    type ENUM('in', 'out') NOT NULL,
    qty INT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Insert sample user (password: admin123)
INSERT INTO users (username, password, email) VALUES 
('admin', 'admin123', 'admin@petshop.com');

-- Insert sample products
INSERT INTO products (sku_code, name, category, animal_type, current_stock, min_stock_threshold, price_buy, price_sell) VALUES
('DOG-DRY-001', 'Royal Canin Maxi Adult', 'dry_food', 'dog', 50, 10, 250000, 350000),
('DOG-WET-001', 'Pedigree Wet Food Chicken', 'wet_food', 'dog', 30, 5, 15000, 25000),
('CAT-DRY-001', 'Whiskas Adult 1+', 'dry_food', 'cat', 40, 8, 75000, 95000),
('CAT-SNACK-001', 'Vitakraft Cat Snack', 'snack', 'cat', 100, 20, 5000, 8000),
('CAT-SAND-001', 'Bentonite Cat Litter', 'sand', 'cat', 25, 5, 45000, 65000);

-- Insert sample transactions
INSERT INTO transactions (product_id, type, qty, date) VALUES
(1, 'out', 2, DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(2, 'out', 5, DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(3, 'out', 3, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(1, 'out', 1, CURDATE()),
(4, 'out', 10, CURDATE());