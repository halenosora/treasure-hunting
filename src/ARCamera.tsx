import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import './ARCamera.css';

interface ARCameraProps {
  onClose: () => void;
  chest?: {
    id: string | number;
    name: string;
    type: string;
    lat: number;
    lng: number;
    gold_amount?: number;
    unlock_mode?: string;
    appear_radius?: number;
    qr_code?: string;
  };
  playerPos?: [number, number] | null;
  onClaim?: (gold: number) => void;
}

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const a = Math.sin(toRad(lat2 - lat1) / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lng2 - lng1) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const TYPE_COLORS: Record<string, number> = {
  '地域クーポン':  0x22c55e,
  'ゲームアイテム': 0x3b82f6,
  'スポンサード':  0xe8b84b,
  '期間限定':     0xa855f7,
  'レジェンド':   0xef4444,
};

const ARCamera: React.FC<ARCameraProps> = ({ onClose, chest, playerPos, onClaim }) => {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef    = useRef<THREE.Scene | null>(null);
  const cameraRef   = useRef<THREE.PerspectiveCamera | null>(null);
  const chestRef    = useRef<THREE.Group | null>(null);
  const animRef     = useRef<number>(0);
  const streamRef   = useRef<MediaStream | null>(null);

  const [phase, setPhase]         = useState<'loading' | 'scanning' | 'tooFar' | 'ready' | 'opened' | 'error'>('loading');
  const [distance, setDistance]   = useState<number | null>(null);
  const [gold]                    = useState(chest?.gold_amount ?? 100);
  const [opened, setOpened]       = useState(false);

  const radius = chest?.appear_radius ?? 50;
  const isGPS  = chest?.unlock_mode !== 'qr';

  // ── Three.js 3D宝箱を作成 ──────────────────────────────
  const createChest3D = useCallback((scene: THREE.Scene) => {
    const group   = new THREE.Group();
    const color   = TYPE_COLORS[chest?.type ?? ''] ?? 0xe8b84b;
    const mat     = new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.3 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, metalness: 0.3, roughness: 0.7 });

    // 本体
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.9), darkMat);
    body.position.y = 0;
    group.add(body);

    // 蓋
    const lid = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 0.9), darkMat);
    lid.position.y = 0.6;
    group.add(lid);

    // 金の縁取り
    const rimMat = new THREE.MeshStandardMaterial({ color, metalness: 0.9, roughness: 0.1 });
    const rim    = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 0.95), rimMat);
    rim.position.y = 0.4;
    group.add(rim);

    // 錠前
    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.15), mat);
    lock.position.set(0, 0.4, 0.5);
    group.add(lock);

    // 光るオーラ
    const aura = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 16, 16),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15, side: THREE.BackSide })
    );
    group.add(aura);

    group.position.set(0, -0.5, -4);
    group.scale.set(0.8, 0.8, 0.8);
    scene.add(group);
    chestRef.current = group;
    return group;
  }, [chest]);

  // ── Three.js 初期化 ────────────────────────────────────
  const initThree = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(70, w / h, 0.1, 100);
    camera.position.set(0, 0, 0);
    cameraRef.current = camera;

    // ライト
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(2, 4, 3);
    scene.add(dir);
    const point = new THREE.PointLight(TYPE_COLORS[chest?.type ?? ''] ?? 0xe8b84b, 2, 8);
    point.position.set(0, 2, -3);
    scene.add(point);

    createChest3D(scene);

    // アニメーションループ
    let t = 0;
    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      t += 0.02;
      if (chestRef.current) {
        chestRef.current.rotation.y = t * 0.8;
        chestRef.current.position.y = -0.5 + Math.sin(t) * 0.15;
        // オーラのパルス
        const aura = chestRef.current.children[4] as THREE.Mesh;
        if (aura?.material) {
          (aura.material as THREE.MeshBasicMaterial).opacity = 0.1 + Math.sin(t * 2) * 0.08;
        }
      }
      renderer.render(scene, camera);
    };
    animate();
  }, [createChest3D, chest]);

  // ── 開封アニメーション ─────────────────────────────────
  const playOpenAnimation = useCallback(() => {
    if (!chestRef.current) return;
    const lid = chestRef.current.children[1] as THREE.Mesh;
    let t = 0;
    const anim = () => {
      t += 0.05;
      if (lid) lid.rotation.x = -Math.min(t * 2, Math.PI * 0.7);
      chestRef.current!.scale.setScalar(0.8 + t * 0.3);
      if (t < 1) requestAnimationFrame(anim);
      else setOpened(true);
    };
    anim();
  }, []);

  // ── カメラ起動 ─────────────────────────────────────────
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            initThree();
            setPhase(isGPS ? 'scanning' : 'ready');
          };
        }
      })
      .catch(() => setPhase('error'));

    return () => {
      cancelAnimationFrame(animRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      rendererRef.current?.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── GPS距離監視 ────────────────────────────────────────
  useEffect(() => {
    if (!isGPS || !chest) return;
    const watchId = navigator.geolocation.watchPosition(pos => {
      const dist = calcDistance(pos.coords.latitude, pos.coords.longitude, chest.lat, chest.lng);
      setDistance(Math.round(dist));
      if (dist <= radius) setPhase('ready');
      else if (phase === 'ready') setPhase('scanning');
    }, () => {}, { enableHighAccuracy: true });
    return () => navigator.geolocation.clearWatch(watchId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chest, isGPS, radius]);

  // ── 宝箱タップ ─────────────────────────────────────────
  const handleTap = () => {
    if (phase !== 'ready' || opened) return;
    playOpenAnimation();
    setPhase('opened');
  };

  const handleClaim = () => {
    onClaim?.(gold);
    onClose();
  };

  const color = TYPE_COLORS[chest?.type ?? ''] ? `#${TYPE_COLORS[chest?.type ?? ''].toString(16).padStart(6, '0')}` : '#e8b84b';

  return (
    <div className="ar-screen">
      {/* トップバー */}
      <div className="ar-topbar">
        <button className="ar-close" onClick={onClose}>✕ 閉じる</button>
        <span className="ar-title">{chest?.name ?? 'AR宝箱'}</span>
        <span className="ar-gps" style={{ color: phase === 'ready' ? '#4CAF50' : '#e8b84b' }}>
          {phase === 'ready' ? '✅ 開封可能' : phase === 'scanning' ? '📡 探索中...' : ''}
        </span>
      </div>

      {/* ARビューポート */}
      <div className="ar-viewport" onClick={handleTap}>
        <video ref={videoRef} autoPlay playsInline muted className="ar-video" />
        <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} />

        {/* ローディング */}
        {phase === 'loading' && (
          <div className="ar-loading">
            <div className="ar-spinner" />
            <p>カメラ起動中...</p>
          </div>
        )}

        {/* エラー */}
        {phase === 'error' && (
          <div className="ar-loading">
            <p style={{ color:'#ff6b6b', fontSize:16 }}>⚠️ カメラへのアクセスが必要です</p>
            <p style={{ fontSize:12, marginTop:8, opacity:0.6 }}>ブラウザのカメラ許可を確認してください</p>
          </div>
        )}

        {/* 距離が遠い */}
        {phase === 'scanning' && distance !== null && (
          <div style={{ position:'absolute', bottom:120, left:'50%', transform:'translateX(-50%)', background:'rgba(0,0,0,0.7)', padding:'12px 24px', borderRadius:20, textAlign:'center' }}>
            <p style={{ color:'#e8b84b', fontSize:14, margin:0 }}>📍 あと {distance}m 近づいてください</p>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:11, margin:'4px 0 0' }}>範囲：{radius}m以内</p>
          </div>
        )}

        {/* 開封可能 */}
        {phase === 'ready' && !opened && (
          <>
            <div className="ar-corner tl"/><div className="ar-corner tr"/>
            <div className="ar-corner bl"/><div className="ar-corner br"/>
            <div style={{ position:'absolute', bottom:120, left:'50%', transform:'translateX(-50%)', textAlign:'center' }}>
              <div style={{ background:`${color}33`, border:`1px solid ${color}`, borderRadius:20, padding:'10px 24px', animation:'pulse2 1.5s ease-in-out infinite' }}>
                <p style={{ color, fontSize:15, margin:0, fontWeight:700 }}>👆 タップして開封！</p>
              </div>
            </div>
          </>
        )}

        {/* 開封済み */}
        {phase === 'opened' && opened && (
          <div className="ar-reward">
            <div className="ar-reward-box">
              <p style={{ fontSize:48, margin:0 }}>🌟</p>
              <h2 style={{ color:'#ffd700', margin:'8px 0' }}>宝箱を開けた！</h2>
              <p style={{ color, fontSize:14, margin:'4px 0' }}>{chest?.name}</p>
              <p style={{ color:'#ffd700', fontSize:28, fontWeight:700, margin:'8px 0' }}>+{gold.toLocaleString()} G</p>
              <button className="ar-reward-btn" onClick={handleClaim}>受け取る！</button>
            </div>
          </div>
        )}
      </div>

      {/* ボトムバー */}
      <div className="ar-bottombar">
        <div className="ar-radar">
          <div className="ar-radar-ring"/>
          <div className="ar-radar-dot"/>
        </div>
        <div className="ar-info">
          <p className="ar-info-name" style={{ color }}>{chest?.type ?? ''}</p>
          <p className="ar-info-dist">
            {isGPS && distance !== null ? `📍 ${distance}m` : chest?.unlock_mode === 'qr' ? '📷 QR認証済み' : ''}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse2 {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
          50% { transform: translateX(-50%) scale(1.05); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default ARCamera;