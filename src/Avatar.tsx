import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { RARITY_COLORS, WEARABLE_CATEGORIES, Item, ItemCategory, RARITY_ORDER } from './items';
import './Avatar.css';

interface AvatarProps { onClose: () => void; }

const MENU_ITEMS = [
  { id: 'avatar',    icon: '👤', label: '着せ替え' },
  { id: 'notice',   icon: '📢', label: 'お知らせ' },
  { id: 'mission',  icon: '🎯', label: 'ミッション' },
  { id: 'friend',   icon: '👥', label: 'フレンド' },
  { id: 'setting',  icon: '⚙️', label: '設定' },
];

const MISSIONS = [
  { id:1, title:'初めての宝箱',     desc:'宝箱を1個開封する',     reward:100,  progress:1, total:1,  done:true },
  { id:2, title:'宝探し初級',      desc:'宝箱を5個開封する',     reward:300,  progress:3, total:5,  done:false },
  { id:3, title:'地域の探索者',     desc:'異なるエリアで宝箱を開く', reward:500,  progress:1, total:3,  done:false },
  { id:4, title:'コレクター',       desc:'アイテムを10個集める',   reward:1000, progress:3, total:10, done:false },
  { id:5, title:'ランキング入り',    desc:'ランキングトップ10に入る', reward:2000, progress:0, total:1,  done:false },
];

export default function Avatar({ onClose }: AvatarProps) {
  const [tab, setTab]         = useState('notice');
  const [profile, setProfile] = useState<any>(null);
  const [items, setItems]     = useState<any[]>([]);
  const [equipped, setEquipped] = useState<Partial<Record<ItemCategory, Item>>>({});
  const [activeCategory, setActiveCategory] = useState<ItemCategory | 'すべて'>('すべて');
  const [saving, setSaving]   = useState(false);
  const [noticeOpen, setNoticeOpen] = useState<number | null>(null);
  // お知らせ取得
  supabase.from('notices').select('*').eq('is_published', true).order('created_at', { ascending: false })
  .then(({ data }) => { if (data) setNotices(data); });
// 既読取得
supabase.from('notice_reads').select('notice_id').eq('user_id', user.id)
  .then(({ data }) => { if (data) setReadIds(new Set(data.map((r: any) => r.notice_id))); });
  // 着せ替え並び替え用
  const [avatarSortKey, setAvatarSortKey] = useState<'レア度' | '名前' | 'カテゴリ'>('レア度');
  const [avatarSortAsc, setAvatarSortAsc] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        .then(({ data }) => { if (data) setProfile(data); });
      supabase.from('items').select('*').eq('user_id', user.id)
        .then(({ data }) => { if (data) setItems(data); });
    });
  }, []);

  const wearableItems = items.filter(i => WEARABLE_CATEGORIES.includes(i.category as ItemCategory));

  const sortedWearableItems = (activeCategory === 'すべて' ? wearableItems : wearableItems.filter(i => i.category === activeCategory))
    .slice()
    .sort((a, b) => {
      let result = 0;
      if (avatarSortKey === 'レア度') {
        result = (RARITY_ORDER[a.rarity as keyof typeof RARITY_ORDER] ?? 0)
               - (RARITY_ORDER[b.rarity as keyof typeof RARITY_ORDER] ?? 0);
      } else if (avatarSortKey === '名前') {
        result = a.name.localeCompare(b.name, 'ja');
      } else if (avatarSortKey === 'カテゴリ') {
        result = a.category.localeCompare(b.category, 'ja');
      }
      return avatarSortAsc ? result : -result;
    });

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
  }

  return (
    <div style={{ position:'absolute', inset:0, background:'#0a0e1a', display:'flex', flexDirection:'column', overflow:'hidden', fontFamily:'sans-serif', color:'#e8d5a3' }}>

      {/* ヘッダー */}
      <div style={{ padding:'14px 16px', background:'linear-gradient(135deg,#0d1220,#1a0a2e)', borderBottom:'1px solid rgba(232,184,75,0.2)', flexShrink:0 }}>
        <div style={{ fontSize:10, letterSpacing:4, color:'rgba(232,184,75,0.5)', marginBottom:2 }}>MY PAGE</div>
        <div style={{ fontSize:18, color:'#e8b84b', fontFamily:'Georgia,serif', letterSpacing:2 }}>マイページ</div>
      </div>

      {/* ── プロフィールカード ── */}
      <div style={{ background:'linear-gradient(135deg,#0f1628,#1a0a2e)', borderBottom:'1px solid rgba(232,184,75,0.1)', flexShrink:0 }}>

        {/* アバター表示エリア */}
        <div style={{ position:'relative', height:420, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center,rgba(232,184,75,0.06) 0%,transparent 70%)' }}/>
          {(profile?.vroid_full_body_url || profile?.avatar_url) ? (
            <img
              src={profile.vroid_full_body_url || profile.avatar_url}
              alt="avatar"
              draggable={false}
              style={{
                height:'100%',
                width:'auto',
                objectFit:'contain',
                filter:'drop-shadow(0 8px 24px rgba(232,184,75,0.4))',
              }}
            />
          ) : (
            <div style={{ fontSize:120 }}>👤</div>
          )}
          <div style={{ position:'absolute', top:12, right:12, background:'#e8b84b', color:'#1a0e00', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, zIndex:5 }}>
            Lv.{profile?.adventure_level ?? 1}
          </div>
          <div style={{ position:'absolute', top:12, left:12, zIndex:5 }}>
            <button
              onClick={async () => {
                const clientId = process.env.REACT_APP_VROID_CLIENT_ID;
                const redirectUri = `${window.location.origin}/vroid-callback`;
                const array = new Uint8Array(32);
                crypto.getRandomValues(array);
                const codeVerifier = btoa(Array.from(array, b => String.fromCharCode(b)).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
                const encoder = new TextEncoder();
                const data = encoder.encode(codeVerifier);
                const digest = await crypto.subtle.digest('SHA-256', data);
                const codeChallenge = btoa(Array.from(new Uint8Array(digest), b => String.fromCharCode(b)).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
                const stateArray = new Uint8Array(16);
                crypto.getRandomValues(stateArray);
                const state = btoa(Array.from(stateArray, b => String.fromCharCode(b)).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
                sessionStorage.setItem('vroid_code_verifier', codeVerifier);
                sessionStorage.setItem('vroid_state', state);
                const params = new URLSearchParams({ client_id: clientId ?? '', redirect_uri: redirectUri, response_type: 'code', scope: 'default', state, code_challenge: codeChallenge, code_challenge_method: 'S256' });
                window.location.href = `https://hub.vroid.com/oauth/authorize?${params}`;
              }}
              style={{ padding:'6px 12px', background:'rgba(100,149,237,0.15)', border:'1px solid rgba(100,149,237,0.4)', borderRadius:20, color:'#6495ed', cursor:'pointer', fontSize:10, fontFamily:'sans-serif' }}
            >🎭 VRoid変更</button>
          </div>
        </div>
        
        {/* プロフィール情報 */}
        <div style={{ padding:'12px 16px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:17, fontWeight:700, color:'#e8d5a3', fontFamily:'Georgia,serif' }}>{profile?.username ?? '冒険者'}</div>
              <div style={{ fontSize:11, color:'rgba(232,184,75,0.7)', marginTop:2 }}>{profile?.avatar_title ?? '新米冒険者'}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>💰 {(profile?.gold ?? 0).toLocaleString()} G</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:2 }}>📦 宝箱 {items.length}個</div>
            </div>
          </div>
        </div>

        {/* 経験値バー */}
        <div style={{ padding:'0 16px 12px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(232,184,75,0.5)', marginBottom:4 }}>
            <span>次のレベルまで</span>
            <span>{Math.min(items.length * 10, 100)}%</span>
          </div>
          <div style={{ height:4, background:'rgba(255,255,255,0.1)', borderRadius:2, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${Math.min(items.length * 10, 100)}%`, background:'linear-gradient(to right,#e8b84b,#fff)', borderRadius:2, transition:'width 0.5s' }}/>
          </div>
        </div>
      </div>

      {/* メニュータブ */}
      <div style={{ display:'flex', background:'rgba(0,0,0,0.3)', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0, overflowX:'auto' }}>
        {MENU_ITEMS.map(m => (
          <button key={m.id} onClick={() => setTab(m.id)} style={{ flex:1, minWidth:60, padding:'10px 4px', background:'transparent', border:'none', borderBottom:`2px solid ${tab===m.id?'#e8b84b':'transparent'}`, color:tab===m.id?'#e8b84b':'#4a5268', cursor:'pointer', fontSize:9, display:'flex', flexDirection:'column', alignItems:'center', gap:3, transition:'all 0.2s' }}>
            <span style={{ fontSize:18 }}>{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>

      {/* コンテンツ */}
      <div style={{ flex:1, overflowY:'auto' }}>

         {/* 着せ替え */}
         {tab === 'avatar' && (
          <div style={{ padding:16 }}>
            <div style={{ fontSize:10, letterSpacing:3, color:'rgba(232,184,75,0.5)', marginBottom:12 }}>カテゴリー ────────────</div>
            <div style={{ display:'flex', gap:6, overflowX:'auto', marginBottom:10, paddingBottom:4 }}>
              {['すべて', ...WEARABLE_CATEGORIES].map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat as any)} style={{ flexShrink:0, padding:'6px 12px', background:activeCategory===cat?'rgba(232,184,75,0.15)':'rgba(255,255,255,0.04)', border:`1px solid ${activeCategory===cat?'#e8b84b':'rgba(255,255,255,0.1)'}`, borderRadius:20, color:activeCategory===cat?'#e8b84b':'#e8d5a3', cursor:'pointer', fontSize:12, whiteSpace:'nowrap' }}>
                  {cat}{cat !== 'すべて' && equipped[cat as ItemCategory] && <span style={{ marginLeft:4, color:'#e8b84b' }}>●</span>}
                </button>
              ))}
            </div>

            {/* 並び替えバー */}
            <div style={{ display:'flex', gap:6, marginBottom:14, overflowX:'auto' }}>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)', alignSelf:'center', marginRight:4, flexShrink:0 }}>並び替え：</span>
              {(['レア度', '名前', 'カテゴリ'] as const).map(key => (
                <button
                  key={key}
                  onClick={() => {
                    if (avatarSortKey === key) setAvatarSortAsc(v => !v);
                    else { setAvatarSortKey(key); setAvatarSortAsc(false); }
                  }}
                  style={{ flexShrink:0, padding:'4px 12px', background:avatarSortKey===key?'rgba(232,184,75,0.2)':'rgba(255,255,255,0.06)', border:`1px solid ${avatarSortKey===key?'#e8b84b':'rgba(255,255,255,0.1)'}`, borderRadius:20, color:avatarSortKey===key?'#e8b84b':'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:11 }}
                >
                  {key} {avatarSortKey===key ? (avatarSortAsc ? '↑' : '↓') : ''}
                </button>
              ))}
            </div>

            <div style={{ display:'flex', gap:6, overflowX:'auto', marginBottom:16, paddingBottom:4 }}>
            {sortedWearableItems.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 20px', opacity:0.4 }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🔒</div>
                <p style={{ fontSize:13 }}>このカテゴリーのアイテムがありません</p>
                <p style={{ fontSize:11, marginTop:4 }}>宝箱を開けてアイテムをゲットしよう！</p>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {sortedWearableItems.map(item => {
                  const isEquipped = equipped[item.category as ItemCategory]?.id === item.id;
                  return (
                    <div key={item.id} onClick={() => setEquipped(p => ({...p, [item.category]:item}))} style={{ padding:12, background:isEquipped?'rgba(232,184,75,0.1)':'rgba(255,255,255,0.04)', border:`1px solid ${isEquipped?'#e8b84b':'rgba(255,255,255,0.08)'}`, borderRadius:10, cursor:'pointer', textAlign:'center', position:'relative' }}>
                      <div style={{ fontSize:32, marginBottom:6 }}>{item.emoji}</div>
                      <div style={{ fontSize:10, color:RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS], marginBottom:2 }}>{item.rarity}</div>
                      <div style={{ fontSize:12, color:'#e8d5a3' }}>{item.name}</div>
                      {isEquipped && <div style={{ position:'absolute', top:6, right:6, background:'#e8b84b', color:'#1a0e00', fontSize:9, padding:'2px 5px', borderRadius:6, fontWeight:700 }}>装備中</div>}
                    </div>
                  );
                })}
              </div>
            )}
            <button onClick={handleSave} style={{ width:'100%', marginTop:16, padding:'13px', background:'linear-gradient(135deg,#c8900a,#e8b84b)', border:'none', borderRadius:8, color:'#1a0e00', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'Georgia,serif' }}>
              {saving ? '保存中...' : '💾 着せ替えを保存'}
            </button>
          </div>
        )}

        {/* お知らせ */}
        {tab === 'notice' && (
          <div style={{ padding:16 }}>
            <div style={{ fontSize:10, letterSpacing:3, color:'rgba(232,184,75,0.5)', marginBottom:12 }}>お知らせ ──────────────</div>
            {notices.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 20px', opacity:0.4 }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📢</div>
                <p style={{ fontSize:13 }}>お知らせはありません</p>
              </div>
            ) : (
              notices.map(n => {
                const isRead = readIds.has(n.id);
                return (
                  <div key={n.id}
                    onClick={async () => {
                      setNoticeOpen(noticeOpen === n.id ? null : n.id);
                      if (!isRead) {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (user) {
                          await supabase.from('notice_reads').insert({ user_id: user.id, notice_id: n.id });
                          setReadIds(prev => new Set([...prev, n.id]));
                        }
                      }
                    }}
                    style={{ marginBottom:10, background:isRead?'rgba(255,255,255,0.02)':'rgba(255,255,255,0.06)', border:`1px solid ${isRead?'rgba(255,255,255,0.06)':'rgba(232,184,75,0.2)'}`, borderRadius:10, overflow:'hidden', cursor:'pointer' }}
                  >
                    <div style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:10 }}>
                      {!isRead && <div style={{ width:8, height:8, borderRadius:'50%', background:'#e8b84b', flexShrink:0 }}/>}
                      {isRead && <div style={{ width:8, height:8, borderRadius:'50%', background:'rgba(255,255,255,0.15)', flexShrink:0 }}/>}
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:isRead?'rgba(232,213,163,0.5)':'#e8d5a3' }}>{n.title}</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>
                          {new Date(n.created_at).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                      {!isRead && <div style={{ fontSize:9, background:'#e8b84b', color:'#1a0e00', padding:'2px 6px', borderRadius:10, fontWeight:700, flexShrink:0 }}>NEW</div>}
                      <span style={{ color:'rgba(255,255,255,0.3)', fontSize:12, marginLeft:4 }}>{noticeOpen===n.id?'▲':'▼'}</span>
                    </div>
                    {noticeOpen===n.id && (
                      <div style={{ padding:'0 14px 14px', fontSize:13, color:'rgba(232,213,163,0.7)', lineHeight:1.6 }}>{n.body}</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ミッション */}
        {tab === 'mission' && (
          <div style={{ padding:16 }}>
            <div style={{ fontSize:10, letterSpacing:3, color:'rgba(232,184,75,0.5)', marginBottom:12 }}>ミッション ────────────</div>
            {MISSIONS.map(m => (
              <div key={m.id} style={{ marginBottom:10, padding:14, background:m.done?'rgba(232,184,75,0.08)':'rgba(255,255,255,0.04)', border:`1px solid ${m.done?'rgba(232,184,75,0.3)':'rgba(255,255,255,0.08)'}`, borderRadius:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:m.done?'#e8b84b':'#e8d5a3' }}>{m.done?'✅ ':''}{m.title}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{m.desc}</div>
                  </div>
                  <div style={{ fontSize:12, color:'#e8b84b', whiteSpace:'nowrap', marginLeft:8 }}>+{m.reward.toLocaleString()}G</div>
                </div>
                <div style={{ height:4, background:'rgba(255,255,255,0.08)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(m.progress/m.total)*100}%`, background:m.done?'#e8b84b':'rgba(232,184,75,0.5)', borderRadius:2, transition:'width 0.5s' }}/>
                </div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:4, textAlign:'right' }}>{m.progress} / {m.total}</div>
                {m.done && (
                  <button style={{ width:'100%', marginTop:8, padding:'8px', background:'linear-gradient(135deg,#c8900a,#e8b84b)', border:'none', borderRadius:6, color:'#1a0e00', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                    報酬を受け取る
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* フレンド */}
        {tab === 'friend' && (
          <div style={{ padding:16 }}>
            <div style={{ fontSize:10, letterSpacing:3, color:'rgba(232,184,75,0.5)', marginBottom:12 }}>フレンド ──────────────</div>
            <div style={{ textAlign:'center', padding:'40px 20px', opacity:0.4 }}>
              <div style={{ fontSize:48, marginBottom:12 }}>👥</div>
              <p style={{ fontSize:14 }}>フレンド機能は近日公開予定です</p>
              <p style={{ fontSize:12, marginTop:8 }}>お楽しみに！</p>
            </div>
          </div>
        )}

        {/* 設定 */}
        {tab === 'setting' && (
          <div style={{ padding:16 }}>
            <div style={{ fontSize:10, letterSpacing:3, color:'rgba(232,184,75,0.5)', marginBottom:12 }}>設定 ──────────────────</div>
            {[
              { label:'プッシュ通知', desc:'宝箱情報などの通知を受け取る' },
              { label:'位置情報', desc:'GPS機能を有効にする' },
              { label:'サウンド', desc:'効果音・BGMのオン/オフ' },
              { label:'ダークモード', desc:'画面の表示モード' },
            ].map((s, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div>
                <div style={{ fontSize:14, color:'#e8d5a3' }}>{s.label}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{s.desc}</div>
                </div>
                <div style={{ width:44, height:24, borderRadius:12, background:'rgba(232,184,75,0.3)', position:'relative', cursor:'pointer' }}>
                  <div style={{ width:20, height:20, borderRadius:'50%', background:'#e8b84b', position:'absolute', top:2, right:2, transition:'left 0.2s' }}/>
                </div>
              </div>
            ))}
            <div style={{ marginTop:20 }}>
              <div style={{ fontSize:10, letterSpacing:3, color:'rgba(232,184,75,0.5)', marginBottom:12 }}>アカウント ────────────</div>
              <button style={{ width:'100%', padding:'12px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, color:'#ef4444', cursor:'pointer', fontSize:13 }}>
                アカウントを削除
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
