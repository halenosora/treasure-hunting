import React, { useState } from 'react';
import './Avatar.css';
import { Item, ItemCategory, RARITY_COLORS, DEFAULT_ITEMS, LOCAL_ITEMS, COLLAB_ITEMS } from './items';

const CATEGORIES: ItemCategory[] = ['帽子', '服', 'シューズ', 'アクセサリー', '武器'];

// デモ用：最初から全アイテムを所持
const ALL_ITEMS = [...DEFAULT_ITEMS, ...LOCAL_ITEMS, ...COLLAB_ITEMS];

interface AvatarProps {
  onClose: () => void;
}

const Avatar: React.FC<AvatarProps> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<ItemCategory>('帽子');
  const [equipped, setEquipped] = useState<Partial<Record<ItemCategory, Item>>>({
    帽子: DEFAULT_ITEMS[0],
    武器: DEFAULT_ITEMS[1],
  });
  const [saved, setSaved] = useState(false);

  const filteredItems = ALL_ITEMS.filter(item => item.category === activeCategory);

  const handleEquip = (item: Item) => {
    setEquipped(prev => ({ ...prev, [item.category]: item }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
  };

  return (
    <div className="av-screen">
      <div className="av-topbar">
      <div style={{ width: 60 }} />
        <span className="av-title">アバター</span>
        <button className="av-save" onClick={handleSave}>
          {saved ? '✓ 保存!' : '保存'}
        </button>
      </div>

      {/* プレビュー */}
      <div className="av-preview-wrap">
        <div className="av-preview-card">
          <div className="av-preview-bg">
            <div className="av-preview-hat">{equipped['帽子']?.emoji ?? '　'}</div>
            <div className="av-preview-face">🧝</div>
            <div className="av-preview-bottom">
              <span>{equipped['服']?.emoji ?? '　'}</span>
              <span>{equipped['シューズ']?.emoji ?? '　'}</span>
            </div>
            <div className="av-preview-acc">
              <span>{equipped['アクセサリー']?.emoji ?? '　'}</span>
              <span>{equipped['武器']?.emoji ?? '　'}</span>
            </div>
          </div>
          <div className="av-preview-name">冒険者 Lv.12</div>
          <div className="av-preview-stats">
            <span>宝箱 47個</span>
            <span>近畿ランク 3位</span>
          </div>
          {/* 装備中アイテム一覧 */}
          <div className="av-equipped-list">
            {CATEGORIES.map(cat => equipped[cat] && (
              <div key={cat} className="av-equipped-item">
                <span>{equipped[cat]!.emoji}</span>
                <span className="av-equipped-name">{equipped[cat]!.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* カテゴリタブ */}
      <div className="av-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`av-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
            {equipped[cat] && <span className="av-tab-dot" />}
          </button>
        ))}
      </div>

      {/* アイテム一覧 */}
      <div className="av-items-grid">
        {filteredItems.length === 0 && (
          <div className="av-empty">
            <p>🔒</p>
            <p>宝箱を開けてアイテムをゲットしよう！</p>
          </div>
        )}
        {filteredItems.map(item => {
          const isEquipped = equipped[item.category]?.id === item.id;
          return (
            <div
              key={item.id}
              className={`av-item-card ${isEquipped ? 'equipped' : ''}`}
              onClick={() => handleEquip(item)}
            >
              <div className="av-item-emoji">{item.emoji}</div>
              <div
                className="av-item-rarity"
                style={{ color: RARITY_COLORS[item.rarity] }}
              >
                {item.rarity}
              </div>
              <div className="av-item-name">{item.name}</div>
              <div className="av-item-source">{item.source}</div>
              {isEquipped && <div className="av-item-equipped-badge">装備中</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Avatar;