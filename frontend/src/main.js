import React, { useState, useEffect, useRef } from 'react';
import Quagga from 'quagga'; // QuaggaJSをインポート
import './custom.css';

function Main() {
  // メモ機能始まり---------------------------------------------------
  const [memos, setMemos] = useState(() => {
    const savedMemos = localStorage.getItem('memos');
    return savedMemos ? JSON.parse(savedMemos) : [];
  });
  const [newMemo, setNewMemo] = useState('');

  // 商品情報を保存する状態を追加
  const [detectedProduct, setDetectedProduct] = useState(null);

  useEffect(() => {
    localStorage.setItem('memos', JSON.stringify(memos));
  }, [memos]);


  const addMemo = () => {
    if (newMemo.trim() !== '') {
      const newMemos = [...memos, { id: Date.now(), content: newMemo }];
      setMemos(newMemos);
      setNewMemo('');
    }
  };

  const deleteMemo = (id) => {
    const filteredMemos = memos.filter((memo) => memo.id !== id);
    setMemos(filteredMemos);
  };

  const editMemo = (id, updatedContent) => {
    const updatedMemos = memos.map((memo) =>
      memo.id === id ? { ...memo, content: updatedContent } : memo
    );
    setMemos(updatedMemos);
  };
  // メモ機能終わり---------------------------------------------------

  // バーコード読み取り機能始まり--------------------------------------
  const [isQuaggaRunning, setIsQuaggaRunning] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isQuaggaRunning) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          console.log("Camera is running");

          // QuaggaJSの初期化
          console.log("Start!!");
          Quagga.init({
            inputStream: {
              name: "Live",
              type: 'LiveStream',
              constraints: {
                facingMode: 'user',
                width: 640,
                height: 480
              },
              target: videoRef.current
            },
            decoder: {
              readers: ['ean_reader'] // 使用するバーコードリーダーを指定
            }
          }, (err) => {
            if (err) {
              console.error('QuaggaJS Initialization Error:', err);
              return;
            }
            Quagga.start();
            console.log("Initializatino Finished!!");
            
            Quagga.onProcessed(result => {
              if (!result || typeof result !== "object" || !result.boxes) return;
              const ctx = Quagga.canvas.ctx.overlay;
              const canvas = Quagga.canvas.dom.overlay;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              Quagga.ImageDebug.drawPath(result.boxes[0], { x: 0, y: 1 }, ctx, { color: "blue", lineWidth: 5 });
            });

            // バーコードが検出されたときの処理
            Quagga.onDetected((data) => {
              const barcode = data.codeResult.code;
              // console.log("Barcode detected: ", data.codeResult.code);
              console.log("Barcode detected: ", data);
              //setBarcode(data.codeResult.code); // 検出されたバーコードのデータを状態に保存
              fetchProductFromYahoo(barcode); // Yahoo APIにリクエストを送信
            });
          });
        })
        .catch((err) => {
          console.error("Camera error: ", err);
        });

      // クリーンアップ関数でQuaggaJSを停止
      return () => {
        Quagga.stop();
        setIsQuaggaRunning(false);

        // カメラストリームの停止
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject;
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
        console.log("Stop!!");
      };
    }
  }, [isQuaggaRunning]);

  const startQuagga = () => {
    setIsQuaggaRunning(true);
  };
  const stopQuagga = () => {
    setIsQuaggaRunning(false); // isQuaggaRunning を false に設定して QuaggaJS を停止
  };

  const fetchProductFromYahoo = (barcode) => {
    fetch('http://localhost:3001/api/yahoo-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ barcode })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Yahoo API Response:', data);
  
        if (data.totalResultsReturned > 0) {
          const product = data.hits[0];
          setDetectedProduct(product);
        } else {
          setDetectedProduct(null);
        }
      })
      .catch(error => {
        console.error('Error fetching product from Yahoo:', error);
        setDetectedProduct(null);
      });
  };
  





  // 検出された商品情報を表示する
  const displayProduct = () => {
    if (!detectedProduct) {
      return <div>No product found</div>;
    }
    return (
      <div>
        <h2>{detectedProduct.name}</h2>
        <p>Price: {detectedProduct.price}</p>
        <img src={detectedProduct.image.medium} alt={detectedProduct.name} />
      </div>
    );
  };
  // バーコード読み取り機能終わり--------------------------------------
  return (
    <div>
      {/* メモ機能始まり--------------------------------------------------- */}
      <h1>メモ管理</h1>
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
      {/* メモ機能終わり--------------------------------------------------- */}
        
      {/* バーコード読み取り機能始まり------------------------------------ */}
      <div id="my_container">
		    <div id="my_inner">
          <div>= QuaggaJS =</div>
          <div>
            <button id="my_start" onClick={startQuagga}>Start</button>
            <button id="my_stop" onClick={stopQuagga}>Stop</button>
          </div>
          <div id="my_quagga">
            <video ref={videoRef} style={{ width: '100%', height: '100%' }}
            autoPlay
            muted>
            </video>
            <canvas className="overlay"></canvas>
          </div>
        
          <div id="my_result">***</div>
          <div id="my_barcode">
            <div>***</div>
          </div>
		    </div>
        {displayProduct()}
	    </div>

      {/* バーコード読み取り機能終わり------------------------------------ */}

    </div>
  );
}

export default Main;
