import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import './Ranking.css';

type RankTab = 'national';

interface RankPlayer {
  id: string;
  username: string;
  gold: number;
  avatar_url: string;
  chest_count: number;
  rank: number;
}

const MEDAL = ['🥇', '🥈', '🥉'];

interface RankingProps {
  onClose: () => void;
}

const Ranking: React.FC<RankingProps> = ({ onClose }) => {
  const [players, setPlayers] = useState<RankPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<RankPlayer | null>(null);

  useEffect(() => {
    fetchRanking();
  }, []);

  async function fetchRanking() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { data } = await supabase
      .from('ranking_view')
      .select('*')
      .order('gold', { ascending: false })
      .limit(50);

    if (data) {
      setPlayers(data);
      if (user) {
        const me = data.find((p: RankPlayer) => p.id === user.id);
        if (me) setMyRank(me);
      }
    }
    setLoading(false);
  }

  return (
    <div className="rk-screen">
      <div className="rk-topbar">
        <div style={{ width: 60 }} />
        <span className="rk-title">ランキング</span>
        <div style={{ width: 60 }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(232,184,75,0.2)', borderTopColor: '#e8b84b', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'rgba(232,184,75,0.5)', fontSize: 13 }}>読み込み中...</p>
        </div>
      ) : players.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 48 }}>🏆</div>
          <p style={{ color: 'rgba(232,184,75,0.5)', fontSize: 14 }}>まだランキングデータがありません</p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>宝箱を開封してランキングに参加しよう！</p>
        </div>
      ) : (
        <>
          {/* トップ3 */}
          {players.length >= 3 && (
            <div className="rk-top3">
              {[players[1], players[0], players[2]].map((p, i) => (
                p && (
                  <div key={p.id} className={`rk-podium rank${i === 1 ? 1 : i === 0 ? 2 : 3}`}>
                    <div className="rk-podium-avatar">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.username} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(232,184,75,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>
                      )}
                    </div>
                    <div className="rk-podium-medal">{MEDAL[i === 1 ? 0 : i === 0 ? 1 : 2]}</div>
                    <div className="rk-podium-name">{p.username}</div>
                    <div className="rk-podium-chests">📦 {p.chest_count}</div>
                  </div>
                )
              ))}
            </div>
          )}

          {/* 4位以降 */}
          <div className="rk-list">
            {players.slice(3).map(p => (
              <div key={p.id} className={`rk-row ${myRank?.id === p.id ? 'me' : ''}`}>
                <div className="rk-medal">
                  <span className="rk-num">{p.rank}</span>
                </div>
                <div className="rk-avatar">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.username} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <span>👤</span>
                  )}
                </div>
                <div className="rk-info">
                  <p className="rk-name">
                    {p.username}
                    {myRank?.id === p.id && <span className="rk-me-badge">あなた</span>}
                  </p>
                  <p className="rk-sub">宝箱 {p.chest_count}個</p>
                </div>
                <div className="rk-gold">
                  <p className="rk-gold-val">💰 {p.gold.toLocaleString()}</p>
                  <p className="rk-gold-lbl">ゴールド</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 自分の順位 */}
      {myRank && (
        <div className="rk-myrank">
          <span>あなたの順位</span>
          <span className="rk-myrank-val">
            {myRank.rank <= 3 ? MEDAL[myRank.rank - 1] : `${myRank.rank}位`} / 全国 {players.length}人中
          </span>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Ranking;