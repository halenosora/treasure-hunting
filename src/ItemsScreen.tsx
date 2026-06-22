import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { RARITY_COLORS } from './items';
import './ItemsScreen.css';

interface ItemsProps {
  userId: string;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  '帽子':       '🎩',
  '上着':       '🧥',
  'パンツ':     '👖',
  '靴下':       '🧦',
  '靴':         '👟',
  'アクセサリー': '💍',
  'ペット':     '🐾',
  '乗り物':     '🚗',
  'クーポン':   '🎫',
  'NFT':        '⭐',
  'すべて':     '🎒',
};

const Items: React.FC<ItemsProps> = ({ userId, onClose }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('すべて');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    loadItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [userId]);

  const loadItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .order('obtained_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  const categories = ['すべて', ...Array.from(new Set(items.map(i => i.category)))];
  const filtered = activeCategory === 'すべて' ? items : items.filter(i => i.category === activeCategory);

  return (
    <div className="items-screen">
      <div className="items-topbar">
      <div style={{ width: 60 }} />
        <span className="items-title">アイテムボックス</span>
        <span className="items-count">{items.length}個</span>
      </div>

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