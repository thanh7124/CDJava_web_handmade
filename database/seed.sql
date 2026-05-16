-- =============================================
-- Handmade E-Commerce Seed Data
-- =============================================

USE handmade_db;

-- Seed admin user (password: admin123 - BCrypt encoded)
INSERT INTO users (username, email, password, full_name, role) VALUES
('admin', 'admin@handmade.com', '$2a$10$example_bcrypt_hash_here', 'Administrator', 'ADMIN');

-- Seed categories
INSERT INTO categories (name, description) VALUES
('Trang sức', 'Trang sức thủ công handmade'),
('Túi xách', 'Túi xách handmade từ các chất liệu tự nhiên'),
('Nến thơm', 'Nến thơm handmade với tinh dầu thiên nhiên'),
('Gốm sứ', 'Sản phẩm gốm sứ thủ công'),
('Thêu tay', 'Sản phẩm thêu tay truyền thống');

-- Seed products
INSERT INTO products (name, description, price, stock_quantity, category_id) VALUES
('Vòng tay đá tự nhiên', 'Vòng tay handmade từ đá thạch anh tự nhiên', 150000, 50, 1),
('Dây chuyền ngọc trai', 'Dây chuyền ngọc trai nước ngọt handmade', 350000, 30, 1),
('Túi cói đan tay', 'Túi cói đan tay phong cách boho', 280000, 20, 2),
('Nến thơm lavender', 'Nến thơm tinh dầu lavender thiên nhiên', 120000, 100, 3),
('Bình gốm mini', 'Bình gốm mini trang trí handmade', 200000, 40, 4),
('Tranh thêu tay hoa sen', 'Tranh thêu tay hoa sen truyền thống Việt Nam', 500000, 15, 5);
