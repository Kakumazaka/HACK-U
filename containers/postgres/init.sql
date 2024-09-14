-- Create the item table
CREATE TABLE IF NOT EXISTS item (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    purchaseDate DATE,
    consumptionPeriod INT --単位未定
);

-- Create the memo table
CREATE TABLE IF NOT EXISTS memo (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    item_id INT,
    FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE SET NULL
);

-- Insert some sample data into item
INSERT INTO item (name, purchaseDate, consumptionPeriod)
VALUES
('Milk', '2024-09-01', 7),
('Bread', '2024-09-02', 3);

-- Insert some sample data into memo
INSERT INTO memo (name, item_id)
VALUES
('Buy Milk', 1),
('Buy Bread', 2);