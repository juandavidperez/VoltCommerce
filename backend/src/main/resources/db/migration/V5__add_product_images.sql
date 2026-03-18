-- Add product images from Unsplash (free license)

UPDATE products SET image_url = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop' WHERE slug = 'macbook-pro-14';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=600&fit=crop' WHERE slug = 'dell-xps-15';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&h=600&fit=crop' WHERE slug = 'thinkpad-x1-carbon';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop' WHERE slug = 'iphone-15-pro';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&h=600&fit=crop' WHERE slug = 'samsung-galaxy-s24-ultra';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop' WHERE slug = 'google-pixel-8-pro';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop' WHERE slug = 'sony-wh-1000xm5';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1606741965326-cb990ae01bb2?w=600&h=600&fit=crop' WHERE slug = 'airpods-pro-2';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=600&fit=crop' WHERE slug = 'playstation-5';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600&h=600&fit=crop' WHERE slug = 'xbox-series-x';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&h=600&fit=crop' WHERE slug = 'nintendo-switch-oled';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&h=600&fit=crop' WHERE slug = 'anker-usb-c-hub';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1628815113969-0487917e8b76?w=600&h=600&fit=crop' WHERE slug = 'apple-magsafe-charger';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&h=600&fit=crop' WHERE slug = 'lg-ultragear-27';
UPDATE products SET image_url = 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&h=600&fit=crop' WHERE slug = 'dell-ultrasharp-32-4k';

-- Add category images
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop' WHERE slug = 'laptops';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop' WHERE slug = 'smartphones';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop' WHERE slug = 'audio';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=300&fit=crop' WHERE slug = 'gaming';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=300&fit=crop' WHERE slug = 'accessories';
UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop' WHERE slug = 'monitors';
