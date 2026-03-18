-- Demo users for production testing
-- Customer: customer@demo.com / demo1234
-- Admin: admin@demo.com / admin1234

INSERT INTO users (email, password, name, role) VALUES
    ('customer@demo.com', '$2b$10$6LBAs6GU9Fmi8eie13j3keJUBf6SAQvehdf6i/tuDVaxIHBi0c8Pi', 'Demo Customer', 'CUSTOMER'),
    ('admin@demo.com', '$2b$10$Z28QW.XAi7zG0srD0krAqO5T.6aAMYe6Cf3ng7f7TrC7k06Aa0RxO', 'Demo Admin', 'ADMIN')
ON CONFLICT (email) DO NOTHING;
