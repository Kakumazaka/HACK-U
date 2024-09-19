require('dotenv').config();
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const PORT = 5000;
const cors = require('cors');
app.use(cors());
app.use(express.json());

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
app.use(bodyParser.urlencoded({ extended: true }));

// 商品名照会
app.post('/api/searchitem', async (req, res) => {
  //フロントエンドからbarcodeを取得
  const { code } = req.body;
  //今日の日付を取得
  const purchaseDate = getCurrentDate();
  try {
    // データベース内で商品名が一致するか確認
    const selectQuery = 'SELECT * FROM item WHERE code = $1';
    const result = await pool.query(selectQuery, [code]);
    if (result.rows.length > 0) {
      //商品名が一致する場合、puechaseDateを更新
      //PostgreSQLはカラム名を全て小文字として返すため、consumptionperiodは小文字にする。
      const consumptionPeriod = result.rows[0].consumptionperiod;
      const futurePurchaseDate = getFuturePurchaseDate(purchaseDate, consumptionPeriod);
      const updateQuery = 'UPDATE item SET purchaseDate = $1, FuturePurchaseDate = $2 WHERE code = $3';
      await pool.query(updateQuery, [purchaseDate, futurePurchaseDate, code]);
      res.status(200).json({
        message: `Product ${code} updated successfully with new purchase date and future purchase date.`,
        name: result.rows[0].name,
        code: code
      });
    } else {//一致する商品名がない場合
      try {
        console.log("connecting Yahoo API");
        const result = await yahooSerch(code);
        res.status(201).json({
          message:"Yahoo API success",
          name: result.category,
          code:code
        });
        console.log("Yahoo API success");
      } catch (error) {
        if (error.message === '該当するアイテムが見つかりません') {
          // 特定のエラーメッセージに応じた処理
          res.status(404).json({ message: error.message });  // 404 Not Foundとして返す
        } else {
          // 他のエラーの場合
          res.status(500).json({ message: 'エラーが発生しました', error: error.message });
        }
      }
    }
  } catch (error) {
    console.error('Error processing item:', error);
    res.status(500).send('Error processing item');
  }
});

async function yahooSerch(barcode) {
  // APIのエンドポイントURL
  const apiUrl = 'https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch';
  const appId = process.env.YAHOO_APP_ID;
  // クエリパラメータをURLに追加
  const urlWithParams = `${apiUrl}?appid=${appId}&jan_code=${barcode}&results=1`;

  try {
    // APIリクエストの送信
    const response = await fetch(urlWithParams);

    // レスポンスが正常かどうかを確認
    if (!response.ok) {
      throw new Error('Yahoo API error: ' + response.status);
    }

    // レスポンスのJSONデータを取得
    const data = await response.json();

    if (data.totalResultsAvailable) {
      // 必要なデータだけを抽出
      const filteredData = data.hits.length > 0 ? {
        category: data.hits[0].genreCategory.name,
        code: barcode
      } : null;

      console.log(filteredData);
      // クライアントにデータを返す
      return filteredData;
    } else {
      throw new Error('該当するアイテムが見つかりません');
    }
  } catch (error) {
    // エラーが発生した場合、エラーメッセージをクライアントに返す
    console.error('エラーが発生しました:', error);
    throw error;
  }
}

//商品をDBに追加
app.post('/api/saveitem', async (req, res) => {
  // フロントエンドから商品名、期限を取得
  const { barcode, category, consumptionPeriod } = req.body;
  // console.log(req.body);
  // console.log(barcode, category, consumptionPeriod);
  // console.log("あああああああああああああああああああああああああああああああああ");
  // 今日の日付を取得
  const purchaseDate = getCurrentDate();
  // 今日の日付を取得
  const futurePurchaseDate = getFuturePurchaseDate(purchaseDate, consumptionPeriod);
  try {
    // 新しい商品情報をDBに追加するクエリ
    const insertQuery = 'INSERT INTO item (name, code, purchaseDate, consumptionPeriod, FuturePurchaseDate) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const value = [category, barcode, purchaseDate, consumptionPeriod, futurePurchaseDate];
    const result = await pool.query(insertQuery, value);
    res.status(201).send(`New item ${category} added successfully.`);
  } catch (error) {
    console.error('Error adding new item:', error);
    res.status(500).send('Error adding new item');
  }
});

//DBのFuturePurchaseDateと一致する商品をフロントエンドに送信
app.get('/api/add-memo', async (req, res) => {
  // 今日の日付を取得
  const todayDate = getCurrentDate();
  try {
    // FuturePurchaseDateが今日の日付と一致する商品名を取得
    const query = 'SELECT name FROM item WHERE FuturePurchaseDate < $1';
    const result = await pool.query(query, [todayDate]);
    const matchingNames = result.rows.map(row => row.name);
    res.status(200).json({ matchingNames: matchingNames });
  } catch (error) {
    console.error('Error checking future purchase date:', error);
    res.status(500).send('Error checking future purchase date');
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
  date.setDate(date.getDate() + consumptionPeriod - 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0始まりのため +1
  const day = String(date.getDate()).padStart(2, '0'); // 日を2桁にする
  return `${year}-${month}-${day}`;
}

