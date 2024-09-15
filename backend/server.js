const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const PORT = 5000;

//app.get("/", (req, res) => {
//    res.send("Hello Express");
//})

//サーバー起動
app.listen(PORT, () => {
    console.log("server is running on PORT " + PORT);
})

// PostgreSQLの接続設定
const pool = new Pool({
    user: 'your_db_user',
    host: 'localhost',
    database: 'your_db_name',
    password: 'your_db_password',
    port: 5432,
  });

  //ミドルウェアの設定
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// 商品情報を取得する (期限が切れている商品を取得)
//app.get('/', async (req, res) => {
//    try {
//      const currentDate = new Date();
//       const query = 'SELECT name FROM products WHERE consumptionPeriod < $1';
//       const result = await pool.query(query, [currentDate]);
//       const expiredItems = result.rows.map(row => row.name);
//       res.json(expiredItems);
//     } catch (error) {
//       console.error('Error fetching items:', error);
//       res.status(500).send('Error fetching items');
//     }
//   });
  
  // 新しい商品情報をDBに追加する
  app.post('/add-item', async (req, res) => {
    //フロントエンドから商品名を取得したと仮定してコードを書く
    const { name } = req.body;

    //今日の日付を取得
    const purchaseDate = getCurrentDate()
  
    try {
      const query = 'INSERT INTO products (name, purchaseDate, consumptionPeriod) VALUES ($1, $2, $3)';
      await pool.query(query, [name, purchaseDate, consumptionPeriod]);
      res.status(201).send('Item added successfully');
    } catch (error) {
      console.error('Error adding item:', error);
      res.status(500).send('Error adding item');
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