-- Create the item table
CREATE TABLE IF NOT EXISTS item (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    purchaseDate DATE,
    consumptionPeriod INT --単位未定
);

-- Insert some sample data into item
INSERT INTO item (name, purchaseDate, consumptionPeriod)
VALUES
('Milk', '2024-09-01', 7),
('Bread', '2024-09-02', 3);