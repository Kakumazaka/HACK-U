import React, { useState, useEffect, useRef, memo } from 'react';
import { IconButton } from '../iconButton';
const Quagga = require('quagga'); // QuaggaJSをインポート

// QuaggaScannerコンポーネントのプロパティ型
interface QuaggaScannerProps {
  onDetected: (barcode: string) => void;
}

const QuaggaScanner: React.FC<QuaggaScannerProps> = ({ onDetected }) => {
  const [isQuaggaRunning, setIsQuaggaRunning] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [opened, setOpened] = useState(true)

  useEffect(() => {
    if (isQuaggaRunning) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }

          Quagga.init({
            inputStream: {
              name: 'Live',
              type: 'LiveStream',
              constraints: {
                facingMode: 'user',
                width: 640,
                height: 480,
              },
              target: videoRef.current,
            },
            decoder: {
              readers: ['ean_reader'],
            },
          }, (err: any) => {
            if (err) {
              console.error('QuaggaJS Initialization Error:', err);
              return;
            }
            Quagga.start();

            Quagga.onDetected((data: { codeResult: { code: any; }; }) => {
              const barcode = data.codeResult.code;
              onDetected(barcode);  // 親コンポーネントにバーコードを渡す
              stopQuagga();
            });
          });
        })
        .catch((err) => {
          console.error('Camera error: ', err);
        });

      return () => {
        Quagga.stop();
        setIsQuaggaRunning(false);

        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
      };
    }
  }, [isQuaggaRunning]);

  const startQuagga = () => {
    setIsQuaggaRunning(true);
  };
  const stopQuagga = () => {
    setIsQuaggaRunning(false);
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
          <h1>Quagga バーコードスキャナー</h1>
          <button onClick={startQuagga}>スキャナー開始</button>
          <button onClick={stopQuagga}>スキャナー停止</button>
          <video ref={videoRef} style={{ width: '100%', height: '100%' }} autoPlay muted></video>
        </div>
      </div>)}
    </div>
  );
};

export default QuaggaScanner;