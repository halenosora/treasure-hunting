import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from './supabase';
import 'leaflet/dist/leaflet.css';

type ChestType = '無料クーポン' | 'ゲームアイテム' | 'スポンサー' | '限定グッズ' | 'レジェンド';

interface Chest {
  id?: string;
  name: string;
  type: ChestType;
  lat: number;
  lng: number;
  gold_amount: number;
  is_active: boolean;
}

const TYPE_CONFIG: Record<ChestType, { color: string; emoji: string }> = {
  '無料クーポン':  { color: '#22c55e', emoji: '🎫' },
  'ゲームアイテム': { color: '#3b82f6', emoji: '🎮' },
  'スポンサー':    { color: '#e8b84b', emoji: '⭐' },
  '限定グッズ':    { color: '#a855f7', emoji: '💎' },
  'レジェンド':    { color: '#ef4444', emoji: '👑' },
};

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function makeIcon(type: ChestType, selected = false) {
  const { color, emoji } = TYPE_CONFIG[type];
  const s = selected ? 48 : 38;
  return L.divIcon({
    html: `<div style="width:${s}px;height:${s}px;background:${color};border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:${s * 0.45}px;box-shadow:0 2px 8px rgba(0,0,0,0.5)">${emoji}</div>`,
    iconSize: [s, s], iconAnchor: [s / 2, s / 2], className: '',
  });
}

export default function AdminPage({ onClose }: { onClose: () => void }) {
  const [chests, setChests] = useState<Chest[]>([]);
  const [selected, setSelected] = useState<Chest | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState<'map' | 'list'>('map');

  useEffect(() => { fetchChests(); }, []);

  async function fetchChests() {
    const { data } = await supabase.from('chests').select('*').order('created_at', { ascending: false });
    setChests(data ?? []);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function handleMapClick(lat: number, lng: number) {
    if (editing && selected) {
      setSelected({ ...selected, lat, lng });
    } else {
      setSelected({ name: '', type: '無料クーポン', lat, lng, gold_amount: 100, is_active: true });
      setEditing(true);
    }
  }

  async function handleSave() {
    if (!selected || !selected.name.trim()) { showToast('❌ 名前を入力してください'); return; }
    setSaving(true);
    const payload = { name: selected.name, type: selected.type, lat: selected.lat, lng: selected.lng, gold_amount: selected.gold_amount, is_active: selected.is_active };
    const { error } = selected.id
      ? await supabase.from('chests').update(payload).eq('id', selected.id)
      : await supabase.from('chests').insert(payload);
    if (error) showToast('❌ 保存失敗: ' + error.message);
    else { showToast(selected.id ? '✅ 更新しました' : '✅ 宝箱を追加しました'); setEditing(false); setSelected(null); fetchChests(); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm('削除しますか？')) return;
    await supabase.from('chests').delete().eq('id', id);
    showToast('🗑️ 削除しました');
    if (selected?.id === id) { setSelected(null); setEditing(false); }
    fetchChests();
  }

  async function toggleActive(c: Chest) {
    await supabase.from('chests').update({ is_active: !c.is_active }).eq('id', c.id!);
    fetchChests();
  }

  const inp: React.CSSProperties = { width: '100%', padding: '8px 10px', marginTop: 4, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#e8d5a3', fontSize: 14, boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0f0c1a', color: '#e8d5a3', display: 'flex', flexDirection: 'column', zIndex: 9999, fontFamily: 'sans-serif' }}>

      {/* ヘッダー */}
      <div style={{ background: 'linear-gradient(135deg,#1a0a2e,#2d1b69)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,215,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#e8d5a3', fontSize: 20, cursor: 'pointer' }}>←</button>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#ffd700' }}>⚙️ 管理者ページ</span>
        </div>
        <span style={{ fontSize: 12, background: '#ffd700', color: '#1a0a2e', padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>ADMIN</span>
      </div>

      {/* タブ */}
      <div style={{ display: 'flex', background: '#150d2a', borderBottom: '1px solid rgba(255,215,0,0.1)' }}>
        {(['map', 'list'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: 12, border: 'none', background: tab === t ? 'rgba(255,215,0,0.1)' : 'transparent', color: tab === t ? '#ffd700' : '#8a7a9b', borderBottom: tab === t ? '2px solid #ffd700' : '2px solid transparent', cursor: 'pointer', fontSize: 14 }}>
            {t === 'map' ? '🗺️ 地図配置' : '📋 一覧'}
          </button>
        ))}
      </div>

      {/* 地図タブ */}
      {tab === 'map' && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* 地図 */}
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'rgba(0,0,0,0.7)', padding: '6px 14px', borderRadius: 20, fontSize: 12, color: '#e8d5a3', whiteSpace: 'nowrap' }}>
              {editing ? '📍 地図をクリックして位置調整' : '✨ 地図をクリックして宝箱を追加'}
            </div>
            <MapContainer center={[35.5285, 139.5760]} zoom={15} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <ClickHandler onClick={handleMapClick} />
              {chests.map(c => (
                <Marker key={c.id} position={[c.lat, c.lng]} icon={makeIcon(c.type as ChestType, selected?.id === c.id)}
                  eventHandlers={{ click: () => { setSelected(c); setEditing(false); } }} />
              ))}
              {editing && selected && (
                <Marker position={[selected.lat, selected.lng]} icon={makeIcon(selected.type, true)} />
              )}
            </MapContainer>
          </div>

          {/* サイドパネル */}
          <div style={{ width: 300, background: '#150d2a', borderLeft: '1px solid rgba(255,215,0,0.1)', padding: 16, overflowY: 'auto', boxSizing: 'border-box' }}>
            {!selected && (
              <div style={{ textAlign: 'center', opacity: 0.4, marginTop: 60 }}>
                <div style={{ fontSize: 40 }}>🗺️</div>
                <p style={{ fontSize: 13, marginTop: 12 }}>地図をクリックして<br />宝箱を追加</p>
              </div>
            )}

            {selected && !editing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 36, textAlign: 'center' }}>{TYPE_CONFIG[selected.type as ChestType].emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 16, textAlign: 'center' }}>{selected.name}</div>
                <div style={{ textAlign: 'center', fontSize: 12, color: TYPE_CONFIG[selected.type as ChestType].color }}>{selected.type}</div>
                <div style={{ fontSize: 12, opacity: 0.6, textAlign: 'center' }}>💰 {selected.gold_amount}G</div>
                <div style={{ textAlign: 'center', fontSize: 12, color: selected.is_active ? '#4CAF50' : '#f44336' }}>
                  {selected.is_active ? '● アクティブ' : '○ 非アクティブ'}
                </div>
                <button onClick={() => setEditing(true)} style={{ padding: '8px', background: 'rgba(156,111,204,0.2)', border: '1px solid #9c6fcc', borderRadius: 8, color: '#9c6fcc', cursor: 'pointer' }}>✏️ 編集</button>
                <button onClick={() => toggleActive(selected)} style={{ padding: '8px', background: 'rgba(255,152,0,0.1)', border: '1px solid #ff9800', borderRadius: 8, color: '#ff9800', cursor: 'pointer' }}>
                  {selected.is_active ? '⏸ 無効化' : '▶ 有効化'}
                </button>
                <button onClick={() => handleDelete(selected.id!)} style={{ padding: '8px', background: 'rgba(204,68,68,0.1)', border: '1px solid #cc4444', borderRadius: 8, color: '#cc4444', cursor: 'pointer' }}>🗑️ 削除</button>
              </div>
            )}

            {selected && editing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 14, color: '#ffd700', fontWeight: 700 }}>{selected.id ? '✏️ 編集' : '➕ 新規追加'}</div>

                <label style={{ fontSize: 12, color: '#a89bc0' }}>名前 *
                  <input value={selected.name} onChange={e => setSelected({ ...selected, name: e.target.value })} placeholder="例：港の宝箱" style={inp} />
                </label>

                <label style={{ fontSize: 12, color: '#a89bc0' }}>種類
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4 }}>
                    {(Object.keys(TYPE_CONFIG) as ChestType[]).map(t => (
                      <button key={t} onClick={() => setSelected({ ...selected, type: t })} style={{ padding: '6px 4px', border: `2px solid ${selected.type === t ? TYPE_CONFIG[t].color : 'rgba(255,255,255,0.1)'}`, background: selected.type === t ? TYPE_CONFIG[t].color + '33' : 'transparent', color: '#e8d5a3', borderRadius: 8, cursor: 'pointer', fontSize: 11 }}>
                        {TYPE_CONFIG[t].emoji} {t}
                      </button>
                    ))}
                  </div>
                </label>

                <label style={{ fontSize: 12, color: '#a89bc0' }}>ゴール量
                  <input type="number" value={selected.gold_amount} onChange={e => setSelected({ ...selected, gold_amount: Number(e.target.value) })} style={inp} />
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div onClick={() => setSelected({ ...selected, is_active: !selected.is_active })}
                    style={{ width: 44, height: 24, borderRadius: 12, background: selected.is_active ? '#4CAF50' : '#555', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: selected.is_active ? 22 : 2, transition: 'left 0.2s' }} />
                  </div>
                  <span style={{ fontSize: 13 }}>アクティブ</span>
                </div>

                <div style={{ fontSize: 11, opacity: 0.5, background: 'rgba(255,255,255,0.05)', padding: 8, borderRadius: 6 }}>
                  📍 {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}<br />
                  <span style={{ fontSize: 10 }}>地図をクリックして位置を変更</span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '10px', background: '#c8a217', border: 'none', borderRadius: 8, color: '#1a0a2e', fontWeight: 700, cursor: 'pointer' }}>
                    {saving ? '保存中...' : selected.id ? '💾 更新' : '✨ 追加'}
                  </button>
                  <button onClick={() => { setEditing(false); if (!selected.id) setSelected(null); }} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#e8d5a3', cursor: 'pointer' }}>
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 一覧タブ */}
      {tab === 'list' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {chests.length === 0 ? (
            <div style={{ textAlign: 'center', opacity: 0.4, marginTop: 60 }}>
              <div style={{ fontSize: 40 }}>📭</div>
              <p>宝箱がまだありません</p>
            </div>
          ) : chests.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 12, marginBottom: 10, borderLeft: `4px solid ${TYPE_CONFIG[c.type as ChestType]?.color ?? '#888'}` }}>
              <span style={{ fontSize: 28 }}>{TYPE_CONFIG[c.type as ChestType]?.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{c.type} · 💰{c.gold_amount}G · {c.is_active ? '✅' : '⏸'}</div>
              </div>
              <button onClick={() => { setSelected(c); setEditing(true); setTab('map'); }} style={{ width: 32, height: 32, background: 'rgba(156,111,204,0.2)', border: 'none', borderRadius: 8, color: '#9c6fcc', cursor: 'pointer' }}>✏️</button>
              <button onClick={() => handleDelete(c.id!)} style={{ width: 32, height: 32, background: 'rgba(204,68,68,0.2)', border: 'none', borderRadius: 8, color: '#cc4444', cursor: 'pointer' }}>🗑️</button>
            </div>
          ))}
        </div>
      )}

      {/* トースト */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: '#1e1235', border: '1px solid rgba(255,215,0,0.3)', padding: '10px 24px', borderRadius: 24, fontSize: 14, zIndex: 99999 }}>
          {toast}
        </div>
      )}
    </div>
  );
}