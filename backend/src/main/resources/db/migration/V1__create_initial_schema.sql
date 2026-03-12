-- VoltCommerce Initial Schema

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500)
);

-- Products
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    category_id BIGINT REFERENCES categories(id),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Carts
CREATE TABLE carts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Cart Items
CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT REFERENCES carts(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    UNIQUE(cart_id, product_id)
);

-- Orders
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total DECIMAL(10,2) NOT NULL,
    shipping_address TEXT NOT NULL,
    stripe_payment_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL
);

-- Indexes
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_stripe_payment_id ON orders(stripe_payment_id);

-- Seed: Categories
INSERT INTO categories (name, slug, description) VALUES
    ('Laptops', 'laptops', 'Portable computers for work and gaming'),
    ('Smartphones', 'smartphones', 'Latest mobile phones and accessories'),
    ('Audio', 'audio', 'Headphones, speakers, and audio equipment'),
    ('Gaming', 'gaming', 'Consoles, controllers, and gaming accessories'),
    ('Accessories', 'accessories', 'Cables, chargers, cases, and more'),
    ('Monitors', 'monitors', 'Displays for work and entertainment');

-- Seed: Products
INSERT INTO products (name, slug, description, price, stock, category_id, active) VALUES
    ('MacBook Pro 14"', 'macbook-pro-14', 'Apple M3 Pro chip, 18GB RAM, 512GB SSD', 1999.99, 25, 1, true),
    ('Dell XPS 15', 'dell-xps-15', 'Intel i7-13700H, 16GB RAM, 512GB SSD, OLED display', 1499.99, 30, 1, true),
    ('ThinkPad X1 Carbon', 'thinkpad-x1-carbon', 'Intel i7, 16GB RAM, 512GB SSD, business ultrabook', 1349.99, 20, 1, true),
    ('iPhone 15 Pro', 'iphone-15-pro', 'A17 Pro chip, 256GB, titanium design', 999.99, 50, 2, true),
    ('Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'Snapdragon 8 Gen 3, 256GB, S Pen included', 1199.99, 40, 2, true),
    ('Google Pixel 8 Pro', 'google-pixel-8-pro', 'Tensor G3, 128GB, best-in-class camera', 899.99, 35, 2, true),
    ('Sony WH-1000XM5', 'sony-wh-1000xm5', 'Industry-leading noise canceling headphones', 349.99, 60, 3, true),
    ('AirPods Pro 2', 'airpods-pro-2', 'Active noise cancellation, adaptive transparency, USB-C', 249.99, 80, 3, true),
    ('PlayStation 5', 'playstation-5', 'Next-gen gaming console with DualSense controller', 499.99, 15, 4, true),
    ('Xbox Series X', 'xbox-series-x', '12 teraflops of power, 1TB SSD, 4K gaming', 499.99, 20, 4, true),
    ('Nintendo Switch OLED', 'nintendo-switch-oled', '7-inch OLED screen, 64GB storage, enhanced audio', 349.99, 45, 4, true),
    ('Anker USB-C Hub', 'anker-usb-c-hub', '7-in-1 USB-C hub with HDMI, USB-A, SD card reader', 34.99, 100, 5, true),
    ('Apple MagSafe Charger', 'apple-magsafe-charger', '15W wireless charger for iPhone', 39.99, 90, 5, true),
    ('LG UltraGear 27"', 'lg-ultragear-27', '27" QHD 165Hz IPS gaming monitor', 299.99, 30, 6, true),
    ('Dell UltraSharp 32" 4K', 'dell-ultrasharp-32-4k', '32" 4K UHD IPS monitor, USB-C hub, HDR 400', 599.99, 18, 6, true);
