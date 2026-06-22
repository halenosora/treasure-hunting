import React, { useState, useCallback } from 'react';
import { supabase } from './supabase';

interface CharOpts {
  username: string;
  face_type: number;
  hair_type: number;
  hair_color: string;
  skin_color: string;
  body_type: number;
  beard_type: number;
}

const HAIR_COLORS = [
  '#1a0a00','#3d2b1f','#8b5e3c','#c8a96e','#f0d080',
  '#d4607a','#5b8dd9','#7b68ee','#e8e8e8','#ff6b35',
];
const HAIR_COLOR_LABELS = ['黒','焦茶','茶','金茶','金','ピンク','青','紫','白','橙'];
const SKIN_COLORS = ['#fde8d0','#f5c5a3','#e8a882','#c68642','#8d5524'];
const SKIN_LABELS  = ['白肌','普通','小麦','褐色','濃褐'];

const STEPS = ['名前','顔型','髪型','髪色','肌色','体型','ひげ','確認'];

// ── SVGキャラクター ────────────────────────────────────────
function CharSVG({ opts }: { opts: CharOpts }) {
  const sk = opts.skin_color;
  const hc = opts.hair_color;
  const bw = opts.body_type === 1 ? 52 : opts.body_type === 2 ? 60 : 70;
  const bx = 60 - bw / 2;

  // 顔の輪郭
  const faces = [
    'M35,70 Q35,42 60,40 Q85,42 85,70 Q85,102 60,106 Q35,102 35,70 Z',
    'M38,75 Q38,42 60,38 Q82,42 82,75 Q82,108 60,112 Q38,108 38,75 Z',
    'M34,68 Q36,42 60,40 Q84,42 86,68 L84,102 Q60,108 36,102 Z',
    'M38,72 Q40,44 60,40 Q80,44 82,72 Q80,104 60,106 Q40,104 38,72 Z',
  ];
  const facePath = faces[opts.face_type - 1] ?? faces[0];

  // 髪型
  const hairs = [
    'M33,70 Q33,36 60,34 Q87,36 87,70 Q80,52 60,50 Q40,52 33,70 Z',
    'M32,72 Q32,34 60,32 Q88,34 88,72 L88,120 Q74,112 60,116 Q46,112 32,120 Z',
    'M32,72 Q32,34 60,32 Q88,34 88,72 L88,110 Q80,100 72,108 Q66,116 60,108 Q54,100 48,108 Q40,116 32,110 Z',
    'M33,70 Q33,36 60,34 Q87,36 87,70 Q80,52 60,50 Q40,52 33,70 Z M82,50 Q96,44 100,58 Q96,66 88,60 Z',
    'M33,70 Q33,36 60,34 Q87,36 87,70 L87,95 Q60,100 33,95 Z',
    'M34,65 Q36,36 60,34 Q84,36 86,65 Q70,44 50,46 Z',
  ];
  const hairPath = hairs[opts.hair_type - 1] ?? hairs[0];

  return (
    <svg viewBox="0 0 120 290" width="130" height="290" style={{ filter:'drop-shadow(0 8px 20px rgba(0,0,0,0.6))' }}>
      {/* 影 */}
      <ellipse cx="60" cy="282" rx="30" ry="6" fill="rgba(0,0,0,0.45)"/>
      {/* 足 */}
      <rect x="38" y="205" width="16" height="65" rx="7" fill="#2a1f3d"/>
      <rect x="66" y="205" width="16" height="65" rx="7" fill="#2a1f3d"/>
      {/* 靴 */}
      <ellipse cx="46" cy="268" rx="12" ry="6" fill="#110d1a"/>
      <ellipse cx="74" cy="268" rx="12" ry="6" fill="#110d1a"/>
      {/* 胴体 */}
      <path d={`M${bx},132 Q${bx-6},165 ${bx-2},208 L${bx+bw+2},208 Q${bx+bw+6},165 ${bx+bw},132 Q${60+bw*0.25},120 60,118 Q${60-bw*0.25},120 ${bx},132 Z`}
        fill="#3d2b6b"/>
      {/* 腕 */}
      <path d={`M${bx+2},138 Q${bx-18},158 ${bx-14},184 Q${bx-10},190 ${bx-6},186 Q${bx-4},162 ${bx+10},146 Z`} fill="#3d2b6b"/>
      <path d={`M${bx+bw-2},138 Q${bx+bw+18},158 ${bx+bw+14},184 Q${bx+bw+10},190 ${bx+bw+6},186 Q${bx+bw+4},162 ${bx+bw-10},146 Z`} fill="#3d2b6b"/>
      {/* 手 */}
      <ellipse cx={bx-12} cy="188" rx="7" ry="8" fill={sk}/>
      <ellipse cx={bx+bw+12} cy="188" rx="7" ry="8" fill={sk}/>
      {/* 首 */}
      <rect x="53" y="108" width="14" height="18" rx="6" fill={sk}/>
      {/* 顔 */}
      <path d={facePath} fill={sk}/>
      {/* 耳 */}
      <ellipse cx="34" cy="74" rx="5" ry="7" fill={sk}/>
      <ellipse cx="86" cy="74" rx="5" ry="7" fill={sk}/>
      {/* 眉 */}
      <path d="M43,61 Q50,57 57,61" fill="none" stroke={hc} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M63,61 Q70,57 77,61" fill="none" stroke={hc} strokeWidth="1.8" strokeLinecap="round"/>
      {/* 目白目 */}
      <ellipse cx="50" cy="70" rx="7" ry="8" fill="white"/>
      <ellipse cx="70" cy="70" rx="7" ry="8" fill="white"/>
      {/* 瞳 */}
      <ellipse cx="51" cy="71" rx="5" ry="6" fill="#1a0a00"/>
      <ellipse cx="71" cy="71" rx="5" ry="6" fill="#1a0a00"/>
      <ellipse cx="52" cy="69" rx="2" ry="2" fill="white"/>
      <ellipse cx="72" cy="69" rx="2" ry="2" fill="white"/>
      {/* まつ毛 */}
      <path d="M43,63 Q50,59 57,63" fill="none" stroke="#0a0500" strokeWidth="1.5"/>
      <path d="M63,63 Q70,59 77,63" fill="none" stroke="#0a0500" strokeWidth="1.5"/>
      {/* 鼻 */}
      <path d="M57,80 Q60,85 63,80" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1.2"/>
      {/* 口 */}
      <path d="M50,92 Q60,100 70,92" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="1.8" strokeLinecap="round"/>
      {/* 頬紅 */}
      <ellipse cx="41" cy="82" rx="9" ry="5" fill="#ff8888" opacity="0.2"/>
      <ellipse cx="79" cy="82" rx="9" ry="5" fill="#ff8888" opacity="0.2"/>
      {/* ひげ */}
      {opts.beard_type === 1 && (
        <g opacity="0.55">{[46,49,52,55,58,61,64,67,70,73].map(x=>(
          <line key={x} x1={x} y1="92" x2={x} y2="96" stroke={hc} strokeWidth="0.7"/>
        ))}</g>
      )}
      {opts.beard_type === 2 && (
        <path d="M50,93 Q60,100 70,93 Q67,104 60,105 Q53,104 50,93 Z" fill={hc} opacity="0.75"/>
      )}
      {opts.beard_type === 3 && (
        <path d="M48,93 Q60,102 72,93 Q70,112 60,115 Q50,112 48,93 Z" fill={hc} opacity="0.7"/>
      )}
      {/* 髪（後） */}
      <path d={hairPath} fill={hc} opacity="0.95"/>
      {/* 服の紋様 */}
      <path d="M55,140 L60,172 L65,140" fill="none" stroke="rgba(232,184,75,0.35)" strokeWidth="1.2"/>
      <path d="M46,148 L74,148" fill="none" stroke="rgba(232,184,75,0.25)" strokeWidth="0.8"/>
      {/* ベルト */}
      <rect x={bx} y="200" width={bw} height="9" rx="3" fill="#1a0e00"/>
      <rect x="55" y="199" width="10" height="11" rx="2" fill="#e8b84b"/>
      {/* ハイライト */}
      <ellipse cx="44" cy="56" rx="6" ry="4" fill="white" opacity="0.15" transform="rotate(-15,44,56)"/>
    </svg>
  );
}

// ── メイン ─────────────────────────────────────────────────
export default function CharacterCreate({ userId, onComplete }: { userId: string; onComplete: () => void }) {
  const [step, setSt]   = useState(0);
  const [saving, setSaving] = useState(false);
  const [opts, setOpts] = useState<CharOpts>({
    username:'', face_type:1, hair_type:1,
    hair_color:'#3d2b1f', skin_color:'#f5c5a3',
    body_type:2, beard_type:0,
  });

  const set = useCallback((k: keyof CharOpts, v: any) => setOpts(o => ({...o, [k]:v})), []);

  const canNext = step !== 0 || opts.username.trim().length > 0;

  async function handleSave() {
    setSaving(true);
    await supabase.from('profiles').upsert({
      id: userId, username: opts.username,
      face_type: opts.face_type, hair_type: opts.hair_type,
      hair_color: opts.hair_color, skin_color: opts.skin_color,
      body_type: opts.body_type, beard_type: opts.beard_type,
      avatar_title:'新米冒険者', adventure_level:1,
    });
    setSaving(false);
    onComplete();
  }

  const inp: React.CSSProperties = {
    width:'100%', padding:'14px 16px',
    background:'rgba(255,255,255,0.06)',
    border:'1px solid rgba(232,184,75,0.3)', borderRadius:6,
    color:'#e8d5a3', fontSize:16, outline:'none',
    fontFamily:'sans-serif', boxSizing:'border-box',
  };

  const optBtn = (sel: boolean): React.CSSProperties => ({
    padding:'12px 6px', textAlign:'center',
    background: sel ? 'rgba(232,184,75,0.15)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${sel ? '#e8b84b' : 'rgba(232,184,75,0.15)'}`,
    borderRadius:6, color: sel ? '#e8b84b' : '#e8d5a3',
    cursor:'pointer', fontSize:12, fontFamily:'sans-serif',
    transition:'all 0.2s',
  });

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:99998, overflowY:'auto',
      background:'#1a1208',
      backgroundImage:'repeating-linear-gradient(0deg,rgba(232,184,75,0.03) 0px,rgba(232,184,75,0.03) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(232,184,75,0.03) 0px,rgba(232,184,75,0.03) 1px,transparent 1px,transparent 40px)',
      display:'flex', flexDirection:'column', alignItems:'center',
      fontFamily:'Georgia,serif', color:'#e8d5a3',
    }}>
      <div style={{ width:'100%', maxWidth:480, display:'flex', flexDirection:'column', minHeight:'100vh' }}>

        {/* ヘッダー */}
        <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid rgba(232,184,75,0.2)', background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:4, color:'rgba(232,184,75,0.5)' }}>CHARACTER CREATION</div>
            <div style={{ fontSize:18, color:'#e8b84b', letterSpacing:2, marginTop:2 }}>冒険者を作ろう</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:10, color:'rgba(232,184,75,0.4)', letterSpacing:2 }}>STEP</div>
            <div style={{ fontSize:22, color:'#e8b84b' }}>{step+1} / {STEPS.length}</div>
          </div>
        </div>

        {/* プログレス */}
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 20px', background:'rgba(0,0,0,0.3)', flexShrink:0 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{
                width:8, height:8, borderRadius:'50%', flexShrink:0, transition:'all 0.3s',
                background: i <= step ? '#e8b84b' : 'rgba(232,184,75,0.2)',
                border: `1px solid ${i <= step ? '#e8b84b' : 'rgba(232,184,75,0.3)'}`,
                boxShadow: i === step ? '0 0 8px #e8b84b' : 'none',
              }}/>
              {i < STEPS.length-1 && <div style={{ flex:1, height:1, background:'rgba(232,184,75,0.15)' }}/>}
            </React.Fragment>
          ))}
          <span style={{ fontSize:11, color:'rgba(232,184,75,0.5)', letterSpacing:2, marginLeft:8, whiteSpace:'nowrap' }}>{STEPS[step]}</span>
        </div>

        {/* キャラクター */}
        <div style={{ height:300, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', flexShrink:0 }}>
          <div style={{ position:'absolute', width:160, height:160, borderRadius:'50%', background:'radial-gradient(circle,rgba(232,184,75,0.08) 0%,transparent 70%)', animation:'glowP 3s ease-in-out infinite' }}/>
          <div style={{ animation:'floatP 3s ease-in-out infinite' }}>
            <CharSVG opts={opts}/>
          </div>
        </div>

        {/* パネル */}
        <div style={{ flex:1, background:'rgba(0,0,0,0.5)', borderTop:'1px solid rgba(232,184,75,0.2)', padding:'16px 20px' }}>

          {/* Step 0: 名前 */}
          {step === 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ fontSize:10, letterSpacing:3, color:'rgba(232,184,75,0.5)', marginBottom:4 }}>冒険者の名前 ──────────</div>
              <input style={inp} value={opts.username} maxLength={16}
                placeholder="ニックネームを入力（最大16文字）"
                onChange={e => set('username', e.target.value)} autoFocus/>
              <p style={{ fontSize:11, color:'rgba(232,184,75,0.4)', fontFamily:'sans-serif' }}>この名前はランキングや他のプレイヤーに表示されます</p>
            </div>
          )}

          {/* Step 1: 顔型 */}
          {step === 1 && (
            <>
              <div style={{ fontSize:10, letterSpacing:3, color:'rgba(232,184,75,0.5)', marginBottom:12 }}>顔の輪郭 ──────────────</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {['丸顔','面長','四角顔','シャープ'].map((l,i) => (
                  <button key={i} onClick={() => set('face_type', i+1)} style={optBtn(opts.face_type===i+1)}>{l}</button>
                ))}
              </div>
            </>
          )}

          {/* Step 2: 髪型 */}
          {step === 2 && (
            <>
              <div style={{ fontSize:10, letterSpacing:3, color:'rgba(232,184,75,0.5)', marginBottom:12 }}>髪型 ──────────────────</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                {['ショート','ロング','ウェーブ','ポニテ','ボブ','オールバック'].map((l,i) => (
                  <button key={i} onClick={() => set('hair_type', i+1)} style={optBtn(opts.hair_type===i+1)}>{l}</button>
                ))}
              </div>
            </>
          )}

          {/* Step 3: 髪色 */}
          {step === 3 && (
            <>
              <div style={{ fontSize:10, letterSpacing:3, color:'rgba(232,184,75,0.5)', marginBottom:12 }}>髪の色 ────────────────</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
                {HAIR_COLORS.map((c,i) => (
                  <div key={c} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, cursor:'pointer' }} onClick={() => set('hair_color', c)}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:c, border:`2px solid ${opts.hair_color===c?'#e8b84b':'rgba(255,255,255,0.1)'}`, boxShadow:opts.hair_color===c?`0 0 10px ${c}`:'none', transition:'all 0.2s', transform:opts.hair_color===c?'scale(1.15)':'scale(1)' }}/>
                    <span style={{ fontSize:10, color:'rgba(232,184,75,0.6)', fontFamily:'sans-serif' }}>{HAIR_COLOR_LABELS[i]}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Step 4: 肌色 */}
          {step === 4 && (
            <>
              <div style={{ fontSize:10, letterSpacing:3, color:'rgba(232,184,75,0.5)', marginBottom:12 }}>肌の色 ────────────────</div>
              <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
                {SKIN_COLORS.map((c,i) => (
                  <div key={c} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor:'pointer' }} onClick={() => set('skin_color', c)}>
                    <div style={{ width:52, height:52, borderRadius:'50%', background:c, border:`3px solid ${opts.skin_color===c?'#e8b84b':'rgba(255,255,255,0.1)'}`, boxShadow:opts.skin_color===c?'0 0 14px rgba(232,184,75,0.5)':'none', transition:'all 0.2s', transform:opts.skin_color===c?'scale(1.12)':'scale(1)' }}/>
                    <span style={{ fontSize:11, color:'rgba(232,184,75,0.6)', fontFamily:'sans-serif' }}>{SKIN_LABELS[i]}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Step 5: 体型 */}
          {step === 5 && (
            <>
              <div style={{ fontSize:10, letterSpacing:3, color:'rgba(232,184,75,0.5)', marginBottom:12 }}>体型 ──────────────────</div>
              <div style={{ display:'flex', gap:10 }}>
                {['スリム','普通','がっちり'].map((l,i) => (
                  <button key={i} onClick={() => set('body_type', i+1)} style={{ ...optBtn(opts.body_type===i+1), flex:1, padding:'20px 8px', fontSize:13 }}>
                    <div style={{ fontSize:28, marginBottom:8 }}>{i===0?'🧍':i===1?'🚶':'💪'}</div>{l}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 6: ひげ */}
          {step === 6 && (
            <>
              <div style={{ fontSize:10, letterSpacing:3, color:'rgba(232,184,75,0.5)', marginBottom:12 }}>ひげ ──────────────────</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[['なし','😊'],['無精ひげ','🧔'],['口ひげ','👨'],['あごひげ','🧔‍♂️']].map(([l,e],i) => (
                  <button key={i} onClick={() => set('beard_type', i)} style={{ ...optBtn(opts.beard_type===i), padding:'16px 8px', fontSize:13 }}>
                    <div style={{ fontSize:26, marginBottom:6 }}>{e}</div>{l}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 7: 確認 */}
          {step === 7 && (
            <>
              <div style={{ fontSize:10, letterSpacing:3, color:'rgba(232,184,75,0.5)', marginBottom:12 }}>確認 ──────────────────</div>
              <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:8, padding:16, marginBottom:12 }}>
                {[
                  ['冒険者名', opts.username],
                  ['顔型', ['丸顔','面長','四角顔','シャープ'][opts.face_type-1]],
                  ['髪型', ['ショート','ロング','ウェーブ','ポニテ','ボブ','オールバック'][opts.hair_type-1]],
                  ['体型', ['スリム','普通','がっちり'][opts.body_type-1]],
                  ['ひげ', ['なし','無精ひげ','口ひげ','あごひげ'][opts.beard_type]],
                ].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', fontSize:13, fontFamily:'sans-serif' }}>
                    <span style={{ color:'rgba(232,184,75,0.5)' }}>{l}</span>
                    <span style={{ color:'#e8d5a3' }}>{v}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize:12, color:'rgba(232,184,75,0.5)', textAlign:'center', fontFamily:'sans-serif' }}>
                「{opts.username}」として冒険を始めましょう！
              </p>
            </>
          )}
        </div>

        {/* ボタン */}
        <div style={{ display:'flex', gap:10, padding:'14px 20px', background:'rgba(0,0,0,0.6)', borderTop:'1px solid rgba(232,184,75,0.15)', flexShrink:0 }}>
          {step > 0 && (
            <button onClick={() => setSt(s=>s-1)} style={{ flex:1, padding:'13px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(232,184,75,0.2)', borderRadius:6, color:'rgba(232,184,75,0.7)', cursor:'pointer', fontSize:13, fontFamily:'Georgia,serif', letterSpacing:1 }}>
              ← 戻る
            </button>
          )}
          {step < 7 ? (
            <button onClick={() => { if(canNext) setSt(s=>s+1); }} disabled={!canNext} style={{ flex:2, padding:'13px', background: canNext ? 'linear-gradient(135deg,#c8900a,#e8b84b)' : 'rgba(255,255,255,0.1)', border:'none', borderRadius:6, color: canNext ? '#1a0e00' : 'rgba(255,255,255,0.3)', cursor: canNext ? 'pointer' : 'not-allowed', fontSize:14, fontWeight:700, fontFamily:'Georgia,serif', letterSpacing:2 }}>
              次へ →
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving} style={{ flex:2, padding:'13px', background:'linear-gradient(135deg,#c8900a,#e8b84b)', border:'none', borderRadius:6, color:'#1a0e00', cursor:'pointer', fontSize:14, fontWeight:800, fontFamily:'Georgia,serif', letterSpacing:2, boxShadow:'0 4px 16px rgba(232,184,75,0.4)' }}>
              {saving ? '作成中...' : '⚔️ 冒険を始める！'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes floatP { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes glowP  { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.1);opacity:1} }
      `}</style>
    </div>
  );
}