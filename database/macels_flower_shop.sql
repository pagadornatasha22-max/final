-- ============================================================
-- MACEL'S FLOWER SHOP - DATABASE SCHEMA
-- Web-Based Flower Ordering System
-- Location: Canipaan, Hinunangan, Southern Leyte
-- Coordinates: 10.414779, 125.185361
-- ============================================================
-- Database: macels_flower_shop
-- Engine: MySQL / MariaDB
-- ============================================================

CREATE DATABASE IF NOT EXISTS macels_flower_shop;
USE macels_flower_shop;

-- ============================================================
-- 1. USERS TABLE
-- Stores both admin and customer accounts
-- ============================================================
CREATE TABLE users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    contact_number  VARCHAR(20)  NOT NULL,
    address         TEXT         NULL,
    password        VARCHAR(255) NOT NULL,
    role            ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_email (email),
    INDEX idx_users_username (username),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 2. PRODUCTS TABLE
-- Stores all flower products available in the shop
-- ============================================================
CREATE TABLE products (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    price           DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    category        ENUM('bouquet', 'dozen', 'custom') NOT NULL DEFAULT 'bouquet',
    description     TEXT NULL,
    image           LONGTEXT NULL COMMENT 'Image URL, local public path, or base64 uploaded image',
    in_stock        TINYINT(1) NOT NULL DEFAULT 1,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_products_category (category),
    INDEX idx_products_in_stock (in_stock),
    INDEX idx_products_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 3. ORDERS TABLE
-- Stores all customer orders (standard and custom)
-- ============================================================
CREATE TABLE orders (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    order_number        VARCHAR(20)  NOT NULL UNIQUE,
    customer_id         INT          NOT NULL,
    customer_name       VARCHAR(150) NOT NULL,
    contact_number      VARCHAR(20)  NOT NULL,
    email               VARCHAR(150) NOT NULL,
    total_amount        DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    pickup_date         DATE         NOT NULL,
    pickup_time         VARCHAR(20)  NOT NULL,
    message_card        TEXT         NULL,
    payment_method      VARCHAR(20)  NOT NULL DEFAULT 'gcash',
    gcash_ref_number    VARCHAR(13)  NULL,
    gcash_receipt_image LONGTEXT     NULL COMMENT 'Base64 encoded receipt image',
    payment_status      ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' COMMENT 'Admin e-wallet receipt verification',
    is_custom_order     TINYINT(1)   NOT NULL DEFAULT 0,
    status              ENUM('pending', 'preparing', 'ready', 'completed') NOT NULL DEFAULT 'pending',
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_orders_order_number (order_number),
    INDEX idx_orders_customer_id (customer_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_pickup_date (pickup_date),
    INDEX idx_orders_payment_method (payment_method),
    INDEX idx_orders_payment_status (payment_status),
    INDEX idx_orders_gcash_ref (gcash_ref_number),
    INDEX idx_orders_is_custom (is_custom_order),
    INDEX idx_orders_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 4. ORDER ITEMS TABLE
-- Stores the products in each standard order (junction table)
-- ============================================================
CREATE TABLE order_items (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    order_id        INT NOT NULL,
    product_id      INT NOT NULL,
    product_name    VARCHAR(200) NOT NULL COMMENT 'Snapshot of product name at time of order',
    product_price   DECIMAL(10, 2) NOT NULL COMMENT 'Snapshot of price at time of order',
    product_image   LONGTEXT NULL COMMENT 'Snapshot of product image at time of order',
    quantity        INT NOT NULL DEFAULT 1,
    subtotal        DECIMAL(10, 2) GENERATED ALWAYS AS (product_price * quantity) STORED,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_order_items_order_id (order_id),
    INDEX idx_order_items_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 5. CUSTOM ARRANGEMENTS TABLE
-- Stores custom flower arrangement details for custom orders
-- ============================================================
CREATE TABLE custom_arrangements (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    order_id            INT NOT NULL UNIQUE,
    description         TEXT NOT NULL COMMENT 'Customer vision description',
    style               VARCHAR(50) NOT NULL COMMENT 'bouquet, box, basket, vase, heart, cascade, crown, other',
    occasion            VARCHAR(50) NOT NULL COMMENT 'birthday, anniversary, wedding, valentines, graduation, baby, sympathy, gift, other',
    budget_min          DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    budget_max          DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    additional_notes    TEXT NULL,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_custom_arrangements_order FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_custom_arrangements_order_id (order_id),
    INDEX idx_custom_arrangements_style (style),
    INDEX idx_custom_arrangements_occasion (occasion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 6. CUSTOM ARRANGEMENT FLOWER TYPES (many-to-many style)
-- Stores selected flower types for a custom arrangement
-- ============================================================
CREATE TABLE custom_arrangement_flowers (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    custom_arrangement_id   INT NOT NULL,
    flower_type             VARCHAR(50) NOT NULL COMMENT 'roses, tulips, sunflowers, lilies, orchids, carnations, daisies, hydrangeas, peonies, babys-breath, lavender, mixed',

    CONSTRAINT fk_ca_flowers_arrangement FOREIGN KEY (custom_arrangement_id) REFERENCES custom_arrangements(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_ca_flowers_arrangement_id (custom_arrangement_id),
    INDEX idx_ca_flowers_type (flower_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 7. CUSTOM ARRANGEMENT COLORS (many-to-many style)
-- Stores selected colors for a custom arrangement
-- ============================================================
CREATE TABLE custom_arrangement_colors (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    custom_arrangement_id   INT NOT NULL,
    color                   VARCHAR(30) NOT NULL COMMENT 'red, pink, white, yellow, orange, purple, blue, peach, lavender, mixed',

    CONSTRAINT fk_ca_colors_arrangement FOREIGN KEY (custom_arrangement_id) REFERENCES custom_arrangements(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_ca_colors_arrangement_id (custom_arrangement_id),
    INDEX idx_ca_colors_color (color)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 8. CUSTOM ARRANGEMENT REFERENCE IMAGES
-- Stores uploaded reference/sample images for custom arrangements
-- ============================================================
CREATE TABLE custom_arrangement_images (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    custom_arrangement_id   INT NOT NULL,
    image_data              LONGTEXT NOT NULL COMMENT 'Base64 encoded reference image',
    sort_order              INT NOT NULL DEFAULT 0,
    created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ca_images_arrangement FOREIGN KEY (custom_arrangement_id) REFERENCES custom_arrangements(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_ca_images_arrangement_id (custom_arrangement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 9. REVIEWS TABLE
-- Stores customer reviews for completed orders
-- ============================================================
CREATE TABLE reviews (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    order_id        INT NOT NULL UNIQUE,
    customer_id     INT NOT NULL,
    rating          TINYINT NOT NULL COMMENT '1 to 5 stars',
    comment         TEXT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reviews_order FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_reviews_rating CHECK (rating >= 1 AND rating <= 5),

    INDEX idx_reviews_order_id (order_id),
    INDEX idx_reviews_customer_id (customer_id),
    INDEX idx_reviews_rating (rating),
    INDEX idx_reviews_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 10. CART TABLE
-- Stores items in customer shopping carts (persistent cart)
-- ============================================================
CREATE TABLE cart_items (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    customer_id     INT NOT NULL,
    product_id      INT NOT NULL,
    quantity        INT NOT NULL DEFAULT 1,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_cart_customer FOREIGN KEY (customer_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uk_cart_customer_product (customer_id, product_id),

    INDEX idx_cart_customer_id (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- INSERT DEFAULT ADMIN USER
-- Username: admin | Password: admin123
-- NOTE: In production, use password hashing (bcrypt/argon2)
-- ============================================================
INSERT INTO users (full_name, email, username, contact_number, address, password, role) VALUES
('Macel Admin', 'admin@macelsflowershop.com', 'admin', '09123456789', 'Purok E, Brgy. Canipaan, Hinunangan, Southern Leyte', 'admin123', 'admin');


-- ============================================================
-- INSERT DEFAULT PRODUCTS
-- ============================================================
INSERT INTO products (name, price, category, description, image, in_stock) VALUES
('Pink Rose Elegance Bouquet', 850.00, 'bouquet',
 'A stunning bouquet of fresh pink and white roses wrapped in elegant kraft paper with a satin ribbon. Perfect for birthdays, anniversaries, or just to brighten someone''s day.',
 '/images/bouquet1.jpg', 1),

('Classic Red Romance Bouquet', 1200.00, 'bouquet',
 'Express your love with this timeless bouquet of red roses accented with delicate baby''s breath. Wrapped in premium paper for an unforgettable impression.',
 '/images/bouquet2.jpg', 1),

('Sunshine Sunflower Bouquet', 750.00, 'bouquet',
 'Brighten any room with this cheerful sunflower bouquet with lush greenery. A perfect gift to spread happiness and warmth.',
 '/images/bouquet3.jpg', 1),

('One Dozen Red Roses', 1500.00, 'dozen',
 'A classic arrangement of 12 long-stemmed red roses in an elegant glass vase. The ultimate symbol of love and passion.',
 '/images/dozen1.jpg', 1),

('One Dozen Pink Tulips', 1350.00, 'dozen',
 'A beautiful collection of 12 fresh pink tulips elegantly wrapped. Symbolizing perfect happiness and spring freshness.',
 '/images/dozen2.jpg', 1),

('One Dozen Mixed Roses', 1400.00, 'dozen',
 'A stunning arrangement of 12 mixed-color roses including red, pink, white, and yellow. Perfect for any celebration.',
 '/images/bouquet1.jpg', 1),

('Luxury Flower Box', 2500.00, 'custom',
 'A premium custom flower arrangement in a decorative box featuring mixed roses, lilies, and orchids. Perfect for special occasions.',
 '/images/custom1.jpg', 1),

('Heart-Shaped Rose Arrangement', 2800.00, 'custom',
 'A romantic heart-shaped arrangement made with red and pink roses. The ultimate expression of love for Valentine''s Day or anniversaries.',
 '/images/custom2.jpg', 1),

('Custom Wedding Bouquet', 3000.00, 'custom',
 'A bespoke wedding bouquet tailored to your preference. Choose your flowers, colors, and style for your perfect day.',
 '/images/bouquet2.jpg', 1);


-- ============================================================
-- USEFUL VIEWS
-- ============================================================

-- View: Order summary with customer info and review
CREATE OR REPLACE VIEW vw_order_summary AS
SELECT
    o.id AS order_id,
    o.order_number,
    o.customer_id,
    o.customer_name,
    o.contact_number,
    o.email,
    o.total_amount,
    o.pickup_date,
    o.pickup_time,
    o.message_card,
    o.payment_method,
    o.gcash_ref_number,
    o.payment_status,
    o.is_custom_order,
    o.status,
    o.created_at AS order_date,
    o.updated_at,
    r.rating AS review_rating,
    r.comment AS review_comment,
    r.created_at AS review_date,
    (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
FROM orders o
LEFT JOIN reviews r ON r.order_id = o.id
ORDER BY o.created_at DESC;


-- View: Product sales stats
CREATE OR REPLACE VIEW vw_product_sales AS
SELECT
    p.id AS product_id,
    p.name AS product_name,
    p.category,
    p.price AS current_price,
    p.in_stock,
    COALESCE(SUM(oi.quantity), 0) AS total_sold,
    COALESCE(SUM(oi.subtotal), 0) AS total_revenue,
    COUNT(DISTINCT oi.order_id) AS order_count
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'completed'
GROUP BY p.id, p.name, p.category, p.price, p.in_stock
ORDER BY total_sold DESC;


-- View: Customer review summary
CREATE OR REPLACE VIEW vw_review_summary AS
SELECT
    r.id AS review_id,
    r.order_id,
    o.order_number,
    r.customer_id,
    u.full_name AS customer_name,
    r.rating,
    r.comment,
    r.created_at AS review_date,
    o.total_amount AS order_total,
    o.is_custom_order,
    o.status AS order_status
FROM reviews r
JOIN orders o ON o.id = r.order_id
JOIN users u ON u.id = r.customer_id
ORDER BY r.created_at DESC;


-- View: Dashboard stats
CREATE OR REPLACE VIEW vw_dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM orders) AS total_orders,
    (SELECT COUNT(*) FROM orders WHERE status = 'pending') AS pending_orders,
    (SELECT COUNT(*) FROM orders WHERE status = 'preparing') AS preparing_orders,
    (SELECT COUNT(*) FROM orders WHERE status = 'ready') AS ready_orders,
    (SELECT COUNT(*) FROM orders WHERE status = 'completed') AS completed_orders,
    (SELECT COUNT(*) FROM orders WHERE is_custom_order = 1) AS custom_orders,
    (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'completed') AS total_sales,
    (SELECT COUNT(*) FROM users WHERE role = 'customer') AS total_customers,
    (SELECT COUNT(*) FROM products) AS total_products,
    (SELECT COUNT(*) FROM products WHERE in_stock = 1) AS in_stock_products,
    (SELECT COUNT(*) FROM reviews) AS total_reviews,
    (SELECT COALESCE(AVG(rating), 0) FROM reviews) AS average_rating;


-- ============================================================
-- STORED PROCEDURES
-- ============================================================

-- Procedure: Generate order number (MFS-YYMMDD-XXXX)
DELIMITER //
CREATE PROCEDURE sp_generate_order_number(OUT new_order_number VARCHAR(20))
BEGIN
    DECLARE rand_part INT;
    SET rand_part = FLOOR(RAND() * 10000);
    SET new_order_number = CONCAT(
        'MFS-',
        DATE_FORMAT(NOW(), '%y%m%d'),
        '-',
        LPAD(rand_part, 4, '0')
    );
END //
DELIMITER ;


-- Procedure: Place a standard order
DELIMITER //
CREATE PROCEDURE sp_place_order(
    IN p_customer_id INT,
    IN p_customer_name VARCHAR(150),
    IN p_contact_number VARCHAR(20),
    IN p_email VARCHAR(150),
    IN p_total_amount DECIMAL(10,2),
    IN p_pickup_date DATE,
    IN p_pickup_time VARCHAR(20),
    IN p_message_card TEXT,
    IN p_gcash_ref_number VARCHAR(13),
    IN p_gcash_receipt_image LONGTEXT,
    OUT p_order_id INT,
    OUT p_order_number VARCHAR(20)
)
BEGIN
    CALL sp_generate_order_number(p_order_number);

    INSERT INTO orders (
        order_number, customer_id, customer_name, contact_number, email,
        total_amount, pickup_date, pickup_time, message_card,
        payment_method, gcash_ref_number, gcash_receipt_image, payment_status,
        is_custom_order, status
    ) VALUES (
        p_order_number, p_customer_id, p_customer_name, p_contact_number, p_email,
        p_total_amount, p_pickup_date, p_pickup_time, p_message_card,
        'gcash', p_gcash_ref_number, p_gcash_receipt_image, 'pending',
        0, 'pending'
    );

    SET p_order_id = LAST_INSERT_ID();
END //
DELIMITER ;


-- Procedure: Add item to an order
DELIMITER //
CREATE PROCEDURE sp_add_order_item(
    IN p_order_id INT,
    IN p_product_id INT,
    IN p_quantity INT
)
BEGIN
    DECLARE v_product_name VARCHAR(200);
    DECLARE v_product_price DECIMAL(10,2);
    DECLARE v_product_image VARCHAR(500);

    SELECT name, price, image
    INTO v_product_name, v_product_price, v_product_image
    FROM products WHERE id = p_product_id;

    INSERT INTO order_items (order_id, product_id, product_name, product_price, product_image, quantity)
    VALUES (p_order_id, p_product_id, v_product_name, v_product_price, v_product_image, p_quantity);
END //
DELIMITER ;


-- Procedure: Place a custom order
DELIMITER //
CREATE PROCEDURE sp_place_custom_order(
    IN p_customer_id INT,
    IN p_customer_name VARCHAR(150),
    IN p_contact_number VARCHAR(20),
    IN p_email VARCHAR(150),
    IN p_budget_min DECIMAL(10,2),
    IN p_budget_max DECIMAL(10,2),
    IN p_pickup_date DATE,
    IN p_pickup_time VARCHAR(20),
    IN p_message_card TEXT,
    IN p_gcash_ref_number VARCHAR(13),
    IN p_gcash_receipt_image LONGTEXT,
    IN p_description TEXT,
    IN p_style VARCHAR(50),
    IN p_occasion VARCHAR(50),
    IN p_additional_notes TEXT,
    OUT p_order_id INT,
    OUT p_order_number VARCHAR(20),
    OUT p_custom_arrangement_id INT
)
BEGIN
    CALL sp_generate_order_number(p_order_number);

    INSERT INTO orders (
        order_number, customer_id, customer_name, contact_number, email,
        total_amount, pickup_date, pickup_time, message_card,
        payment_method, gcash_ref_number, gcash_receipt_image, payment_status,
        is_custom_order, status
    ) VALUES (
        p_order_number, p_customer_id, p_customer_name, p_contact_number, p_email,
        p_budget_min, p_pickup_date, p_pickup_time, p_message_card,
        'gcash', p_gcash_ref_number, p_gcash_receipt_image, 'pending',
        1, 'pending'
    );

    SET p_order_id = LAST_INSERT_ID();

    INSERT INTO custom_arrangements (order_id, description, style, occasion, budget_min, budget_max, additional_notes)
    VALUES (p_order_id, p_description, p_style, p_occasion, p_budget_min, p_budget_max, p_additional_notes);

    SET p_custom_arrangement_id = LAST_INSERT_ID();
END //
DELIMITER ;


-- Procedure: Update order status
DELIMITER //
CREATE PROCEDURE sp_update_order_status(
    IN p_order_id INT,
    IN p_new_status ENUM('pending', 'preparing', 'ready', 'completed')
)
BEGIN
    UPDATE orders
    SET status = p_new_status, updated_at = NOW()
    WHERE id = p_order_id;
END //
DELIMITER ;


-- Procedure: Submit a review
DELIMITER //
CREATE PROCEDURE sp_submit_review(
    IN p_order_id INT,
    IN p_customer_id INT,
    IN p_rating TINYINT,
    IN p_comment TEXT
)
BEGIN
    -- Only allow review for completed orders
    DECLARE v_status VARCHAR(20);
    SELECT status INTO v_status FROM orders WHERE id = p_order_id;

    IF v_status = 'completed' THEN
        INSERT INTO reviews (order_id, customer_id, rating, comment)
        VALUES (p_order_id, p_customer_id, p_rating, p_comment)
        ON DUPLICATE KEY UPDATE rating = p_rating, comment = p_comment;
    END IF;
END //
DELIMITER ;


-- ============================================================
-- SAMPLE QUERIES FOR REFERENCE
-- ============================================================

-- Get all pending orders with items
-- SELECT o.*, oi.product_name, oi.quantity, oi.subtotal
-- FROM orders o
-- LEFT JOIN order_items oi ON oi.order_id = o.id
-- WHERE o.status = 'pending'
-- ORDER BY o.created_at DESC;

-- Get customer order history with reviews
-- SELECT o.order_number, o.total_amount, o.status, o.pickup_date,
--        r.rating, r.comment
-- FROM orders o
-- LEFT JOIN reviews r ON r.order_id = o.id
-- WHERE o.customer_id = ?
-- ORDER BY o.created_at DESC;

-- Get custom order with all details
-- SELECT o.*, ca.*, caf.flower_type, cac.color
-- FROM orders o
-- JOIN custom_arrangements ca ON ca.order_id = o.id
-- LEFT JOIN custom_arrangement_flowers caf ON caf.custom_arrangement_id = ca.id
-- LEFT JOIN custom_arrangement_colors cac ON cac.custom_arrangement_id = ca.id
-- WHERE o.id = ?;

-- Get average rating and review count
-- SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
-- FROM reviews;

-- Get sales report by date range
-- SELECT DATE(created_at) as order_date,
--        COUNT(*) as order_count,
--        SUM(total_amount) as daily_sales
-- FROM orders
-- WHERE status = 'completed'
--   AND created_at BETWEEN ? AND ?
-- GROUP BY DATE(created_at)
-- ORDER BY order_date DESC;

-- Search orders by GCash reference number
-- SELECT * FROM orders WHERE gcash_ref_number = ?;

-- Get top-rated reviews
-- SELECT r.rating, r.comment, u.full_name, o.order_number
-- FROM reviews r
-- JOIN users u ON u.id = r.customer_id
-- JOIN orders o ON o.id = r.order_id
-- ORDER BY r.rating DESC, r.created_at DESC
-- LIMIT 10;
