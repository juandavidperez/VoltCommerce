-- Add index for fast retrieval of user orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Add index for fast filtering by order status (useful for Admin dashboard)
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Add index for matching Stripe Webhooks quickly
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_id ON orders(stripe_payment_id);
