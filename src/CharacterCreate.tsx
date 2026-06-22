import React, { useState } from 'react';
import { AvatarCreator, AvatarCreatorConfig } from '@readyplayerme/react-avatar-creator';
import { supabase } from './supabase';

const config: AvatarCreatorConfig = {
  clearCache: false,
  bodyType: 'fullbody',
  quickStart: false,
  language: 'en',
};

export default function CharacterCreate({ userId, onComplete }: { userId: string; onComplete: () => void }) {
  const [phase, setPhase] = useState<'name' | 'avatar' | 'saving'>('name');
  const [username, setUsername] = useState('');

  async function handleAvatarExported(event: any) {
    const url = event?.data?.url ?? event?.url ?? '';
    if (!url) return;
    setPhase('saving');
    await supabase.from('profiles').upsert({
      id: userId,
      username,
      avatar_url: url,
      avatar_title: '新米冒険者',
      adventure_level: 1,
    });
    onComplete();
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '14px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(232,184,75,0.3)', borderRadius: 6,
    color: '#e8d5a3', fontSize: 16, outline: 'none',
    fontFamily: 'sans-serif', boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99998,
      background: '#1a1208', display: 'flex', flexDirection: 'column',
      alignItems: 'center', fontFamily: 'Georgia,serif', color: '#e8d5a3',
      backgroundImage: 'repeating-linear-gradient(0deg,rgba(232,184,75,0.03) 0px,rgba(232,184,75,0.03) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(232,184,75,0.03) 0px,rgba(232,184,75,0.03) 1px,transparent 1px,transparent 40px)',
    }}>

      {/* ヘッダー */}
      <div style={{ width: '100%', padding: '16px 20px', borderBottom: '1px solid rgba(232,184,75,0.2)', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 4, color: 'rgba(232,184,75,0.5)' }}>CHARACTER CREATION</div>
          <div style={{ fontSize: 18, color: '#e8b84b', letterSpacing: 2, marginTop: 2 }}>冒険者を作ろう</div>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(232,184,75,0.4)', letterSpacing: 2 }}>
          {phase === 'name' ? 'STEP 1 / 2' : 'STEP 2 / 2'}
        </div>
      </div>

      {/* Step 1: 名前入力 */}
      {phase === 'name' && (
        <div style={{ width: '100%', maxWidth: 480, padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1, justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>⚔️</div>
            <h2 style={{ color: '#e8b84b', fontSize: 22, margin: '0 0 8px', fontFamily: 'Georgia,serif' }}>冒険者の名前を決めよう</h2>
            <p style={{ fontSize: 13, color: 'rgba(232,184,75,0.5)', margin: 0, fontFamily: 'sans-serif' }}>ランキングや他のプレイヤーに表示されます</p>
          </div>
          <input
            style={inp}
            value={username}
            maxLength={16}
            placeholder="ニックネームを入力（最大16文字）"
            onChange={e => setUsername(e.target.value)}
            autoFocus
          />
          <button
            onClick={() => { if (username.trim()) setPhase('avatar'); }}
            disabled={!username.trim()}
            style={{
              padding: '16px', borderRadius: 6, border: 'none',
              cursor: username.trim() ? 'pointer' : 'not-allowed',
              background: username.trim() ? 'linear-gradient(135deg,#c8900a,#e8b84b)' : 'rgba(255,255,255,0.1)',
              color: username.trim() ? '#1a0e00' : 'rgba(255,255,255,0.3)',
              fontSize: 16, fontWeight: 800, fontFamily: 'Georgia,serif', letterSpacing: 2,
              boxShadow: username.trim() ? '0 4px 16px rgba(232,184,75,0.3)' : 'none',
            }}
          >
            次へ → アバターを作る
          </button>
        </div>
      )}

      {/* Step 2: Ready Player Me */}
      {phase === 'avatar' && (
        <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 20px', background: 'rgba(0,0,0,0.4)', fontSize: 12, color: 'rgba(232,184,75,0.6)', textAlign: 'center', letterSpacing: 1, fontFamily: 'sans-serif' }}>
            アバターを作成して「保存」ボタンを押してください
          </div>
          <AvatarCreator
            subdomain="demo"
            config={config}
            style={{ flex: 1, width: '100%', border: 'none' }}
            onAvatarExported={handleAvatarExported}
          />
        </div>
      )}

      {/* 保存中 */}
      {phase === 'saving' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <div style={{ fontSize: 64 }}>⚔️</div>
          <p style={{ color: '#e8b84b', fontSize: 18, letterSpacing: 2 }}>冒険者を登録中...</p>
        </div>
      )}
    </div>
  );
}