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

  let stream = null;
let isQuaggaRunning = false;  // Quaggaが動作中かどうかを管理するフラグ

$(document).ready(() => {
    console.log("Ready!!");

    $("#my_start").click(() => {
		if (isQuaggaRunning) {
			console.log("Quagga is already running.");
			return;
		}
	
		console.log("Start!!");
	
		if (!isQuaggaRunning) {
			Quagga.init({
				inputStream: {
					name: "Live",
					type: "LiveStream",
					target: document.querySelector("#my_quagga"),
					constraints: {
						facingMode: "user",  // 前面カメラを使用
						width: 640,
						height: 480
					}
				},
				decoder: {
					readers: ["ean_reader"]
				}
			}, err => {
				if (err) {
					console.error("Quagga.init error:", err);
					return;
				}
				console.log("Initialization finished!!");
				Quagga.start();
				isQuaggaRunning = true;  // Quaggaが起動したことをフラグで管理
			});
		}
	});
	

	$("#my_stop").click(() => {
		console.log("Stop!!");
		if (isQuaggaRunning) {
			Quagga.stop();
			isQuaggaRunning = false;
			if (stream) {
				//カメラのストリームを停止
				stream.getTracks().forEach(track => track.stop());
				stream = null;
				console.log("Camera stopped!!");
			}
		} else {
			console.log("Quagga is not running.");
		}
    });

    Quagga.onProcessed(result => {
        if (!result || typeof result !== "object" || !result.boxes) return;
        const ctx = Quagga.canvas.ctx.overlay;
        const canvas = Quagga.canvas.dom.overlay;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        Quagga.ImageDebug.drawPath(result.boxes[0], { x: 0, y: 1 }, ctx, { color: "blue", lineWidth: 5 });
    });

    Quagga.onDetected(result => {
        console.log(result.codeResult.code);
        $("#my_result").text(result.codeResult.code);
        $("#my_barcode div").barcode(result.codeResult.code, "ean13");
    });
});


  // バーコードデータをバックエンドに送信する関数
//   const sendBarcodeToServer = async (code) => {
//     try {
//       const response = await fetch('/api/barcode', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ barcode: code }),
//       });
//       const result = await response.json();
//       console.log('サーバーからのレスポンス:', result);
//     } catch (error) {
//       console.error('バーコード送信中にエラーが発生しました:', error);
//     }
//   };

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
