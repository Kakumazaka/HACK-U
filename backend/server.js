const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const PORT = 5000;

//サーバー起動
app.listen(PORT, () => {
    console.log("server is running on PORT " + PORT);
})

// PostgreSQLの接続設定
const pool = new Pool({
    user: 'otk1',
    host: 'localhost',
    database: 'DB',
    password: 'password0',
    port: 5432,
  });

  //ミドルウェアの設定
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
  
// 商品名照会
app.post('/add-item', async (req, res) => {
    //フロントエンドから商品名を取得
    const { name } = req.body;
    //今日の日付を取得
    const purchaseDate = getCurrentDate();
  
    try {
        // データベース内で商品名が一致するか確認
        const selectQuery = 'SELECT * FROM item WHERE name = $1';
        const result = await pool.query(selectQuery, [name]);
        if (result.rows.length > 0) {
            // 商品名が一致する場合、purchaseDateを更新
            const updateQuery = 'UPDATE item SET purchaseDate = $1 WHERE name = $2';
            await pool.query(updateQuery, [purchaseDate, name]);
            res.status(200).send(`Product ${name} updated successfully with new purchase date.`);
        } else {
            // 商品名が一致しない場合、フロントエンドに通知
            res.status(404).send(`No matching product found for name: ${name}`);
        }
    } catch (error) {
        console.error('Error processing item:', error);
        res.status(500).send('Error processing item');
    }
});

//商品をDBに追加
app.post('/add-new-item', async (req, res) => {
    // フロントエンドから商品名、期限を取得
    const { name, consumptionPeriod } = req.body;
  
    // 今日の日付を取得
    const purchaseDate = getCurrentDate();
  
    try {
      // 新しい商品情報をDBに追加するクエリ
      const insertQuery = 'INSERT INTO item (name, purchaseDate, consumptionPeriod) VALUES ($1, $2, $3)';
      await pool.query(insertQuery, [name, purchaseDate, consumptionPeriod]);
      res.status(201).send(`New item ${name} added successfully.`);
    } catch (error) {
      console.error('Error adding new item:', error);
      res.status(500).send('Error adding new item');
    }
  });

//今日の日付をYYYY-MM-DDの形で取得
function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // 月は0始まりのため +1
    const day = String(today.getDate()).padStart(2, '0'); // 日を2桁にする
    return `${year}-${month}-${day}`;
  }