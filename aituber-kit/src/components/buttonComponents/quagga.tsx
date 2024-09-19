import React, { useState, useEffect, useRef, memo } from 'react';
import { IconButton } from '../iconButton';
const Quagga = require('quagga'); // QuaggaJSをインポート
import styles from './custom.module.css';

// QuaggaScannerコンポーネントのプロパティ型
interface QuaggaScannerProps {
  prevMemo: Memo[];
  updateMemos: (newMemos: Memo[]) => void;
}
interface DetectedProduct {
  barcode: string;
  category: string;
  found: boolean;
}
interface Memo {
  id: number;
  content: string;
}

const QuaggaScanner: React.FC<QuaggaScannerProps> = ({ prevMemo, updateMemos }) => {
  const [isQuaggaRunning, setIsQuaggaRunning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [opened, setOpened] = useState(true)
  // 商品情報を保存する状態を追加
  const [detectedProduct, setDetectedProduct] = useState<DetectedProduct | null>(null);

  useEffect(() => {
    if (isQuaggaRunning) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
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
          }, (err: any) => {
            if (err) {
              console.error('QuaggaJS Initialization Error:', err);
              return;
            }
            Quagga.start();
            console.log("Initializatino Finished!!");

            Quagga.onProcessed((result: { boxes: any[]; }) => {
              if (!result || typeof result !== "object" || !result.boxes) return;
              const ctx = Quagga.canvas.ctx.overlay;
              const canvas = Quagga.canvas.dom.overlay;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              Quagga.ImageDebug.drawPath(result.boxes[0], { x: 0, y: 1 }, ctx, { color: "blue", lineWidth: 5 });
            });

            // バーコードが検出されたときの処理
            Quagga.onDetected((data: { codeResult: { code: any; }; }) => {
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
          const stream = videoRef.current.srcObject as MediaStream;
          const tracks = stream.getTracks();
          tracks.forEach((track: { stop: () => any; }) => track.stop());
          videoRef.current.srcObject = null;
        }
        console.log("Stop!!");
      };
    }
  }, [isQuaggaRunning]);

  //バーコード情報をサーバーに送って買ったことがあるかを確認
  //あったらメモからそのアイテムを消す
  //無かったらユーザーが期間を入力してapi/saveitemの方でサーバーにカテゴリ，期間，コードを送る
  const fetchProductFromServer = (barcode: string) => {
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
            updateMemos(prevMemo.filter((memo) => memo.content !== categoryName));

            // 検出された商品の情報を保存
            setDetectedProduct({
              barcode: barcode,
              category: categoryName,
              found: true,
            });
          });
        } else if (response.status === 201) {
          // 商品が見つからなかった場合
          return response.json().then((data) => {
            console.log('data:', data);
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
  const promptUserForConsumptionPeriod = (categoryName: string, barcode: string) => {
    const period = prompt('この商品に対する消費期間（日数）を半角数字で入力してください（例: 30）');
    if (period) {
      // 入力がある場合は sendConsumptionPeriod を呼び出してサーバーに送信
      sendConsumptionPeriod(categoryName, barcode, period);
    } else {
      console.log('消費期間が入力されませんでした');
    }
  };

  // 後で消費期間を送信する関数
  const sendConsumptionPeriod = (categoryName: string, barcode: string, period: string) => {
    if (categoryName && barcode && period) {
      // 消費期間が保存されていて、商品が見つからなかった場合のみサーバーに送信
      fetch('http://localhost:5000/api/saveitem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: barcode,
          category: categoryName,
          consumptionPeriod: period
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

  const startQuagga = () => {
    setIsQuaggaRunning(true);
  };
  const stopQuagga = () => {
    setIsQuaggaRunning(false); // isQuaggaRunning を false に設定して QuaggaJS を停止
  };

  return (
    <div>
      {opened && (<div className="absolute z-40 w-full h-full px-24 py-40 bg-black/30 font-M_PLUS_2">
        <div className="relative mx-auto my-auto max-w-3xl max-h-full p-24 overflow-auto bg-white rounded-16">
          <IconButton
            iconName="24/Close"
            isProcessing={false}
            onClick={() => {
              setOpened(false)
            }}
            className="absolute top-8 right-8 bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled text-white"
          ></IconButton>
          <div id={styles.my_container}>
            <div id={styles.my_inner}>
              <div>= QuaggaJS =</div>
              <div>
                <button id={styles.my_start} onClick={startQuagga}>Start</button>
                <button id={styles.my_stop} onClick={stopQuagga}>Stop</button>
              </div>
              <div id={styles.my_quagga}>
                <video ref={videoRef} style={{ width: '100%', height: '100%' }} autoPlay muted></video>
                <canvas className="overlay"></canvas>
              </div>
              <div id={styles.my_result}>***</div>
              <div id={styles.my_barcode}>
                <div>***</div>
              </div>
            </div>
          </div>
        </div>
      </div>)}
    </div>
  );
};

export default QuaggaScanner;