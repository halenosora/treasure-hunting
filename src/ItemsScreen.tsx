import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { RARITY_COLORS, RARITY_ORDER } from './items';
import './ItemsScreen.css';

interface ItemsProps {
  userId: string;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  '帽子':        '🎩',
  '上着':        '🧥',
  'パンツ':      '👖',
  '靴下':        '🧦',
  '靴':          '👟',
  'アクセサリー': '💍',
  'ペット':      '🐾',
  '乗り物':      '🚗',
  'クーポン':    '🎫',
  'NFT':         '⭐',
  'すべて':      '🎒',
};

type SortKey = '取得日' | 'レア度' | '名前' | 'カテゴリ';

const Items: React.FC<ItemsProps> = ({ userId, onClose }) => {
  const [items, setItems]               = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeCategory, setActiveCategory] = useState('すべて');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [sortKey, setSortKey]           = useState<SortKey>('取得日');
  const [sortAsc, setSortAsc]           = useState(false);

  useEffect(() => {
    loadItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId);
    setItems(data ?? []);
    setLoading(false);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const categories = ['すべて', ...Array.from(new Set(items.map(i => i.category)))];

  const filtered = (activeCategory === 'すべて' ? items : items.filter(i => i.category === activeCategory))
    .slice()
    .sort((a, b) => {
      let result = 0;
      if (sortKey === '取得日') {
        result = new Date(a.obtained_at).getTime() - new Date(b.obtained_at).getTime();
      } else if (sortKey === 'レア度') {
        result = (RARITY_ORDER[a.rarity as keyof typeof RARITY_ORDER] ?? 0)
               - (RARITY_ORDER[b.rarity as keyof typeof RARITY_ORDER] ?? 0);
      } else if (sortKey === '名前') {
        result = a.name.localeCompare(b.name, 'ja');
      } else if (sortKey === 'カテゴリ') {
        result = a.category.localeCompare(b.category, 'ja');
      }
      return sortAsc ? result : -result;
    });

  return (
    <div className="items-screen">

      {/* ヘッダー */}
      <div className="items-topbar">
        <div style={{ width:60 }} />
        <span className="items-title">アイテムボックス</span>
        <span className="items-count">{items.length}個</span>
      </div>

      {/* カテゴリタブ */}
      <div className="items-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={`items-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {CATEGORY_ICONS[cat] ?? '📦'} {cat}
          </button>
        ))}
      </div>

      {/* 並び替えバー */}
      <div style={{ display:'flex', gap:6, padding:'8px 12px', background:'rgba(0,0,0,0.2)', overflowX:'auto', flexShrink:0 }}>
        <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)', alignSelf:'center', marginRight:4 }}>並び替え：</span>
        {(['取得日', 'レア度', '名前', 'カテゴリ'] as SortKey[]).map(key => (
          <button
            key={key}
            onClick={() => handleSort(key)}
            style={{
              flexShrink:0,
              padding:'4px 12px',
              background: sortKey === key ? 'rgba(232,184,75,0.2)' : 'rgba(255,255,255,0.06)',
              border:`1px solid ${sortKey === key ? '#e8b84b' : 'rgba(255,255,255,0.1)'}`,
              borderRadius:20,
              color: sortKey === key ? '#e8b84b' : 'rgba(255,255,255,0.5)',
              cursor:'pointer',
              fontSize:11,
            }}
          >
            {key} {sortKey === key ? (sortAsc ? '↑' : '↓') : ''}
          </button>
        ))}
      </div>

      {/* アイテム一覧 */}
      {loading ? (
        <div className="items-loading">
          <div className="items-spinner" />
          <p>読み込み中...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="items-empty">
          <p>🎒</p>
          <p>アイテムがありません</p>
          <p>宝箱を開けてアイテムをゲットしよう！</p>
        </div>
      ) : (
        <div className="items-grid">
          {filtered.map(item => (
            <div
              key={item.id}
              className={`items-card ${item.is_equipped ? 'equipped' : ''}`}
              onClick={() => setSelectedItem(item)}
            >
              <div className="items-card-emoji">{item.emoji}</div>
              <div
                className="items-card-rarity"
                style={{ color: RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] ?? '#8892a4' }}
              >
                {item.rarity}
              </div>
              <div className="items-card-name">{item.name}</div>
              <div className="items-card-source">{item.source}</div>
              {item.is_equipped && <div className="items-card-badge">装備中</div>}
              {item.is_nft && <div className="items-card-nft">NFT</div>}
            </div>
          ))}
        </div>
      )}

      {/* アイテム詳細モーダル */}
      {selectedItem && (
        <div className="items-detail-overlay" onClick={() => setSelectedItem(null)}>
          <div className="items-detail-card" onClick={e => e.stopPropagation()}>
            <button className="items-detail-close" onClick={() => setSelectedItem(null)}>✕</button>
            <div className="items-detail-emoji">{selectedItem.emoji}</div>
            <h2 className="items-detail-name">{selectedItem.name}</h2>
            <div
              className="items-detail-rarity"
              style={{ color: RARITY_COLORS[selectedItem.rarity as keyof typeof RARITY_COLORS] }}
            >
              {selectedItem.rarity}
            </div>
            <div className="items-detail-info">
              <div className="items-detail-row">
                <span>カテゴリ</span><span>{selectedItem.category}</span>
              </div>
              <div className="items-detail-row">
                <span>入手場所</span><span>{selectedItem.source}</span>
              </div>
              <div className="items-detail-row">
                <span>取得日</span>
                <span>{selectedItem.obtained_at ? new Date(selectedItem.obtained_at).toLocaleDateString('ja-JP') : '不明'}</span>
              </div>
              <div className="items-detail-row">
                <span>NFT</span><span>{selectedItem.is_nft ? '✅ あり' : 'なし'}</span>
              </div>
            </div>
            <div className="items-detail-btns">
              <button className="items-detail-equip">
                {selectedItem.is_equipped ? '装備を外す' : '装備する'}
              </button>
              {selectedItem.is_nft && (
                <button className="items-detail-trade">💎 取引する</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;