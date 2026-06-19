import React, { useEffect, useRef, useState } from 'react';
import './ARCamera.css';

const ARCamera: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [chestVisible, setChestVisible] = useState(false);
  const [opened, setOpened] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    }).then(stream => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
        setTimeout(() => setChestVisible(true), 2000);
      }
    }).catch(() => {
      setError('カメラへのアクセスが必要です');
    });
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="ar-screen">
      <div className="ar-topbar">
        <button className="ar-close" onClick={onClose}>✕ 閉じる</button>
        <span className="ar-title">ARカメラ</span>
        <span className="ar-gps">📍 GPS認証中...</span>
      </div>

      <div className="ar-viewport">
        <video ref={videoRef} autoPlay playsInline muted className="ar-video" />

        {!cameraReady && !error && (
          <div className="ar-loading">
            <div className="ar-spinner" />
            <p>カメラ起動中...</p>
          </div>
        )}

        {error && (
          <div className="ar-loading">
            <p style={{ color: '#ff6b6b' }}>⚠️ {error}</p>
            <p style={{ fontSize: 12, marginTop: 8, color: '#8892a4' }}>
              ブラウザのカメラ許可を確認してください
            </p>
          </div>
        )}

        {cameraReady && !opened && (
          <>
            <div className="ar-scanline" />
            <div className="ar-corner tl" /><div className="ar-corner tr" />
            <div className="ar-corner bl" /><div className="ar-corner br" />
            <p className="ar-hint">カメラを宝箱のある方向に向けてください</p>
          </>
        )}

        {chestVisible && !opened && (
          <div className="ar-chest-wrap" onClick={() => setOpened(true)}>
            <div className="ar-chest-float">
              <div className="ar-chest-glow" />
              <span className="ar-chest-emoji">📦</span>
              <p className="ar-chest-tap">タップして開ける！</p>
            </div>
          </div>
        )}

        {opened && (
          <div className="ar-reward">
            <div className="ar-reward-box">
              <p className="ar-reward-emoji">🌟</p>
              <h2>宝箱を開けた！</h2>
              <p className="ar-reward-item">黄金の御守り</p>
              <p className="ar-reward-gold">+320 G</p>
              <button className="ar-reward-btn" onClick={onClose}>受け取る！</button>
            </div>
          </div>
        )}
      </div>

      <div className="ar-bottombar">
        <div className="ar-radar">
          <div className="ar-radar-ring" />
          <div className="ar-radar-dot" />
        </div>
        <div className="ar-info">
          <p className="ar-info-name">伏見稲荷大社</p>
          <p className="ar-info-dist">📍 現在地から 120m</p>
        </div>
      </div>
    </div>
  );
};

export default ARCamera;