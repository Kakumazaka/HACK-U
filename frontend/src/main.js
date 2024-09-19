import React, { useState, useEffect, useRef, memo } from 'react';
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
    // Webアプリ起動時にサーバーから消費期間経過したカテゴリ名を取得し、メモに追加する
    const addProductToMemoOnStartup = () => {
      fetch('http://localhost:5000/api/add-memo', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then((response) => {
        if (response.status === 200) {
          return response.json(); // カテゴリ情報をJSON形式で取得
        } else {
          throw new Error('カテゴリの取得に失敗しました');
        }
      })
      .then((data) => {
        const categoryNames = data.categories; // サーバーからのカテゴリ名リストを取得
        if (categoryNames && categoryNames.length > 0) {
          // 各カテゴリ名をメモに追加
          const newMemos = [...memos];
          categoryNames.forEach((categoryName) => {
            newMemos.push({ id: Date.now(), content: categoryName });
          });
          setMemos(newMemos); // メモに保存
        }
      })
      .catch((error) => {
        console.error('Error fetching categories on startup:', error);
      });
    };

    addProductToMemoOnStartup();

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
              fetchProductFromServer(barcode); // Yahoo APIにリクエストを送信
              stopQuagga();
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

  //バーコード情報をサーバーに送って買ったことがあるかを確認
  //あったらメモからそのアイテムを消す
  //無かったらユーザーが期間を入力してapi/saveitemの方でサーバーにカテゴリ，期間，コードを送る
  const fetchProductFromServer = (barcode) => {
    fetch('http://localhost:5000/api/searchitem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: barcode }),
    })
      .then((response) => {
        if (response.status === 200) {
          // 商品が見つかった場合
          return response.json().then((data) => {
            const categoryName = data.category; // カテゴリの名前を取得
            console.log('商品が見つかりました:', categoryName);

            // メモから同じ名前のアイテムを削除
            setMemos((prevMemos) => prevMemos.filter((memo) => memo.content !== categoryName));

            // 検出された商品の情報を保存
            setDetectedProduct({
              category: categoryName,
              found: true,
            });
          });
        } else if (response.status === 201) {
          // 商品が見つからなかった場合
          return response.json().then((data) => {
            const categoryName = data.category; // カテゴリの名前
            console.log('商品が見つかりませんでした:', categoryName, 'バーコード:', barcode);

            // 商品が見つからなかった場合に検出された情報を保存
            setDetectedProduct({
              barcode: barcode,
              category: categoryName,
              found: false,
            });

            // ユーザーに消費期間を入力してもらう
            // この場合、ダイアログを表示するなどのUI処理が必要です
            promptUserForConsumptionPeriod(categoryName, barcode);
          });
        } else if (response.status === 404) {
          // エラーが発生した場合
          console.error('商品が見つかりませんでした。エラーコード:', response.status);
          setDetectedProduct(null); // エラーハンドリングとして商品情報をクリア
        }
      })
      .catch((error) => {
        console.error('サーバーから商品情報を取得中にエラーが発生しました:', error);
        setDetectedProduct(null); // エラーハンドリングとして商品情報をクリア
      });
  };

  // ユーザーに消費期間を入力してもらうための関数
  const promptUserForConsumptionPeriod = (categoryName, barcode) => {
    const period = prompt('この商品に対する消費期間を入力してください（例: 30日）');

    if (period) {
      // 入力がある場合は sendConsumptionPeriod を呼び出してサーバーに送信
      sendConsumptionPeriod(categoryName, barcode, period);
    } else {
      console.log('消費期間が入力されませんでした');
    }
  };

  // 後で消費期間を送信する関数
  const sendConsumptionPeriod = () => {
    if (detectedProduct && !detectedProduct.found && detectedProduct.consumptionPeriod) {
      // 消費期間が保存されていて、商品が見つからなかった場合のみサーバーに送信
      fetch('http://localhost:5000/api/saveitem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          barcode: detectedProduct.barcode,
          category: detectedProduct.category,
          consumptionPeriod: detectedProduct.consumptionPeriod
        })
      })
        .then(response => response.json())
        .then(data => {
          console.log('サーバーに保存されました:', data);
        })
        .catch(error => {
          console.error('サーバーへの保存エラー:', error);
        });
    } else {
      console.log('送信する消費期間が見つかりません。');
    }
  };

  // 検出された商品情報を表示する
  const displayProduct = () => {
    if (!detectedProduct) {
      return <div>No product found</div>;
    }
    return (
      <div>
        <h2>{detectedProduct.name}</h2>
        {/* <p>Price: {detectedProduct.price}</p>
        <img src={detectedProduct.image.medium} alt={detectedProduct.name} /> */}
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
