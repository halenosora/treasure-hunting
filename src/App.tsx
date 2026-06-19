import ARCamera from './ARCamera';
import Avatar from './Avatar';
import React, { useMemo, useState } from 'react';
import Ranking from './Ranking';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import './App.css';

type NavItem = 'map' | 'ar' | 'avatar' | 'rank' | 'item';
type TreasureType = '神社' | '城' | '企業コラボ';

interface TreasureChest {
  id: number;
  name: string;
  type: TreasureType;
  lat: number;
  lng: number;
  icon: string;
}

interface RewardResult {
  itemName: string;
  gold: number;
  treasureName: string;
}

const MAP_CENTER: [number, number] = [34.6873, 135.5262];
const MAP_ZOOM = 12;

const MARKER_COLORS: Record<TreasureType, string> = {
  神社: '#22c55e',
  城: '#f97316',
  企業コラボ: '#eab308',
};

const ITEMS_BY_TYPE: Record<TreasureType, string[]> = {
  神社: ['黄金の御守り', '稲荷のお札', '幸運の鈴', '神樹の実'],
  城: ['城主の印章', '武将の兜', '秘伝の地図', '黄金の短刀'],
  企業コラボ: ['限定クーポン500円', 'スター特典カード', '限定ドリンク券', 'コラボステッカー'],
};

const treasures: TreasureChest[] = [
  { id: 1, name: '伏見稲荷大社', type: '神社', lat: 34.9671, lng: 135.7727, icon: '⛩️' },
  { id: 2, name: '大阪城', type: '城', lat: 34.6873, lng: 135.5262, icon: '🏯' },
  { id: 3, name: 'スターバックス心斎橋', type: '企業コラボ', lat: 34.6722, lng: 135.5017, icon: '🤝' },
];

const navItems: { key: NavItem; label: string; icon: string }[] = [
  { key: 'map', label: 'マップ', icon: '🗺️' },
  { key: 'ar', label: 'AR', icon: '📷' },
  { key: 'avatar', label: 'アバター', icon: '👤' },
  { key: 'rank', label: 'ランク', icon: '🏆' },
  { key: 'item', label: 'アイテム', icon: '🎒' },
];

const markerIconCache = new Map<TreasureType, L.Icon>();

function createMarkerIcon(type: TreasureType): L.Icon {
  const cached = markerIconCache.get(type);
  if (cached) return cached;

  const color = MARKER_COLORS[type];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
    <path fill="${color}" stroke="#ffffff" stroke-width="1.5" d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26C32 7.2 24.8 0 16 0z"/>
    <rect x="9" y="9" width="14" height="11" rx="2" fill="#ffffff"/>
    <rect x="11" y="7" width="10" height="4" rx="1" fill="#ffffff"/>
  </svg>`;

  const icon = L.icon({
    iconUrl: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });

  markerIconCache.set(type, icon);
  return icon;
}

function calcDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function randomItem(type: TreasureType): string {
  const items = ITEMS_BY_TYPE[type];
  return items[Math.floor(Math.random() * items.length)];
}

function randomGold(): number {
  return Math.floor(Math.random() * 401) + 100;
}

function App() {
  const [activeNav, setActiveNav] = useState<NavItem>('map');
  const [totalGold, setTotalGold] = useState(0);
  const [goldPulse, setGoldPulse] = useState(false);
  const [rewardModal, setRewardModal] = useState<RewardResult | null>(null);
  const [modalRevealed, setModalRevealed] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showRanking, setShowRanking] = useState(false);

  const treasuresWithDistance = useMemo(
    () =>
      treasures.map((treasure) => ({
        ...treasure,
        distance: formatDistance(
          calcDistanceMeters(MAP_CENTER[0], MAP_CENTER[1], treasure.lat, treasure.lng),
        ),
      })),
    [],
  );

  const handleOpenTreasure = (treasure: TreasureChest) => {
    setModalRevealed(false);
    setRewardModal({
      itemName: randomItem(treasure.type),
      gold: randomGold(),
      treasureName: treasure.name,
    });
    window.setTimeout(() => setModalRevealed(true), 900);
  };

  const handleClaimReward = () => {
    if (!rewardModal) return;

    setTotalGold((prev) => prev + rewardModal.gold);
    setGoldPulse(true);
    window.setTimeout(() => setGoldPulse(false), 600);
    setRewardModal(null);
    setModalRevealed(false);
  };

  return (
    <div className="app">
    {showAR && <ARCamera onClose={() => setShowAR(false)} />}
    {showAvatar && <Avatar onClose={() => setShowAvatar(false)} />}
    {showRanking && <Ranking onClose={() => setShowRanking(false)} />}
      <header className="title-bar">
        <h1 className="title-bar__heading">たからさがし</h1>
        <div className={`title-bar__gold${goldPulse ? ' title-bar__gold--pulse' : ''}`}>
          <span className="title-bar__gold-icon" aria-hidden="true">💰</span>
          <span className="title-bar__gold-value">{totalGold.toLocaleString()} G</span>
        </div>
      </header>

      <main className="main-content">
        <section className="map-area" aria-label="地図">
          <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {treasures.map((treasure) => (
              <Marker
                key={treasure.id}
                position={[treasure.lat, treasure.lng]}
                icon={createMarkerIcon(treasure.type)}
              >
                <Popup>
                  <strong>{treasure.name}</strong>
                  <br />
                  {treasure.type}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </section>

        <section className="treasure-list" aria-label="近くの宝箱">
          <h2 className="treasure-list__heading">近くの宝箱</h2>
          <ul className="treasure-list__items">
            {treasuresWithDistance.map((treasure) => (
              <li key={treasure.id} className="treasure-card">
                <span className="treasure-card__icon" aria-hidden="true">
                  {treasure.icon}
                </span>
                <div className="treasure-card__info">
                  <span className="treasure-card__name">{treasure.name}</span>
                  <span className={`treasure-card__type treasure-card__type--${treasure.type}`}>
                    {treasure.type}
                  </span>
                  <span className="treasure-card__distance">{treasure.distance}</span>
                </div>
                <button
                  type="button"
                  className="treasure-card__open-btn"
                  onClick={() => handleOpenTreasure(treasure)}
                >
                  開ける
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <nav className="bottom-nav" aria-label="メインナビゲーション">
        {navItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`bottom-nav__item${activeNav === item.key ? ' bottom-nav__item--active' : ''}`}
            onClick={() => {
              setActiveNav(item.key);
              if (item.key === 'ar') setShowAR(true);
              if (item.key === 'avatar') setShowAvatar(true);
              if (item.key === 'rank') setShowRanking(true);
            }}
            aria-current={activeNav === item.key ? 'page' : undefined}
          >
            <span className="bottom-nav__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="bottom-nav__label">{item.label}</span>
          </button>
        ))}
      </nav>

      {rewardModal && (
        <div className="reward-overlay" role="presentation">
          <div
            className="reward-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reward-modal-title"
          >
            <p className="reward-modal__source">{rewardModal.treasureName}</p>

            <div className="chest-scene">
              <div className="chest chest--opening">
                <div className="chest__shadow" />
                <div className="chest__body">
                  <div className="chest__lock" />
                </div>
                <div className="chest__lid">
                  <div className="chest__lid-top" />
                  <div className="chest__lid-front" />
                </div>
                <div className="chest__sparkles" aria-hidden="true">
                  <span>✨</span>
                  <span>⭐</span>
                  <span>✨</span>
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

export default App;
