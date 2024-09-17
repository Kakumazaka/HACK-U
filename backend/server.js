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
    user: 'user',
    host: 'localhost',
    database: 'DB',
    password: 'password',
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
      //商品名が一致する場合、puechaseDateを更新
      //PostgreSQLはカラム名を全て小文字として返すため、consumptionperiodは小文字にする。
      const consumptionPeriod = result.rows[0].consumptionperiod;
      const futurePurchaseDate = getFuturePurchaseDate(purchaseDate, consumptionPeriod);  
      const updateQuery = 'UPDATE item SET purchaseDate = $1, FuturePurchaseDate = $2 WHERE name = $3';
      await pool.query(updateQuery, [purchaseDate, futurePurchaseDate, name]);
      res.status(200).send(`Product ${name} updated successfully with new purchase date and future purchase date.`);
    } else {
      res.status(404).send(`No matching product found for name: ${name}`);
      name: name //フロントエンドに商品名を返す
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
    // 今日の日付を取得
    const futurePurchaseDate = getFuturePurchaseDate(purchaseDate, consumptionPeriod);
    try {
      // 新しい商品情報をDBに追加するクエリ
      const insertQuery = 'INSERT INTO item (name, purchaseDate, consumptionPeriod, FuturePurchaseDate) VALUES ($1, $2, $3, $4) RETURNING *';
      const value = [name, purchaseDate, consumptionPeriod, futurePurchaseDate];
      const result = await pool.query(insertQuery, value);
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

//今日の日付からFuturePurchaseDateを計算する関数
function getFuturePurchaseDate(purchaseDate, consumptionPeriod) {
  const date = new Date(purchaseDate);
  // 消費期間を加算する
  date.setDate(date.getDate() + consumptionPeriod);
    
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0始まりのため +1
  const day = String(date.getDate()).padStart(2, '0'); // 日を2桁にする
  return `${year}-${month}-${day}`;
}

