import React, { useState } from 'react';
import { supabase } from './supabase';

const STYLES = [
  { id: 'adventurer', label: '冒険者' },
  { id: 'avataaars', label: 'カジュアル' },
  { id: 'big-ears', label: 'ビッグイヤー' },
  { id: 'croodles', label: 'スケッチ' },
  { id: 'fun-emoji', label: '絵文字' },
  { id: 'lorelei', label: 'ロレライ' },
  { id: 'micah', label: 'ミカ' },
  { id: 'miniavs', label: 'ミニ' },
  { id: 'notionists', label: 'ノーション' },
  { id: 'open-peeps', label: 'オープン' },
  { id: 'personas', label: 'ペルソナ' },
  { id: 'pixel-art', label: 'ピクセル' },
];

const SKIN_COLORS = [
  { hex: 'f5d0b5', label: '白肌' },
  { hex: 'e8b88a', label: '普通' },
  { hex: 'c68642', label: '小麦' },
  { hex: '8d5524', label: '褐色' },
];

const HAIR_COLORS = [
  { hex: '1a0a00', label: '黒' },
  { hex: '8b5e3c', label: '茶' },
  { hex: 'f0d080', label: '金' },
  { hex: 'd4607a', label: 'ピンク' },
  { hex: '5b8dd9', label: '青' },
  { hex: 'e8e8e8', label: '白' },
];

function getAvatarUrl(seed: string, style: string, skinColor: string, hairColor: string) {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=transparent&skin=${skinColor}&skinColor=${skinColor}&hairColor=${hairColor}&hair=${hairColor}&size=200`;
  }

export default function CharacterCreate({ userId, onComplete }: { userId: string; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [style, setStyle] = useState('adventurer');
  const [skinColor, setSkinColor] = useState('f5d0b5');
  const [hairColor, setHairColor] = useState('8b5e3c');
  const [seed, setSeed] = useState(() => Math.random().toString(36).slice(2, 8));
  const [saving, setSaving] = useState(false);

  const avatarUrl = getAvatarUrl(seed, style, skinColor, hairColor);
  const saveUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=transparent&skinColor=${skinColor}&hairColor=${hairColor}`;

  async function handleSave() {
    setSaving(true);
    await supabase.from('profiles').upsert({
      id: userId,
      username,
      avatar_url: saveUrl,
      avatar_title: '新米冒険者',
      adventure_level: 1,
    });
    setSaving(false);
    onComplete();
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '14px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(232,184,75,0.3)', borderRadius: 6,
    color: '#e8d5a3', fontSize: 16, outline: 'none',
    fontFamily: 'sans-serif', boxSizing: 'border-box',
  };

  const STEPS = ['名前', 'スタイル', 'カラー', '確認'];

  return (
    <div style={{
        position: 'fixed', inset: 0, zIndex: 99998, overflowY: 'scroll',
      background: '#1a1208', display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: 'Georgia,serif', color: '#e8d5a3',
      backgroundImage: 'repeating-linear-gradient(0deg,rgba(232,184,75,0.03) 0px,rgba(232,184,75,0.03) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(232,184,75,0.03) 0px,rgba(232,184,75,0.03) 1px,transparent 1px,transparent 40px)',
    }}>
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingBottom: 100 }}>

        {/* ヘッダー */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(232,184,75,0.2)', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 4, color: 'rgba(232,184,75,0.5)' }}>CHARACTER CREATION</div>
            <div style={{ fontSize: 18, color: '#e8b84b', letterSpacing: 2, marginTop: 2 }}>冒険者を作ろう</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'rgba(232,184,75,0.4)', letterSpacing: 2 }}>STEP</div>
            <div style={{ fontSize: 22, color: '#e8b84b' }}>{step + 1} / {STEPS.length}</div>
          </div>
        </div>

        {/* プログレス */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0, transition: 'all 0.3s',
                background: i <= step ? '#e8b84b' : 'rgba(232,184,75,0.2)',
                border: `1px solid ${i <= step ? '#e8b84b' : 'rgba(232,184,75,0.3)'}`,
                boxShadow: i === step ? '0 0 8px #e8b84b' : 'none',
              }}/>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: 'rgba(232,184,75,0.15)' }}/>}
            </React.Fragment>
          ))}
          <span style={{ fontSize: 11, color: 'rgba(232,184,75,0.5)', letterSpacing: 2, marginLeft: 8, whiteSpace: 'nowrap', fontFamily: 'sans-serif' }}>{STEPS[step]}</span>
        </div>

        {/* アバタープレビュー */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0 16px', flexShrink: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,184,75,0.1) 0%,transparent 70%)' }}/>
          <div style={{ width: 160, height: 160, borderRadius: '50%', border: '2px solid rgba(232,184,75,0.4)', overflow: 'hidden', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'floatP 3s ease-in-out infinite', position: 'relative' }}>
            <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`; }}/>
          </div>
          {step >= 1 && (
            <button onClick={() => setSeed(Math.random().toString(36).slice(2, 8))} style={{ marginTop: 12, padding: '6px 16px', background: 'rgba(232,184,75,0.1)', border: '1px solid rgba(232,184,75,0.3)', borderRadius: 20, color: '#e8b84b', cursor: 'pointer', fontSize: 12, fontFamily: 'sans-serif', letterSpacing: 1 }}>
              🎲 ランダム
            </button>
          )}
        </div>

        {/* パネル */}
        <div style={{ background: 'rgba(0,0,0,0.5)', borderTop: '1px solid rgba(232,184,75,0.2)', padding: '16px 20px' }}>

          {/* Step 0: 名前 */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(232,184,75,0.5)', marginBottom: 4, fontFamily: 'sans-serif' }}>冒険者の名前 ──────────</div>
              <input style={inp} value={username} maxLength={16}
                placeholder="ニックネームを入力（最大16文字）"
                onChange={e => setUsername(e.target.value)} autoFocus/>
              <p style={{ fontSize: 11, color: 'rgba(232,184,75,0.4)', fontFamily: 'sans-serif' }}>この名前はランキングや他のプレイヤーに表示されます</p>
            </div>
          )}

          {/* Step 1: スタイル */}
          {step === 1 && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(232,184,75,0.5)', marginBottom: 12, fontFamily: 'sans-serif' }}>アバタースタイル ────────</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {STYLES.map(s => (
                  <button key={s.id} onClick={() => setStyle(s.id)} style={{
                    padding: '8px 4px', textAlign: 'center',
                    background: style === s.id ? 'rgba(232,184,75,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${style === s.id ? '#e8b84b' : 'rgba(232,184,75,0.15)'}`,
                    borderRadius: 6, color: style === s.id ? '#e8b84b' : '#e8d5a3',
                    cursor: 'pointer', fontSize: 11, fontFamily: 'sans-serif', transition: 'all 0.2s',
                  }}>
                    <img src={`https://api.dicebear.com/7.x/${s.id}/svg?seed=${seed}&size=60`} alt={s.label} style={{ width: 48, height: 48, display: 'block', margin: '0 auto 4px' }}/>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: カラー */}
          {step === 2 && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(232,184,75,0.5)', marginBottom: 12, fontFamily: 'sans-serif' }}>肌の色 ────────────────</div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                {SKIN_COLORS.map(c => (
                  <div key={c.hex} onClick={() => setSkinColor(c.hex)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: `#${c.hex}`, border: `3px solid ${skinColor === c.hex ? '#e8b84b' : 'rgba(255,255,255,0.1)'}`, boxShadow: skinColor === c.hex ? '0 0 12px rgba(232,184,75,0.5)' : 'none', transition: 'all 0.2s', transform: skinColor === c.hex ? 'scale(1.12)' : 'scale(1)' }}/>
                    <span style={{ fontSize: 10, color: 'rgba(232,184,75,0.6)', fontFamily: 'sans-serif' }}>{c.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(232,184,75,0.5)', marginBottom: 12, fontFamily: 'sans-serif' }}>髪の色 ────────────────</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {HAIR_COLORS.map(c => (
                  <div key={c.hex} onClick={() => setHairColor(c.hex)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: `#${c.hex}`, border: `3px solid ${hairColor === c.hex ? '#e8b84b' : 'rgba(255,255,255,0.1)'}`, boxShadow: hairColor === c.hex ? '0 0 12px rgba(232,184,75,0.5)' : 'none', transition: 'all 0.2s', transform: hairColor === c.hex ? 'scale(1.12)' : 'scale(1)' }}/>
                    <span style={{ fontSize: 10, color: 'rgba(232,184,75,0.6)', fontFamily: 'sans-serif' }}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: 確認 */}
          {step === 3 && (
            <div>
              <div style={{ fontSize: 10, letterSpacing: 3, color: 'rgba(232,184,75,0.5)', marginBottom: 12, fontFamily: 'sans-serif' }}>確認 ──────────────────</div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                {[
                  ['冒険者名', username],
                  ['スタイル', STYLES.find(s => s.id === style)?.label ?? style],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13, fontFamily: 'sans-serif' }}>
                    <span style={{ color: 'rgba(232,184,75,0.5)' }}>{l}</span>
                    <span style={{ color: '#e8d5a3' }}>{v}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'rgba(232,184,75,0.5)', textAlign: 'center', fontFamily: 'sans-serif' }}>
                「{username}」として冒険を始めましょう！
              </p>
            </div>
          )}
        </div>

        {/* ボタン */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 20px', background: 'rgba(0,0,0,0.6)', borderTop: '1px solid rgba(232,184,75,0.15)', flexShrink: 0 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: '13px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(232,184,75,0.2)', borderRadius: 6, color: 'rgba(232,184,75,0.7)', cursor: 'pointer', fontSize: 13, fontFamily: 'Georgia,serif', letterSpacing: 1 }}>
              ← 戻る
            </button>
          )}
          {step < 3 ? (
            <button onClick={() => { if (step === 0 && !username.trim()) return; setStep(s => s + 1); }}
              disabled={step === 0 && !username.trim()}
              style={{ flex: 2, padding: '13px', background: (step === 0 && !username.trim()) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#c8900a,#e8b84b)', border: 'none', borderRadius: 6, color: (step === 0 && !username.trim()) ? 'rgba(255,255,255,0.3)' : '#1a0e00', cursor: (step === 0 && !username.trim()) ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Georgia,serif', letterSpacing: 2 }}>
              次へ →
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg,#c8900a,#e8b84b)', border: 'none', borderRadius: 6, color: '#1a0e00', cursor: 'pointer', fontSize: 14, fontWeight: 800, fontFamily: 'Georgia,serif', letterSpacing: 2, boxShadow: '0 4px 16px rgba(232,184,75,0.4)' }}>
              {saving ? '作成中...' : '⚔️ 冒険を始める！'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes floatP { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
    </div>
  );
}