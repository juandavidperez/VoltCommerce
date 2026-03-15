-- Flyway Migration to add indexes for product catalog search

-- Index for searching products by their current category (improves filter performance)
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Speed up front-end fetching by checking the active status
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

-- Full-text basic search indexes covering standard search use-cases with ILIKE
-- To optimize ILIKE we use trigram (pg_trgm extension if available).
-- For standard portability, a generic B-Tree usually cannot optimize %like% effectively.
-- The generic setup here speeds up sorted lookups and exact matches.

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
