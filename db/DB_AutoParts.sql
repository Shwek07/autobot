-- CREATE DATABASE db_autoparts;
-- \c db_autoparts;

CREATE TYPE roless AS ENUM ('Admin', 'Customer', 'Employee');
CREATE TYPE statuss AS ENUM ('active', 'cancelled', 'expired', 'completed');

CREATE TABLE users (
    user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(150),
    last_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    passwords VARCHAR(255) NOT NULL,
    roles roless DEFAULT 'Customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);


CREATE TABLE categories (
    category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);


CREATE TABLE auto_model (
    auto_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    auto_merk VARCHAR(100) NOT NULL,
    auto_model VARCHAR(100) NOT NULL,
    bouwjaar INT NOT NULL,
    engine_variant VARCHAR(100),
    body_type VARCHAR(100),
    vin VARCHAR(17),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE products (
    product_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id INT,
    product_name VARCHAR(200) NOT NULL,
    part_nummer VARCHAR(100),
    description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    product_merk VARCHAR(100),
    inkoop_prijs DECIMAL(10,2) NOT NULL,
    verkoop_prijs DECIMAL(10,2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
);


CREATE TABLE product_compatibility (
    compatibility_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id INT,
    auto_id INT,
    CONSTRAINT fk_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_auto
        FOREIGN KEY (auto_id)
        REFERENCES auto_model(auto_id)
        ON DELETE CASCADE,
    CONSTRAINT unique_product_auto
        UNIQUE (product_id, auto_id)
);


CREATE TABLE reservations (
    reservation_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT,
    product_id INT,
    quantity INT NOT NULL,
    status statuss DEFAULT 'active',
    reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),
    CONSTRAINT fk_product_res
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
);

-- for faster joins / look-ups
CREATE INDEX idx_product_category ON products(category_id);
CREATE INDEX idx_reservation_user ON reservations(user_id);
CREATE INDEX idx_product_auto_comp ON product_compatibility(product_id);
CREATE INDEX idx_auto_product_comp ON product_compatibility(auto_id);


CREATE TABLE chat_logs (
    log_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);

