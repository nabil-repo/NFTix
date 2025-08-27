"use client";

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

interface QrScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanFailure: (error: any) => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScanSuccess, onScanFailure }) => {
  const scannerRef = useRef<any>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    Html5Qrcode.getCameras().then(cameras => {
      if (cameras && cameras.length) {
        setCameraPermission(true);
        const scanner = new Html5QrcodeScanner(
          "reader",
          {
            qrbox: {
              width: 250,
              height: 250,
            },
            fps: 5,
          },
          false
        );

        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;
      } else {
        setCameraPermission(false);
      }
    }).catch(err => {
      console.error(err);
      setCameraPermission(false);
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div id="reader" className="mt-4">
      {cameraPermission === false && (
        <p className="text-red-500">
          Camera permission is required to scan QR codes. Please enable camera access in your browser settings.
        </p>
      )}
    </div>
  );
};

export default QrScanner;