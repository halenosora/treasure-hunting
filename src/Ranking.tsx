import React, { useState } from 'react';
import './Ranking.css';

type RankTab = 'friend' | 'region' | 'national';

const FRIEND_RANKS = [
  { rank: 1, name: '山田 健太', emoji: '🧙', chests: 124, gold: 18200 },
  { rank: 2, name: '鈴木 みなみ', emoji: '🧝‍♀️', chests: 98, gold: 14500 },
  { rank: 3, name: 'あなた', emoji: '🧝', chests: 47, gold: 6800, isMe: true },
  { rank: 4, name: '田中 直樹', emoji: '🥷', chests: 31, gold: 4200 },
  { rank: 5, name: '佐藤 花', emoji: '🧚', chests: 18, gold: 2100 },
];

const REGION_RANKS = [
  { rank: 1, region: '京都府', chests: 1240, players: 320 },
  { rank: 2, region: '大阪府', chests: 980, players: 280 },
  { rank: 3, region: '東京都', chests: 870, players: 410 },
  { rank: 4, region: '愛知県', chests: 540, players: 190 },
  { rank: 5, region: '福岡県', chests: 430, players: 150 },
];

const NATIONAL_RANKS = [
  { rank: 1, name: '冒険王 タロウ', emoji: '👑', chests: 892, gold: 124000 },
  { rank: 2, name: 'ハンター ユキ', emoji: '🏹', chests: 741, gold: 98000 },
  { rank: 3, name: '旅人 ケン', emoji: '🧭', chests: 623, gold: 84000 },
  { rank: 4, name: 'さすらい ハナ', emoji: '🌸', chests: 512, gold: 71000 },
  { rank: 5, name: '探索者 リョウ', emoji: '🔭', chests: 489, gold: 68000 },
];

const MEDAL = ['🥇', '🥈', '🥉'];

interface RankingProps {
  onClose: () => void;
}

const Ranking: React.FC<RankingProps> = ({ onClose }) => {
  const [tab, setTab] = useState<RankTab>('friend');

  return (
    <div className="rk-screen">
      <div className="rk-topbar">
      <div style={{ width: 60 }} />
        <span className="rk-title">ランキング</span>
        <div style={{ width: 60 }} />
      </div>

      {/* タブ */}
      <div className="rk-tabs">
        <button className={`rk-tab ${tab === 'friend' ? 'active' : ''}`} onClick={() => setTab('friend')}>フレンド</button>
        <button className={`rk-tab ${tab === 'region' ? 'active' : ''}`} onClick={() => setTab('region')}>地域</button>
        <button className={`rk-tab ${tab === 'national' ? 'active' : ''}`} onClick={() => setTab('national')}>全国</button>
      </div>

      {/* フレンドランキング */}
      {tab === 'friend' && (
        <div className="rk-list">
          {FRIEND_RANKS.map(p => (
            <div key={p.rank} className={`rk-row ${p.isMe ? 'me' : ''}`}>
              <div className="rk-medal">
                {p.rank <= 3 ? MEDAL[p.rank - 1] : <span className="rk-num">{p.rank}</span>}
              </div>
              <div className="rk-avatar">{p.emoji}</div>
              <div className="rk-info">
                <p className="rk-name">{p.name}{p.isMe && <span className="rk-me-badge">あなた</span>}</p>
                <p className="rk-sub">宝箱 {p.chests}個</p>
              </div>
              <div className="rk-gold">
                <p className="rk-gold-val">🪙 {p.gold.toLocaleString()}</p>
                <p className="rk-gold-lbl">ゴールド</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 地域ランキング */}
      {tab === 'region' && (
        <div className="rk-list">
          {REGION_RANKS.map(r => (
            <div key={r.rank} className={`rk-row ${r.rank === 1 ? 'top' : ''}`}>
              <div className="rk-medal">
                {r.rank <= 3 ? MEDAL[r.rank - 1] : <span className="rk-num">{r.rank}</span>}
              </div>
              <div className="rk-avatar">🗾</div>
              <div className="rk-info">
                <p className="rk-name">{r.region}</p>
                <p className="rk-sub">参加者 {r.players}人</p>
              </div>
              <div className="rk-gold">
                <p className="rk-gold-val">📦 {r.chests.toLocaleString()}</p>
                <p className="rk-gold-lbl">総取得数</p>
              </div>
            </div>
          ))}
          <div className="rk-region-note">
            ※ あなたの地域：大阪府（2位）
          </div>
        </div>
      )}

      {/* 全国ランキング */}
      {tab === 'national' && (
        <div className="rk-list">
          <div className="rk-top3">
            {NATIONAL_RANKS.slice(0, 3).map(p => (
              <div key={p.rank} className={`rk-podium rank${p.rank}`}>
                <div className="rk-podium-avatar">{p.emoji}</div>
                <div className="rk-podium-medal">{MEDAL[p.rank - 1]}</div>
                <div className="rk-podium-name">{p.name}</div>
                <div className="rk-podium-chests">📦 {p.chests}</div>
              </div>
            ))}
          </div>
          {NATIONAL_RANKS.slice(3).map(p => (
            <div key={p.rank} className="rk-row">
              <div className="rk-medal"><span className="rk-num">{p.rank}</span></div>
              <div className="rk-avatar">{p.emoji}</div>
              <div className="rk-info">
                <p className="rk-name">{p.name}</p>
                <p className="rk-sub">宝箱 {p.chests}個</p>
              </div>
              <div className="rk-gold">
                <p className="rk-gold-val">🪙 {p.gold.toLocaleString()}</p>
                <p className="rk-gold-lbl">ゴールド</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 自分の順位（固定） */}
      <div className="rk-myrank">
        <span>あなたの順位</span>
        <span className="rk-myrank-val">🧝 フレンド 3位 / 全国 圏外</span>
      </div>
    </div>
  );
};

export default Ranking;