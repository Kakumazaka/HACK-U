-- -- Create the item table
DROP TABLE IF EXISTS item;
CREATE TABLE item (
    id SERIAL PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    code TEXT NOT NULL,
    purchaseDate DATE NOT NULL,
    consumptionPeriod INT NOT NULL,
    FuturePurchaseDate DATE NOT NULL
);


-- Insert some sample data into item
INSERT INTO item (category, code, purchaseDate, consumptionPeriod, FuturePurchaseDate)
VALUES
('リップクリーム', '4987241105106', '2024-09-01', 7,'2024-09-07');