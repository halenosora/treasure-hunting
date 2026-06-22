import React, { useState } from 'react';
import { supabase } from './supabase';

interface CharacterOptions {
  username: string;
  face_type: number;
  hair_type: number;
  hair_color: string;
  skin_color: string;
  body_type: number;
  beard_type: number;
}

const FACE_TYPES = [
  { id: 1, label: '丸顔',   svg: 'M12,6 Q18,6 18,12 Q18,20 12,20 Q6,20 6,12 Q6,6 12,6 Z' },
  { id: 2, label: '面長',   svg: 'M12,4 Q17,4 17,12 Q17,22 12,22 Q7,22 7,12 Q7,4 12,4 Z' },
  { id: 3, label: '四角顔', svg: 'M7,6 Q17,6 17,6 L17,20 Q17,22 12,22 Q7,22 7,20 Z' },
  { id: 4, label: 'シャープ', svg: 'M12,4 Q18,6 17,14 Q15,22 12,22 Q9,22 7,14 Q6,6 12,4 Z' },
];

const HAIR_TYPES = [
  { id: 1, label: 'ショート', svg: 'M6,10 Q6,4 12,4 Q18,4 18,10 L17,12 Q12,8 7,12 Z' },
  { id: 2, label: 'ロング',  svg: 'M6,10 Q6,4 12,4 Q18,4 18,10 L18,20 Q15,18 12,20 Q9,18 6,20 Z' },
  { id: 3, label: 'ウェーブ', svg: 'M6,10 Q6,4 12,4 Q18,4 18,10 L18,18 Q15,16 13,18 Q11,20 9,18 Q7,16 6,18 Z' },
  { id: 4, label: 'ポニテ',  svg: 'M6,10 Q6,4 12,4 Q18,4 18,10 L17,12 Q12,8 7,12 Z M16,10 Q20,8 22,12 Q20,14 18,12' },
  { id: 5, label: 'ボブ',   svg: 'M6,10 Q6,4 12,4 Q18,4 18,10 L18,16 Q12,18 6,16 Z' },
  { id: 6, label: 'オールバック', svg: 'M6,8 Q6,4 12,4 Q18,4 18,8 Q14,6 10,8 Z' },
];

const HAIR_COLORS = [
  { color: '#1a0a00', label: '黒' },
  { color: '#3d2b1f', label: '焦茶' },
  { color: '#8b5e3c', label: '茶' },
  { color: '#c8a96e', label: '金茶' },
  { color: '#f0d080', label: '金' },
  { color: '#d4607a', label: 'ピンク' },
  { color: '#5b8dd9', label: '青' },
  { color: '#7b68ee', label: '紫' },
  { color: '#e8e8e8', label: '白' },
  { color: '#ff6b35', label: 'オレンジ' },
];

const SKIN_COLORS = [
  { color: '#fde8d0', label: '白肌' },
  { color: '#f5c5a3', label: '普通' },
  { color: '#e8a882', label: '小麦' },
  { color: '#c68642', label: '褐色' },
  { color: '#8d5524', label: '濃褐色' },
];

const BODY_TYPES = [
  { id: 1, label: 'スリム' },
  { id: 2, label: '普通' },
  { id: 3, label: 'がっちり' },
];

const BEARD_TYPES = [
  { id: 0, label: 'なし' },
  { id: 1, label: '無精ひげ' },
  { id: 2, label: '口ひげ' },
  { id: 3, label:'あごひげ' },
];

// 3Dイラスト風アバタープレビュー
function AvatarPreview({ opts }: { opts: CharacterOptions }) {
  const face = FACE_TYPES.find(f => f.id === opts.face_type)!;
  const hair = HAIR_TYPES.find(h => h.id === opts.hair_type)!;

  return (
    <svg viewBox="0 0 80 100" width="160" height="200" style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))' }}>
      {/* 体 */}
      <ellipse cx="40" cy="85" rx={opts.body_type === 1 ? 14 : opts.body_type === 2 ? 17 : 20} ry="12"
        fill={opts.skin_color} stroke="rgba(0,0,0,0.2)" strokeWidth="0.5"/>
      <rect x={opts.body_type === 1 ? 26 : opts.body_type === 2 ? 23 : 20} y="72"
        width={opts.body_type === 1 ? 28 : opts.body_type === 2 ? 34 : 40} height="18" rx="4"
        fill={opts.skin_color} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5"/>

      {/* 首 */}
      <rect x="36" y="58" width="8" height="10" rx="3" fill={opts.skin_color} stroke="rgba(0,0,0,0.1)" strokeWidth="0.5"/>

      {/* 顔 */}
      <path d={face.svg} fill={opts.skin_color} stroke="rgba(0,0,0,0.2)" strokeWidth="0.8"
        style={{ filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.2))' }}/>

      {/* 髪（後ろ） */}
      <path d={hair.svg} fill={opts.hair_color} stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" opacity="0.9"/>

      {/* 耳 */}
      <ellipse cx="6.5" cy="13" rx="2" ry="2.5" fill={opts.skin_color} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5"/>
      <ellipse cx="17.5" cy="13" rx="2" ry="2.5" fill={opts.skin_color} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5"/>

      {/* 目 */}
      <ellipse cx="9.5" cy="12" rx="1.8" ry="2" fill="#2a1a0a"/>
      <ellipse cx="14.5" cy="12" rx="1.8" ry="2" fill="#2a1a0a"/>
      <ellipse cx="9.8" cy="11.5" rx="0.6" ry="0.6" fill="white"/>
      <ellipse cx="14.8" cy="11.5" rx="0.6" ry="0.6" fill="white"/>
      {/* まつ毛 */}
      <path d="M7.5,10.5 Q9.5,9.5 11.5,10.5" fill="none" stroke="#1a0a00" strokeWidth="0.6"/>
      <path d="M12.5,10.5 Q14.5,9.5 16.5,10.5" fill="none" stroke="#1a0a00" strokeWidth="0.6"/>

      {/* 鼻 */}
      <path d="M11.5,14 Q12,16 12.5,14" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6"/>

      {/* 口 */}
      <path d="M10,17 Q12,19 14,17" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" strokeLinecap="round"/>

      {/* ひげ */}
      {opts.beard_type === 1 && (
        <g opacity="0.6">
          {[9,10,11,12,13,14,15].map(x => (
            <line key={x} x1={x} y1="17" x2={x} y2="18.5" stroke={opts.hair_color} strokeWidth="0.4"/>
          ))}
        </g>
      )}
      {opts.beard_type === 2 && (
        <path d="M10,17.5 Q12,20 14,17.5" fill={opts.hair_color} stroke={opts.hair_color} strokeWidth="0.3" opacity="0.8"/>
      )}
      {opts.beard_type === 3 && (
        <path d="M9,17 Q12,22 15,17 Q14,24 12,25 Q10,24 9,17 Z" fill={opts.hair_color} opacity="0.7"/>
      )}

      {/* 頬紅 */}
      <ellipse cx="8" cy="14.5" rx="2.5" ry="1.5" fill="#ffb3b3" opacity="0.3"/>
      <ellipse cx="16" cy="14.5" rx="2.5" ry="1.5" fill="#ffb3b3" opacity="0.3"/>

      {/* 髪（前） */}
      <path d={hair.svg} fill={opts.hair_color} stroke="rgba(0,0,0,0.2)" strokeWidth="0.3"
        style={{ clipPath: 'inset(0 0 60% 0)' }} opacity="0.95"/>

      {/* ハイライト */}
      <ellipse cx="9" cy="8" rx="2" ry="1.5" fill="white" opacity="0.25" transform="rotate(-20,9,8)"/>
    </svg>
  );
}

export default function CharacterCreate({ userId, onComplete }: { userId: string; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [opts, setOpts] = useState<CharacterOptions>({
    username: '',
    face_type: 1,
    hair_type: 1,
    hair_color: '#3d2b1f',
    skin_color: '#f5c5a3',
    body_type: 2,
    beard_type: 0,
  });

  const steps = ['名前', '顔型', '髪型', '髪色', '肌色', '体型', 'ひげ', '完了'];

  async function handleSave() {
    if (!opts.username.trim()) return;
    setSaving(true);
    await supabase.from('profiles').upsert({
      id: userId,
      username: opts.username,
      face_type: opts.face_type,
      hair_type: opts.hair_type,
      hair_color: opts.hair_color,
      skin_color: opts.skin_color,
      body_type: opts.body_type,
      beard_type: opts.beard_type,
      avatar_title: '新米冒険者',
      adventure_level: 1,
    });
    setSaving(false);
    onComplete();
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12,
    color: '#e8d5a3', fontSize: 16, boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'linear-gradient(180deg,#0a0e1a 0%,#1a0a2e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      zIndex: 99998, fontFamily: 'sans-serif', color: '#e8d5a3', overflowY: 'auto',
    }}>
      {/* ヘッダー */}
      <div style={{ width: '100%', maxWidth: 480, padding: '24px 20px 0' }}>
        <h1 style={{ textAlign: 'center', color: '#e8b84b', fontFamily: 'Georgia,serif', fontSize: 24, margin: '0 0 8px' }}>
          冒険者を作ろう
        </h1>
        <p style={{ textAlign: 'center', fontSize: 12, opacity: 0.5, margin: '0 0 20px' }}>
          {step + 1} / {steps.length} — {steps[step]}
        </p>
        {/* プログレスバー */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 24 }}>
          <div style={{ height: '100%', width: `${((step + 1) / steps.length) * 100}%`, background: '#e8b84b', borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* アバタープレビュー */}
      <div style={{ margin: '0 0 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ animation: 'avatarFloat 3s ease-in-out infinite' }}>
          <AvatarPreview opts={opts} />
        </div>
      </div>

      {/* ステップコンテンツ */}
      <div style={{ width: '100%', maxWidth: 480, padding: '0 20px 40px' }}>

        {/* Step 0: 名前 */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 14, opacity: 0.7 }}>冒険者の名前</label>
            <input
              style={inp} value={opts.username} maxLength={16}
              placeholder="ニックネームを入力（最大16文字）"
              onChange={e => setOpts({ ...opts, username: e.target.value })}
              autoFocus
            />
            <p style={{ fontSize: 11, opacity: 0.4 }}>この名前はランキングや他のプレイヤーに表示されます</p>
          </div>
        )}

        {/* Step 1: 顔型 */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {FACE_TYPES.map(f => (
              <button key={f.id} onClick={() => setOpts({ ...opts, face_type: f.id })} style={{
                padding: '16px 8px', background: opts.face_type === f.id ? 'rgba(232,184,75,0.2)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${opts.face_type === f.id ? '#e8b84b' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12, color: '#e8d5a3', cursor: 'pointer', fontSize: 13,
              }}>
                <svg viewBox="0 0 24 24" width="48" height="48" style={{ display: 'block', margin: '0 auto 8px' }}>
                  <path d={f.svg} fill={opts.skin_color} stroke="#e8b84b" strokeWidth="1"/>
                </svg>
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Step 2: 髪型 */}
        {step === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {HAIR_TYPES.map(h => (
              <button key={h.id} onClick={() => setOpts({ ...opts, hair_type: h.id })} style={{
                padding: '12px 6px', background: opts.hair_type === h.id ? 'rgba(232,184,75,0.2)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${opts.hair_type === h.id ? '#e8b84b' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12, color: '#e8d5a3', cursor: 'pointer', fontSize: 11,
              }}>
                <svg viewBox="0 0 24 24" width="40" height="40" style={{ display: 'block', margin: '0 auto 6px' }}>
                  <path d={h.svg} fill={opts.hair_color} stroke="#e8b84b" strokeWidth="0.8"/>
                </svg>
                {h.label}
              </button>
            ))}
          </div>
        )}

        {/* Step 3: 髪色 */}
        {step === 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {HAIR_COLORS.map(c => (
              <button key={c.color} onClick={() => setOpts({ ...opts, hair_color: c.color })} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '12px 4px', background: 'transparent', border: 'none', cursor: 'pointer',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: c.color,
                  border: `3px solid ${opts.hair_color === c.color ? '#e8b84b' : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: opts.hair_color === c.color ? `0 0 12px ${c.color}` : 'none',
                  transition: 'all 0.2s',
                }} />
                <span style={{ fontSize: 10, color: '#e8d5a3', opacity: 0.7 }}>{c.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 4: 肌色 */}
        {step === 4 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            {SKIN_COLORS.map(c => (
              <button key={c.color} onClick={() => setOpts({ ...opts, skin_color: c.color })} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                padding: '12px 8px', background: 'transparent', border: 'none', cursor: 'pointer',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', background: c.color,
                  border: `3px solid ${opts.skin_color === c.color ? '#e8b84b' : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: opts.skin_color === c.color ? '0 0 16px rgba(232,184,75,0.6)' : 'none',
                  transition: 'all 0.2s',
                }} />
                <span style={{ fontSize: 11, color: '#e8d5a3', opacity: 0.7 }}>{c.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 5: 体型 */}
        {step === 5 && (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            {BODY_TYPES.map(b => (
              <button key={b.id} onClick={() => setOpts({ ...opts, body_type: b.id })} style={{
                flex: 1, padding: '20px 8px',
                background: opts.body_type === b.id ? 'rgba(232,184,75,0.2)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${opts.body_type === b.id ? '#e8b84b' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12, color: '#e8d5a3', cursor: 'pointer', fontSize: 14,
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>
                  {b.id === 1 ? '🧍' : b.id === 2 ? '🧍' : '💪'}
                </div>
                {b.label}
              </button>
            ))}
          </div>
        )}

        {/* Step 6: ひげ */}
        {step === 6 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {BEARD_TYPES.map(b => (
              <button key={b.id} onClick={() => setOpts({ ...opts, beard_type: b.id })} style={{
                padding: '16px 8px',
                background: opts.beard_type === b.id ? 'rgba(232,184,75,0.2)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${opts.beard_type === b.id ? '#e8b84b' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12, color: '#e8d5a3', cursor: 'pointer', fontSize: 14,
              }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>
                  {b.id === 0 ? '😊' : b.id === 1 ? '🧔' : b.id === 2 ? '👨' : '🧔‍♂️'}
                </div>
                {b.label}
              </button>
            ))}
          </div>
        )}

        {/* Step 7: 完了 */}
        {step === 7 && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 18, color: '#e8b84b', fontFamily: 'Georgia,serif', marginBottom: 8 }}>
              準備完了！
            </p>
            <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 24 }}>
              「{opts.username}」として冒険を始めましょう！
            </p>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, textAlign: 'left', marginBottom: 20 }}>
              {[
                { label: '名前', value: opts.username },
                { label: '顔型', value: FACE_TYPES.find(f => f.id === opts.face_type)?.label },
                { label: '髪型', value: HAIR_TYPES.find(h => h.id === opts.hair_type)?.label },
                { label: '体型', value: BODY_TYPES.find(b => b.id === opts.body_type)?.label },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13 }}>
                  <span style={{ opacity: 0.5 }}>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ナビゲーションボタン */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} style={{
              flex: 1, padding: '14px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12,
              color: '#e8d5a3', cursor: 'pointer', fontSize: 15,
            }}>← 戻る</button>
          )}
          {step < 7 ? (
            <button
              onClick={() => { if (step === 0 && !opts.username.trim()) return; setStep(step + 1); }}
              disabled={step === 0 && !opts.username.trim()}
              style={{
                flex: 2, padding: '14px',
                background: step === 0 && !opts.username.trim() ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#e8b84b,#c8900a)',
                border: 'none', borderRadius: 12,
                color: step === 0 && !opts.username.trim() ? 'rgba(255,255,255,0.3)' : '#1a0e00',
                cursor: step === 0 && !opts.username.trim() ? 'not-allowed' : 'pointer',
                fontSize: 15, fontWeight: 700,
              }}
            >次へ →</button>
          ) : (
            <button onClick={handleSave} disabled={saving} style={{
              flex: 2, padding: '14px',
              background: 'linear-gradient(135deg,#e8b84b,#c8900a)',
              border: 'none', borderRadius: 12,
              color: '#1a0e00', cursor: 'pointer', fontSize: 15, fontWeight: 800,
              boxShadow: '0 4px 16px rgba(232,184,75,0.4)',
            }}>
              {saving ? '作成中...' : '⚔️ 冒険を始める！'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes avatarFloat {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}