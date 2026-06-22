import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from './supabase';
import ARCamera from './ARCamera';
import Avatar from './Avatar';
import Ranking from './Ranking';
import Auth from './Auth';
import Items from './ItemsScreen';
import AdminPage from './AdminPage';
import SplashScreen from './SplashScreen';
import './App.css';

// ── 型定義 ──────────────────────────────────────────────────
type NavItem = 'map' | 'avatar' | 'rank' | 'item';
type TreasureType = '地域クーポン' | 'ゲームアイテム' | 'スポンサード' | '期間限定' | 'レジェンド';

interface TreasureChest {
  id: string | number;
  name: string;
  type: TreasureType;
  lat: number;
  lng: number;
  shop_name?: string;
  shop_photo?: string;
  shop_url?: string;
  shop_tel?: string;
  description?: string;
  gold_amount?: number;
  unlock_mode?: string;
  appear_radius?: number;
  qr_code?: string;
}

interface RewardResult {
  itemName: string;
  gold: number;
  treasureName: string;
  type: TreasureType;
}

// ── 定数 ────────────────────────────────────────────────────
const DEFAULT_CENTER: [number, number] = [34.6873, 135.5262];
const MIN_ZOOM = 15;
const DEFAULT_ZOOM = 15;

const TREASURE_CONFIG: Record<TreasureType, {
  color: string; emoji: string; shape: string; label: string; items: string[];
}> = {
  地域クーポン:  { color: '#22c55e', emoji: '🟢', shape: 'circle',  label: '地域クーポン',  items: ['地域振興券500円', '観光割引クーポン', '飲食店10%オフ', '温泉入浴券'] },
  ゲームアイテム: { color: '#3b82f6', emoji: '🔵', shape: 'square',  label: 'ゲームアイテム', items: ['強化石', '経験値アップ薬', '魔法の地図', 'HP回復ポーション'] },
  スポンサード:  { color: '#e8b84b', emoji: '⭐', shape: 'star',    label: 'スポンサード',  items: ['NIKEシューズNFT', 'スタバ限定NFT', 'コラボ限定バッジ', '企業限定クーポン'] },
  期間限定:     { color: '#a855f7', emoji: '💜', shape: 'diamond', label: '期間限定',     items: ['ハロウィン魔女帽', '正月金の鏡餅', 'クリスマスベル', '夏祭り花火'] },
  レジェンド:   { color: '#ef4444', emoji: '👑', shape: 'crown',   label: 'レジェンド',   items: ['伝説の剣NFT', '黄金の鎧NFT', 'ドラゴンの翼NFT', '神々の指輪NFT'] },
};

const navItems: { key: NavItem; label: string }[] = [
  { key: 'map',    label: 'マップ'   },
  { key: 'avatar', label: 'マイページ' },
  { key: 'rank',   label: 'ランク'   },
  { key: 'item',   label: 'アイテム' },
];

// ── ユーティリティ ───────────────────────────────────────────
function createTreasureIcon(type: TreasureType, selected = false): L.DivIcon {
  const cfg = TREASURE_CONFIG[type];
  const s = selected ? 52 : 40;
  const pulseAnim = selected ? `
    <div style="
      position:absolute;top:50%;left:50%;
      transform:translate(-50%,-50%);
      width:${s * 2}px;height:${s * 2}px;
      border-radius:50%;
      background:${cfg.color}22;
      animation:chestPulse 1.5s ease-out infinite;
    "></div>
    <div style="
      position:absolute;top:50%;left:50%;
      transform:translate(-50%,-50%);
      width:${s * 1.4}px;height:${s * 1.4}px;
      border-radius:50%;
      border:1px solid ${cfg.color}66;
      animation:chestPulse 1.5s ease-out infinite 0.5s;
    "></div>` : '';
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:${s}px;height:${s}px;">
        ${pulseAnim}
        <div style="
          position:absolute;top:50%;left:50%;
          transform:translate(-50%,-50%);
          width:${s}px;height:${s}px;
          border-radius:50%;
          background:radial-gradient(circle at 35% 35%, ${cfg.color}ff, ${cfg.color}66);
          border:2px solid ${cfg.color};
          box-shadow:0 0 ${selected ? 24 : 12}px ${cfg.color}99,
                     0 0 ${selected ? 48 : 24}px ${cfg.color}44;
          display:flex;align-items:center;justify-content:center;
        ">
          <div style="
            width:${s * 0.38}px;height:${s * 0.38}px;
            border-radius:50%;
            background:white;
            opacity:0.85;
            box-shadow:0 0 8px white;
          "></div>
        </div>
      </div>
      <style>
        @keyframes chestPulse {
          0%{transform:translate(-50%,-50%) scale(0.8);opacity:0.8}
          100%{transform:translate(-50%,-50%) scale(1.8);opacity:0}
        }
      </style>`,
    iconSize: [s, s], iconAnchor: [s / 2, s / 2],
  });
}

function createPlayerIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div class="player-marker"><div class="player-marker__ring"></div><div class="player-marker__dot"></div></div>`,
    iconSize: [40, 40], iconAnchor: [20, 20],
  });
}

function calcDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const a = Math.sin(toRad(lat2 - lat1) / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lng2 - lng1) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(m: number): string {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

function randomGold(type: TreasureType): number {
  const base: Record<TreasureType, number> = {
    地域クーポン: 200, ゲームアイテム: 150, スポンサード: 500, 期間限定: 350, レジェンド: 1000,
  };
  return base[type] + Math.floor(Math.random() * 200);
}

// ── MapController ────────────────────────────────────────────
function MapController({ center }: { center: [number, number] | null; northUp: boolean; heading: number }) {
  const map = useMap();
  useEffect(() => { map.setMinZoom(MIN_ZOOM); }, [map]);
  useEffect(() => { if (center) map.setView(center, map.getZoom()); }, [center, map]);
  return null;
}

// ── App ──────────────────────────────────────────────────────
export default function App() {

  // 画面表示
  const [activeNav,    setActiveNav]    = useState<NavItem>('map');
  const [showAR,       setShowAR]       = useState(false);
  const [showAvatar,   setShowAvatar]   = useState(false);
  const [showRanking,  setShowRanking]  = useState(false);
  const [showItems,    setShowItems]    = useState(false);
  const [showAdmin,    setShowAdmin]    = useState(false);
  const [showSplash,   setShowSplash]   = useState(true);
  // Supabaseから宝箱データ取得
const [treasures, setTreasures] = useState<TreasureChest[]>([]);

useEffect(() => {
  supabase
    .from('chests')
    .select('*')
    .eq('is_active', true)
    .then(({ data }) => {
      if (data) {
        const validTypes = Object.keys(TREASURE_CONFIG) as TreasureType[];
        setTreasures(data.map(c => ({
          id: c.id,
          name: c.name,
          type: validTypes.includes(c.type as TreasureType) ? c.type as TreasureType : '地域クーポン',
          lat: c.lat,
          lng: c.lng,
          shop_name:   c.shop_name   ?? '',
          shop_photo:  c.shop_photo  ?? '',
          shop_url:    c.shop_url    ?? '',
          shop_tel:    c.shop_tel    ?? '',
          description: c.description ?? '',
          gold_amount:   c.gold_amount   ?? 100,
          unlock_mode:   c.unlock_mode   ?? 'gps',
          appear_radius: c.appear_radius ?? 50,
          qr_code:       c.qr_code       ?? '',
        })));
      }
    });
}, []);

  // 宝箱
  const [selectedChest,  setSelectedChest]  = useState<TreasureChest | null>(null);
  const [rewardModal,    setRewardModal]    = useState<RewardResult | null>(null);
  const [modalRevealed,  setModalRevealed]  = useState(false);

  // ゴールド
  const [totalGold,  setTotalGold]  = useState(0);
  const [goldPulse,  setGoldPulse]  = useState(false);

  // GPS
  const [playerPos,   setPlayerPos]   = useState<[number, number] | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // 認証
  const [user,         setUser]         = useState<any>(null);
  const [profile,      setProfile]      = useState<any>(null);
  const [authLoading,  setAuthLoading]  = useState(true);

  // ── Effects ────────────────────────────────────────────────

  // 認証監視
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // プロフィール取得
  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) { setProfile(data); setTotalGold(data.gold ?? 0); }
      });
  }, [user]);

  // GPS監視
  useEffect(() => {
    if (!navigator.geolocation) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => setPlayerPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true } as any,
    );
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  // ── 計算 ───────────────────────────────────────────────────
  const mapCenter = playerPos ?? DEFAULT_CENTER;

  const treasuresWithDist = useMemo(() =>
    treasures.map((t) => ({
      ...t,
      distance:  formatDistance(calcDistanceMeters(mapCenter[0], mapCenter[1], t.lat, t.lng)),
      distanceM: calcDistanceMeters(mapCenter[0], mapCenter[1], t.lat, t.lng),
    })).sort((a, b) => a.distanceM - b.distanceM),
 // eslint-disable-next-line react-hooks/exhaustive-deps
 [mapCenter]);

  // ── ハンドラ ───────────────────────────────────────────────

  const handleNavClick = useCallback((key: NavItem) => {
    setActiveNav(key);
    if (key === 'avatar') setShowAvatar(true);
    if (key === 'rank')   setShowRanking(true);
    if (key === 'item')   setShowItems(true);
  }, []);

  const handleOpenTreasure = useCallback((t: TreasureChest) => {
    setModalRevealed(false);
    const cfg  = TREASURE_CONFIG[t.type];
    const gold = randomGold(t.type);
    setRewardModal({
      itemName:     cfg.items[Math.floor(Math.random() * cfg.items.length)],
      gold,
      treasureName: t.name,
      type:         t.type,
    });
    setTimeout(() => setModalRevealed(true), 900);
  }, []);

  const handleClaimReward = useCallback(async () => {
    if (!rewardModal || !user) return;
  
    const newGold = totalGold + rewardModal.gold;
    setTotalGold(newGold);
    setGoldPulse(true);
    setTimeout(() => setGoldPulse(false), 600);
  
    // ゴールドをSupabaseに保存
    await supabase.from('profiles').update({ gold: newGold }).eq('id', user.id);
  
    // 獲得アイテムをSupabaseに保存
    const typeToCategory: Record<TreasureType, string> = {
      地域クーポン:  'クーポン',
      ゲームアイテム: '武器',
      スポンサード:  'NFT',
      期間限定:     'アクセサリー',
      レジェンド:   'NFT',
    };
    const typeToEmoji: Record<TreasureType, string> = {
      地域クーポン:  '🎟️',
      ゲームアイテム: '⚔️',
      スポンサード:  '⭐',
      期間限定:     '💜',
      レジェンド:   '👑',
    };
    await supabase.from('items').insert({
      user_id:   user.id,
      item_id: `${rewardModal.type}_${user.id}_${Date.now()}_${Math.random()}`,
      name:      rewardModal.itemName,
      category:  typeToCategory[rewardModal.type],
      rarity:    rewardModal.type === 'レジェンド' ? '限定' : rewardModal.type === 'スポンサード' ? 'エピック' : 'レア',
      emoji:     typeToEmoji[rewardModal.type],
      source:    rewardModal.treasureName,
      is_nft:    rewardModal.type === 'レジェンド' || rewardModal.type === 'スポンサード',
    });
  
    // 取得ログをSupabaseに保存
    await supabase.from('chest_logs').insert({
      user_id:      user.id,
      item_name:    rewardModal.itemName,
      gold_earned:  rewardModal.gold,
    });
  
    setRewardModal(null);
    setModalRevealed(false);
  }, [rewardModal, totalGold, user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setTotalGold(0);
  };

  // ── ローディング / 未ログイン ───────────────────────────────
  if (authLoading) return (
    <div style={{ position:'fixed', inset:0, background:'#0a0e1a', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'#e8b84b', fontSize:18 }}>読み込み中...</p>
    </div>
  );

  if (!user) return (
    <Auth onLogin={() =>
      supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    } />
  );

  // ── レンダー ───────────────────────────────────────────────
  return (
    <div className="app">
    {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* ── モーダル類 ── */}
      {/* ── フルスクリーン（ボトムナビの上に重ねない） ── */}
      {showAR && (
        <ARCamera
          onClose={() => { setShowAR(false); setActiveNav('map'); }}
          chest={selectedChest ? {
            id: selectedChest.id,
            name: selectedChest.name,
            type: selectedChest.type,
            lat: selectedChest.lat,
            lng: selectedChest.lng,
            gold_amount: selectedChest.gold_amount,
            unlock_mode: (selectedChest as any).unlock_mode ?? 'gps',
            appear_radius: (selectedChest as any).appear_radius ?? 50,
            qr_code: (selectedChest as any).qr_code ?? '',
          } : undefined}
          playerPos={playerPos}
          onClaim={(gold) => {
            const newGold = totalGold + gold;
            setTotalGold(newGold);
            setGoldPulse(true);
            setTimeout(() => setGoldPulse(false), 600);
            if (user) supabase.from('profiles').update({ gold: newGold }).eq('id', user.id);
          }}
        />
      )}
      {showAdmin && <AdminPage onClose={() => setShowAdmin(false)} />}

      {/* ── ヘッダー ── */}
      <header className="title-bar">
        <div className="title-bar__left">
          <h1 className="title-bar__heading">たからさがし</h1>
          {profile && <span className="title-bar__username">⚔️ {profile.username}</span>}
        </div>
        <div className="title-bar__right">
          <div className={`title-bar__gold${goldPulse ? ' title-bar__gold--pulse' : ''}`}>
            <span aria-hidden="true">💰</span>
            <span>{totalGold.toLocaleString()} G</span>
          </div>
          <button className="title-bar__logout" onClick={handleLogout}>ログアウト</button>
          {profile?.is_admin && (
  <button className="title-bar__logout" onClick={() => setShowAdmin(true)}>⚙️ 管理</button>
)}
        </div>
      </header>

      {/* ── メインコンテンツ ── */}
      <main className="main-content">
        {/* アバター・ランク・アイテムはここにインライン表示 */}
        {showAvatar  && <Avatar   onClose={() => { setShowAvatar(false); setActiveNav('map'); }} />}
        {showRanking && <Ranking  onClose={() => { setShowRanking(false); setActiveNav('map'); }} />}
        {showItems   && user && <Items userId={user.id} onClose={() => { setShowItems(false); setActiveNav('map'); }} />}

        {/* 地図（常に裏にある） */}
        <section className="map-area" aria-label="地図" style={{ display: (showAvatar || showRanking || showItems) ? 'none' : 'block' }}>
          <MapContainer
            center={mapCenter}
            zoom={DEFAULT_ZOOM}
            minZoom={MIN_ZOOM}
            maxZoom={19}
            scrollWheelZoom
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={playerPos} northUp heading={0} />

            {playerPos && (
              <Marker position={playerPos} icon={createPlayerIcon()}>
                <Popup>現在地</Popup>
              </Marker>
            )}

            {treasures.map((t) => (
              <Marker
                key={t.id}
                position={[t.lat, t.lng]}
                icon={createTreasureIcon(t.type)}
                eventHandlers={{ click: () => setSelectedChest(t) }}
              />
            ))}
          </MapContainer>
        </section>
      </main>

      {/* ── ナビゲーション ── */}
      <nav className="bottom-nav" aria-label="メインナビゲーション">
        {navItems.map((item) => {
          const active = activeNav === item.key;
          const color  = active ? '#e8b84b' : '#4a5268';
          return (
            <button
              key={item.key}
              type="button"
              className={`bottom-nav__item${active ? ' bottom-nav__item--active' : ''}`}
              onClick={() => handleNavClick(item.key)}
              aria-current={active ? 'page' : undefined}
            >
              {/* ── アイコン（差し替え時はここのSVGを変えるだけ） ── */}
              {item.key === 'map' && (
                <svg width="28" height="28" viewBox="0 0 24 24" style={{ overflow:'visible' }}>
                  <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="8.5" fill="none" stroke={color} strokeWidth="0.5" strokeOpacity="0.4"/>
                  <text x="12" y="5"  textAnchor="middle" fontSize="3.5" fill={color} fontFamily="Georgia">N</text>
                  <text x="12" y="21" textAnchor="middle" fontSize="3.5" fill={color} fontFamily="Georgia">S</text>
                  <text x="21" y="13" textAnchor="middle" fontSize="3.5" fill={color} fontFamily="Georgia">E</text>
                  <text x="3"  y="13" textAnchor="middle" fontSize="3.5" fill={color} fontFamily="Georgia">W</text>
                  <g style={{ transformOrigin:'12px 12px', animation: active ? 'compassSpin 3s linear infinite' : 'compassSpin 8s linear infinite' }}>
                    <polygon points="12,5 10.5,12 12,11 13.5,12" fill={color}/>
                    <polygon points="12,19 10.5,12 12,13 13.5,12" fill={active ? '#555' : '#2a2a3a'}/>
                  </g>
                  <circle cx="12" cy="12" r="1.2" fill={color}/>
                </svg>
              )}
              {item.key === 'avatar' && (
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <rect x="4" y="5" width="16" height="14" rx="1" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <ellipse cx="12" cy="5"  rx="8" ry="2" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
                  <ellipse cx="12" cy="19" rx="8" ry="2" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="7" y1="9"  x2="17" y2="9"  stroke={color} strokeWidth="1" strokeLinecap="round" strokeOpacity="0.8"/>
                  <line x1="7" y1="12" x2="15" y2="12" stroke={color} strokeWidth="1" strokeLinecap="round" strokeOpacity="0.8"/>
                  <line x1="7" y1="15" x2="16" y2="15" stroke={color} strokeWidth="1" strokeLinecap="round" strokeOpacity="0.8"/>
                  <circle cx="16" cy="9" r="2" fill="none" stroke={color} strokeWidth="1"/>
                </svg>
              )}
              {item.key === 'rank' && (
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <path d="M7,4 L17,4 L15,13 Q12,15 9,13 Z" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7,6 Q3,6 3,10 Q3,13 7,13" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M17,6 Q21,6 21,10 Q21,13 17,13" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="12" y1="15" x2="12" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
                  <rect x="8" y="18" width="8" height="2" rx="1" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
                  <text x="12" y="12" textAnchor="middle" fontSize="5" fill={color} fontFamily="Georgia">★</text>
                  {active && <>
                    <line x1="5"  y1="3" x2="4"  y2="2" stroke={color} strokeWidth="0.8" strokeLinecap="round" style={{ animation:'trophyShine 1.5s ease-in-out infinite' }}/>
                    <line x1="19" y1="3" x2="20" y2="2" stroke={color} strokeWidth="0.8" strokeLinecap="round" style={{ animation:'trophyShine 1.5s ease-in-out infinite 0.3s' }}/>
                    <line x1="12" y1="3" x2="12" y2="1.5" stroke={color} strokeWidth="0.8" strokeLinecap="round" style={{ animation:'trophyShine 1.5s ease-in-out infinite 0.6s' }}/>
                  </>}
                </svg>
              )}
              {item.key === 'item' && (
                <svg width="28" height="28" viewBox="0 0 24 24" style={{ animation: active ? 'packBounce 2s ease-in-out infinite' : 'none' }}>
                  <rect x="6" y="8" width="12" height="13" rx="3" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9,8 Q9,4 12,4 Q15,4 15,8" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
                  <rect x="8" y="13" width="8" height="5" rx="1.5" fill="none" stroke={color} strokeWidth="1" strokeLinecap="round"/>
                  <line x1="10" y1="15.5" x2="14" y2="15.5" stroke={color} strokeWidth="1" strokeLinecap="round" strokeDasharray="1,0.5"/>
                  <path d="M10,8 Q12,6 14,8" fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              )}
              <span className="bottom-nav__label">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <style>{`
        @keyframes compassSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes trophyShine { 0%,100%{opacity:0.3} 50%{opacity:1} }
        @keyframes packBounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
      `}</style>

      {/* ── 宝箱詳細 ── */}
      {selectedChest && (
        <div className="chest-detail-overlay" onClick={() => setSelectedChest(null)}>
          <div className="chest-detail-card" onClick={e => e.stopPropagation()}>
            <button className="chest-detail-close" onClick={() => setSelectedChest(null)}>✕</button>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 16px' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, ${TREASURE_CONFIG[selectedChest.type].color}ff, ${TREASURE_CONFIG[selectedChest.type].color}66)`,
                border: `2px solid ${TREASURE_CONFIG[selectedChest.type].color}`,
                boxShadow: `0 0 24px ${TREASURE_CONFIG[selectedChest.type].color}99, 0 0 48px ${TREASURE_CONFIG[selectedChest.type].color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'white', opacity: 0.85, boxShadow: '0 0 8px white' }} />
              </div>
            </div>

            <h2 className="chest-detail-name">{selectedChest.name}</h2>
            <div className="chest-detail-type" style={{ color: TREASURE_CONFIG[selectedChest.type].color }}>
              {TREASURE_CONFIG[selectedChest.type].label}
            </div>
            <div className="chest-detail-dist">
              📍 現在地から {treasuresWithDist.find(t => t.id === selectedChest.id)?.distance ?? '---'}
            </div>

            {selectedChest.shop_photo && (
              <div style={{ margin: '12px 0', borderRadius: 12, overflow: 'hidden', height: 140 }}>
                <img src={selectedChest.shop_photo} alt={selectedChest.shop_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            {(selectedChest.shop_name || selectedChest.shop_tel || selectedChest.shop_url) && (
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '12px 14px', margin: '10px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedChest.shop_name && (
                  <div style={{ fontSize: 14, fontWeight: 700 }}>🏪 {selectedChest.shop_name}</div>
                )}
                {selectedChest.description && (
                  <div style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.6 }}>{selectedChest.description}</div>
                )}
                {selectedChest.shop_tel && (
                  <a href={`tel:${selectedChest.shop_tel}`} style={{ fontSize: 13, color: '#4CAF50', textDecoration: 'none' }}>
                    📞 {selectedChest.shop_tel}
                  </a>
                )}
                {selectedChest.shop_url && (
                  <a href={selectedChest.shop_url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none' }}>
                    🔗 公式サイトを見る
                  </a>
                )}
              </div>
            )}

            <div style={{ fontSize: 13, opacity: 0.6, margin: '4px 0 12px', textAlign: 'center' }}>
              💰 獲得ゴール：{selectedChest.gold_amount ?? 100}G
            </div>

            <div className="chest-detail-btns">
              <button
                className="chest-detail-route-btn"
                onClick={() => {
                  const url = playerPos
                    ? `https://www.google.com/maps/dir/${playerPos[0]},${playerPos[1]}/${selectedChest.lat},${selectedChest.lng}`
                    : `https://www.google.com/maps/dir//${selectedChest.lat},${selectedChest.lng}`;
                  window.open(url, '_blank');
                }}
              >
                🗺️ 経路案内
              </button>
              <button
                className="chest-detail-ar-btn"
                onClick={() => { setShowAR(true); }}
              >
                📷 ARで開ける
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 報酬モーダル ── */}
      {rewardModal && (
        <div className="reward-overlay" role="presentation">
          <div className="reward-modal" role="dialog" aria-modal="true" aria-labelledby="reward-modal-title">
            <p className="reward-modal__source">{rewardModal.treasureName}</p>
            <div className="reward-modal__type-badge" style={{ color: TREASURE_CONFIG[rewardModal.type].color }}>
              {TREASURE_CONFIG[rewardModal.type].emoji} {TREASURE_CONFIG[rewardModal.type].label}
            </div>
            <div className="chest-scene">
              <div className="chest chest--opening">
                <div className="chest__shadow" />
                <div className="chest__body"><div className="chest__lock" /></div>
                <div className="chest__lid">
                  <div className="chest__lid-top" />
                  <div className="chest__lid-front" />
                </div>
                <div className="chest__sparkles" aria-hidden="true">
                  <span>✨</span><span>⭐</span><span>✨</span>
                </div>
              </div>
            </div>
            <div className={`reward-modal__rewards${modalRevealed ? ' reward-modal__rewards--visible' : ''}`}>
              <h2 id="reward-modal-title" className="reward-modal__title">宝箱を開けた！</h2>
              <p className="reward-modal__item">{rewardModal.itemName}</p>
              <p className="reward-modal__gold">+{rewardModal.gold.toLocaleString()} G</p>
              <button type="button" className="reward-modal__claim-btn" onClick={handleClaimReward}>
                受け取る！
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}