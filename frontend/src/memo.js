import React, { useState, useEffect } from 'react';
import Quagga from 'quagga'; // QuaggaJSをインポート

function Memo() {
  const [memos, setMemos] = useState(() => {
    const savedMemos = localStorage.getItem('memos');
    return savedMemos ? JSON.parse(savedMemos) : [];
  });
  const [newMemo, setNewMemo] = useState('');
  const [barcode, setBarcode] = useState(''); // バーコードを保存するステート
  const [scanning, setScanning] = useState(false); // スキャン中かどうか

  // メモをローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('memos', JSON.stringify(memos));
  }, [memos]);

  // バーコードスキャナを開始する関数
  const startBarcodeScanner = () => {
    setScanning(true);
    Quagga.init({
      inputStream: {
        type: 'LiveStream',
        constraints: {
          width: 640,
          height: 480,
          facingMode: 'environment' // リアカメラを使用
        }
      },
      decoder: {
        readers: ['ean_reader'] // EANコードリーダー
      }
    }, (err) => {
      if (err) {
        console.error('QuaggaJSの初期化中にエラーが発生しました:', err);
        setScanning(false);
        return;
      }
      Quagga.start();
    });

    // バーコードが検出されたときの処理
    Quagga.onDetected((data) => {
      const code = data.codeResult.code;
      console.log('バーコードが検出されました:', code);
      setBarcode(code);
      Quagga.stop(); // スキャンを停止
      setScanning(false);
      addBarcodeToMemos(code); // 検出したバーコードをメモとして追加
      sendBarcodeToServer(code); // バックエンドに送信
    });
  };

  // バーコードデータをバックエンドに送信する関数
  const sendBarcodeToServer = async (code) => {
    try {
      const response = await fetch('/api/barcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ barcode: code }),
      });
      const result = await response.json();
      console.log('サーバーからのレスポンス:', result);
    } catch (error) {
      console.error('バーコード送信中にエラーが発生しました:', error);
    }
  };

  // メモを追加する関数
  const addMemo = () => {
    if (newMemo.trim() !== '') {
      const newMemos = [...memos, { id: Date.now(), content: newMemo }];
      setMemos(newMemos);
      setNewMemo('');
    }
  };

  // メモを削除する関数
  const deleteMemo = (id) => {
    const filteredMemos = memos.filter((memo) => memo.id !== id);
    setMemos(filteredMemos);
  };

  // メモの編集を開始する関数
  const editMemo = (id, updatedContent) => {
    const updatedMemos = memos.map((memo) =>
      memo.id === id ? { ...memo, content: updatedContent } : memo
    );
    setMemos(updatedMemos);
  };

  return (
    <div>
      <h1>メモ管理</h1>

      {/* バーコードスキャンボタン */}
      <button onClick={startBarcodeScanner} disabled={scanning}>
        {scanning ? 'スキャン中...' : 'バーコードをスキャン'}
      </button>

      {/* 検出されたバーコード */}
      {barcode && <h2>検出されたバーコード: {barcode}</h2>}

      {/* 新しいメモを追加するフォーム */}
      <input 
        type="text" 
        value={newMemo} 
        onChange={(e) => setNewMemo(e.target.value)} 
        placeholder="メモを入力してください" 
      />
      <button onClick={addMemo}>メモを追加</button>

      <ul>
        {memos.map((memo) => (
          <li key={memo.id}>
            <input 
              type="text" 
              value={memo.content} 
              onChange={(e) => editMemo(memo.id, e.target.value)} 
            />
            <button onClick={() => deleteMemo(memo.id)}>削除</button>
          </li>
        ))}
      </ul>

      {/* バーコードスキャン用の表示領域 */}
      {scanning && <div id="barcode-scanner" style={{ width: '640px', height: '480px' }}></div>}
    </div>
  );
}

export default Memo;
