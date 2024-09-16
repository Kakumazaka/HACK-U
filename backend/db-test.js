const { Pool } = require('pg');

// PostgreSQLの接続設定
const pool = new Pool({
  user: 'otk1',
  host: 'localhost',
  database: 'DB',
  password: 'password0',
  port: 5432,
});

// データベース接続テスト関数
async function testDatabaseConnection() {
  try {
    // データベースに接続
    await pool.connect();
    console.log('Database connected successfully.');

    // クエリの実行
    const result = await pool.query('SELECT NOW()');
    console.log('Current time from database:', result.rows[0].now);

    // 接続を閉じる
    await pool.end();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

// テストを実行
testDatabaseConnection();
