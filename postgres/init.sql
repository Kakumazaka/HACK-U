-- -- Create the item table
DROP TABLE IF EXISTS item;
CREATE TABLE item (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    purchaseDate DATE NOT NULL,
    consumptionPeriod INT NOT NULL,
    FuturePurchaseDate DATE NOT NULL
);


-- Insert some sample data into item
INSERT INTO item (name, purchaseDate, consumptionPeriod, FuturePurchaseDate)
VALUES
('Milk', '2024-09-01', 7,'2024-09-07'),
('Bread', '2024-09-02', 3, '2024-09-04');