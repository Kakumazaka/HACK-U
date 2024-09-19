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
('Milk', '1111', '2024-09-01', 7,'2024-09-07'),
('Bread', '1212', '2024-09-02', 3, '2024-09-04'),
('歯間ブラシ', '4987072025895', '2024-09-02', 3, '2024-09-04');