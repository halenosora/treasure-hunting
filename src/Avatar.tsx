import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { RARITY_COLORS, WEARABLE_CATEGORIES, Item, ItemCategory } from './items';
import './Avatar.css';

interface AvatarProps { onClose: () => void; }

const MENU_ITEMS = [
  { id: 'avatar',    icon: '👤', label: '着せ替え' },
  { id: 'notice',   icon: '📢', label: 'お知らせ' },
  { id: 'mission',  icon: '🎯', label: 'ミッション' },
  { id: 'friend',   icon: '👥', label: 'フレンド' },
  { id: 'setting',  icon: '⚙️', label: '設定' },
];

// ✅ TERRAHUNT → NEXARA に修正
const NOTICES = [
  { id:1, title:'NEXARAへようこそ！', body:'宝箱を探して冒険を始めよう！', date:'2026-06-22', isNew:true },
  { id:2, title:'新エリア追加のお知らせ', body:'横浜エリアに新しい宝箱が追加されました。', date:'2026-06-20', isNew:true },
  { id:3, title:'メンテナンス完了', body:'システムメンテナンスが完了しました。', date:'2026-06-18', isNew:false },
];

const MISSIONS = [
  { id:1, title:'初めての宝箱',     desc:'宝箱を1個開封する',     reward:100,  progress:1, total:1,  done:true },
  { id:2, title:'宝探し初級',      desc:'宝箱を5個開封する',     reward:300,  progress:3, total:5,  done:false },
  { id:3, title:'地域の探索者',     desc:'異なるエリアで宝箱を開く', reward:500,  progress:1, total:3,  done:false },
  { id:4, title:'コレクター',       desc:'アイテムを10個集める',   reward:1000, progress:3, total:10, done:false },
  { id:5, title:'ランキング入り',    desc:'ランキングトップ10に入る', reward:2000, progress:0, total:1,  done:false },
];

// ── タップリアクションの種類 ──────────────────────────────────
type Reaction = 'none' | 'wave' | 'jump' | 'spin' | 'heart';

const REACTIONS: { type: Reaction; label: string; emoji: string }[] = [
  { type: 'wave',  label: 'バイバイ', emoji: '👋' },
  { type: 'jump',  label: 'ジャンプ', emoji: '⬆️' },
  { type: 'spin',  label: '回転',     emoji: '🌀' },
  { type: 'heart', label: 'ハート',   emoji: '❤️' },
];

export default function Avatar({ onClose }: AvatarProps) {
  const [tab, setTab]         = useState('notice');
  const [profile, setProfile] = useState<any>(null);
  const [items, setItems]     = useState<any[]>([]);
  const [equipped, setEquipped] = useState<Partial<Record<ItemCategory, Item>>>({});
  const [activeCategory, setActiveCategory] = useState<ItemCategory>('帽子');
  const [saving, setSaving]   = useState(false);
  const [noticeOpen, setNoticeOpen] = useState<number | null>(null);

  // ── アバター操作用のstate ───────────────────────────────────
  const [reaction, setReaction]       = useState<Reaction>('none');
  const [isDragging, setIsDragging]   = useState(false);
  const [rotateY, setRotateY]         = useState(0);       // 左右回転角度（度）
  const [showEmoji, setShowEmoji]     = useState('');      // タップ時に出るエフェクト絵文字
  const dragStartX  = useRef(0);                           // ドラッグ開始X座標
  const dragStartRot = useRef(0);                          // ドラッグ開始時の回転角度
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        .then(({ data }) => { if (data) setProfile(data); });
      supabase.from('items').select('*').eq('user_id', user.id)
        .then(({ data }) => { if (data) setItems(data); });
    });
  }, []);

  // ── アバタータップ・ドラッグ操作 ───────────────────────────

  // 左右にドラッグして回転させる処理
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    dragStartX.current   = clientX;
    dragStartRot.current = rotateY;
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - dragStartX.current;
    // 1px動かすと1度回転（好みで調整可能）
    setRotateY(dragStartRot.current + diff);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // タップでリアクションボタンを押したとき
  const triggerReaction = (type: Reaction) => {
    // 前のタイマーをリセット
    if (reactionTimer.current) clearTimeout(reactionTimer.current);

    setReaction(type);

    // リアクション絵文字エフェクト
    const emojiMap: Record<Reaction, string> = {
      wave: '👋', jump: '⭐', spin: '✨', heart: '❤️', none: '',
    };
    setShowEmoji(emojiMap[type]);

    // 2秒後に元に戻す
    reactionTimer.current = setTimeout(() => {
      setReaction('none');
      setShowEmoji('');
    }, 2000);
  };

  // アバター画像をタップしたときもリアクション（ランダム）
  const handleAvatarTap = () => {
    if (isDragging) return; // ドラッグ中はタップ無視
    const types: Reaction[] = ['wave', 'jump', 'spin', 'heart'];
    const random = types[Math.floor(Math.random() * types.length)];
    triggerReaction(random);
  };

  // リアクションに応じたCSSアニメーション名を返す
  const getAvatarAnimation = (): string => {
    switch (reaction) {
      case 'wave':  return 'avatarWave 0.5s ease-in-out 4';
      case 'jump':  return 'avatarJump 0.5s ease-in-out 3';
      case 'spin':  return 'avatarSpin 0.6s ease-in-out 3';
      case 'heart': return 'avatarHeart 0.4s ease-in-out 4';
      default:      return 'floatAv 3s ease-in-out infinite';
    }
  };

  const wearableItems = items.filter(i => WEARABLE_CATEGORIES.includes(i.category as ItemCategory));
  const filteredItems = wearableItems.filter(i => i.category === activeCategory);

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

        {/* ✅ 全身アバター表示エリア（背景透過・サイズ拡大・操作対応） */}
        <div
          style={{ position:'relative', height:380, display:'flex', alignItems:'flex-end', justifyContent:'center', overflow:'hidden', cursor: isDragging ? 'grabbing' : 'grab' }}
          // マウス操作（PC）
          onMouseDown={e => handleDragStart(e.clientX)}
          onMouseMove={e => handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          // タッチ操作（スマホ）
          onTouchStart={e => handleDragStart(e.touches[0].clientX)}
          onTouchMove={e => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
        >
          {/* 背景グラデーション（薄め） */}
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center bottom,rgba(232,184,75,0.08) 0%,transparent 70%)' }}/>

          {/* 地面の円形グロー */}
          <div style={{ position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)', width:200, height:30, background:'radial-gradient(ellipse,rgba(232,184,75,0.15) 0%,transparent 70%)', borderRadius:'50%' }}/>

          {/* ✅ アバター本体（背景透過・回転・リアクション対応） */}
          {(profile?.vroid_full_body_url || profile?.avatar_url) ? (
            <div
              style={{ position:'relative', height:'95%', display:'flex', alignItems:'flex-end', justifyContent:'center' }}
              onClick={handleAvatarTap}
            >
              <img
                src={profile.vroid_full_body_url || profile.avatar_url}
                alt="avatar"
                draggable={false} // ドラッグで画像が動かないようにする
                style={{
                  height:'100%',
                  width:'auto',
                  objectFit:'contain',
                  // ✅ 回転（左右ドラッグ）＋リアクションアニメーション
                  transform:`rotateY(${rotateY}deg)`,
                  transformStyle:'preserve-3d',
                  animation: getAvatarAnimation(),
                  filter:'drop-shadow(0 12px 30px rgba(232,184,75,0.35))',
                  // ✅ 背景透過（mix-blend-modeで白背景を消す）
                  mixBlendMode:'multiply',
                  transition: isDragging ? 'none' : 'transform 0.1s',
                  userSelect:'none',
                  WebkitUserSelect:'none',
                }}
              />

              {/* タップ時のエフェクト絵文字 */}
              {showEmoji && (
                <div style={{ position:'absolute', top:20, left:'50%', transform:'translateX(-50%)', fontSize:40, animation:'emojiPop 2s ease-out forwards', pointerEvents:'none', zIndex:10 }}>
                  {showEmoji}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{ fontSize:120, animation:getAvatarAnimation(), cursor:'pointer' }}
              onClick={handleAvatarTap}
            >
              👤
            </div>
          )}

          {/* レベルバッジ */}
          <div style={{ position:'absolute', top:12, right:12, background:'#e8b84b', color:'#1a0e00', fontSize:11, fontWeight:700, padding:'4px 10px', borderRadius:20, zIndex:5 }}>
            Lv.{profile?.adventure_level ?? 1}
          </div>

          {/* VRoid変更ボタン */}
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

          {/* 操作ヒント */}
          <div style={{ position:'absolute', bottom:8, left:'50%', transform:'translateX(-50%)', fontSize:10, color:'rgba(255,255,255,0.3)', whiteSpace:'nowrap', pointerEvents:'none' }}>
            ← 左右にスワイプで回転 | タップでリアクション →
          </div>
        </div>

        {/* ✅ リアクションボタン一覧 */}
        <div style={{ display:'flex', justifyContent:'center', gap:10, padding:'10px 16px 4px' }}>
          {REACTIONS.map(r => (
            <button
              key={r.type}
              onClick={() => triggerReaction(r.type)}
              style={{
                padding:'6px 14px',
                background: reaction === r.type ? 'rgba(232,184,75,0.25)' : 'rgba(255,255,255,0.06)',
                border:`1px solid ${reaction === r.type ? '#e8b84b' : 'rgba(255,255,255,0.12)'}`,
                borderRadius:20,
                color: reaction === r.type ? '#e8b84b' : 'rgba(255,255,255,0.6)',
                cursor:'pointer',
                fontSize:11,
                display:'flex',
                alignItems:'center',
                gap:4,
                transition:'all 0.2s',
              }}
            >
              <span>{r.emoji}</span>
              <span>{r.label}</span>
            </button>
          ))}
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
            <div style={{ display:'flex', gap:6, overflowX:'auto', marginBottom:16, paddingBottom:4 }}>
              {WEARABLE_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={{ flexShrink:0, padding:'6px 12px', background:activeCategory===cat?'rgba(232,184,75,0.15)':'rgba(255,255,255,0.04)', border:`1px solid ${activeCategory===cat?'#e8b84b':'rgba(255,255,255,0.1)'}`, borderRadius:20, color:activeCategory===cat?'#e8b84b':'#e8d5a3', cursor:'pointer', fontSize:12, whiteSpace:'nowrap' }}>
                  {cat}{equipped[cat] && <span style={{ marginLeft:4, color:'#e8b84b' }}>●</span>}
                </button>
              ))}
            </div>
            {filteredItems.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 20px', opacity:0.4 }}>
                <div style={{ fontSize:40, marginBottom:12 }}>🔒</div>
                <p style={{ fontSize:13 }}>このカテゴリーのアイテムがありません</p>
                <p style={{ fontSize:11, marginTop:4 }}>宝箱を開けてアイテムをゲットしよう！</p>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {filteredItems.map(item => {
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
            {NOTICES.map(n => (
              <div key={n.id} onClick={() => setNoticeOpen(noticeOpen===n.id?null:n.id)} style={{ marginBottom:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, overflow:'hidden', cursor:'pointer' }}>
                <div style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:10 }}>
                  {n.isNew && <div style={{ width:6, height:6, borderRadius:'50%', background:'#e8b84b', flexShrink:0 }}/>}
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:n.isNew?'#e8d5a3':'rgba(232,213,163,0.6)' }}>{n.title}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{n.date}</div>
                  </div>
                  <span style={{ color:'rgba(255,255,255,0.3)', fontSize:12 }}>{noticeOpen===n.id?'▲':'▼'}</span>
                </div>
                {noticeOpen===n.id && (
                  <div style={{ padding:'0 14px 14px', fontSize:13, color:'rgba(232,213,163,0.7)', lineHeight:1.6 }}>{n.body}</div>
                )}
              </div>
            ))}
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
            ]].map((setting, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontSize:14, color:'#e8d5a3' }}>{setting.label}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{setting.desc}</div>
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

      {/* ── アニメーション定義 ── */}
      <style>{`
        @keyframes floatAv {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes avatarWave {
          0%,100% { transform: rotate(0deg) translateY(0); }
          25%      { transform: rotate(-8deg) translateY(-4px); }
          75%      { transform: rotate(8deg)  translateY(-4px); }
        }
        @keyframes avatarJump {
          0%,100% { transform: translateY(0) scaleY(1); }
          40%      { transform: translateY(-30px) scaleY(1.05); }
          90%      { transform: translateY(4px) scaleY(0.95); }
        }
        @keyframes avatarSpin {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes avatarHeart {
          0%,100% { transform: scale(1); }
          30%      { transform: scale(1.1); }
          60%      { transform: scale(0.95); }
        }
        @keyframes emojiPop {
          0%   { opacity:1; transform: translateX(-50%) translateY(0) scale(1); }
          70%  { opacity:1; transform: translateX(-50%) translateY(-40px) scale(1.3); }
          100% { opacity:0; transform: translateX(-50%) translateY(-70px) scale(0.8); }
        }
      `}</style>
    </div>
  );
}
