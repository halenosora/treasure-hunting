import React, { useState, useEffect, useRef } from 'react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [fading, setFading] = useState(false);
  const linesRef = useRef<SVGGElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);
  const spinDur  = useRef(4);
  const timer    = useRef<any>(null);

  useEffect(() => {
    return () => clearInterval(timer.current);
  }, []);

  function handleStart() {
    // フェーズ1：高速回転
    timer.current = setInterval(() => {
      spinDur.current = Math.max(0.05, spinDur.current * 0.6);
      if (linesRef.current) {
        linesRef.current.style.animationDuration = spinDur.current + 's';
      }
    }, 150);

    // フェーズ2：地球儀消滅
    setTimeout(() => {
      clearInterval(timer.current);
      if (wrapRef.current) {
        wrapRef.current.style.transform = 'scale(0) rotate(720deg)';
        wrapRef.current.style.opacity   = '0';
      }
    }, 800);

    // フェーズ3：フェードアウト
    setTimeout(() => setFading(true), 1400);

    // フェーズ4：マップへ
    setTimeout(() => onFinish(), 2200);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, overflow: 'hidden',
      opacity: fading ? 0 : 1, transition: 'opacity 0.8s ease-out',
    }}>

      {/* リング */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 80 + i * 20, height: 80 + i * 20,
            borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)',
            animation: `expandRing ${2 + i * 0.3}s linear ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>

      {/* 光線 */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'raysAppear 0.5s ease-out 0.8s both' }}>
        {[...Array(24)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', width: 2, height: '60vh',
            background: 'linear-gradient(to bottom,transparent 0%,rgba(255,230,120,0.6) 40%,rgba(255,255,255,0.9) 50%,rgba(255,230,120,0.6) 60%,transparent 100%)',
            transformOrigin: 'center center',
            transform: `rotate(${i * 15}deg)`,
            animation: `rayPulse 2s ease-in-out ${(i * 0.12) % 2}s infinite`,
          }} />
        ))}
      </div>

      {/* 中心光 */}
      <div style={{
        position: 'absolute', width: 120, height: 120, borderRadius: '50%',
        background: 'radial-gradient(circle,#ffffff 0%,#fff9e0 20%,#e8b84b 50%,transparent 70%)',
        animation: 'coreExpand 1.2s ease-out forwards',
      }} />

      {/* ロゴ */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', animation: 'logoAppear 0.8s cubic-bezier(0.34,1.56,0.64,1) 1.0s both' }}>

        {/* 回転地球儀 */}
        <div ref={wrapRef} style={{ width: 110, height: 110, margin: '0 auto 16px', transition: 'transform 0.8s ease-in, opacity 0.5s ease-in' }}>
          <svg viewBox="0 0 110 110" width="110" height="110"
            style={{ filter: 'drop-shadow(0 0 12px rgba(232,184,75,0.8))', animation: 'globeGlow 2s ease-in-out 1.5s infinite' }}>
            <defs><clipPath id="gc"><circle cx="55" cy="55" r="44"/></clipPath></defs>
            <circle cx="55" cy="55" r="44" fill="none" stroke="#e8b84b" strokeWidth="2"/>
            <g clipPath="url(#gc)">
              <g ref={linesRef} style={{ animation: 'spinGlobe 4s linear infinite' }}>
                {[10,42,74,106,138,170,202,234].map((x, i) => (
                  <ellipse key={i} cx={x} cy="55" rx="16" ry="44" fill="none" stroke="#e8b84b" strokeWidth="1" strokeOpacity="0.55"/>
                ))}
              </g>
            </g>
            <ellipse cx="55" cy="55" rx="44" ry="13" fill="none" stroke="#e8b84b" strokeWidth="1" strokeOpacity="0.5"/>
            <ellipse cx="55" cy="33" rx="36" ry="9"  fill="none" stroke="#e8b84b" strokeWidth="0.8" strokeOpacity="0.35"/>
            <ellipse cx="55" cy="77" rx="36" ry="9"  fill="none" stroke="#e8b84b" strokeWidth="0.8" strokeOpacity="0.35"/>
            <circle cx="66" cy="42" r="5" fill="#e8b84b"/>
            <line x1="66" y1="35" x2="66" y2="49" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
            <line x1="59" y1="42" x2="73" y2="42" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="66" cy="42" r="9" fill="none" stroke="#e8b84b" strokeWidth="0.8" strokeOpacity="0.5"/>
          </svg>
        </div>

        <span style={{ display:'block', fontFamily:'Georgia,serif', fontSize:52, fontWeight:700, color:'#e8b84b', letterSpacing:8, lineHeight:1, textShadow:'0 0 30px rgba(232,184,75,0.8),0 0 60px rgba(232,184,75,0.4)' }}>TERRA</span>
        <span style={{ display:'block', fontFamily:'Georgia,serif', fontSize:52, fontWeight:700, color:'#fff', letterSpacing:10, lineHeight:1, marginTop:4, textShadow:'0 0 20px rgba(255,255,255,0.6)' }}>HUNT</span>
        <span style={{ display:'block', fontFamily:'sans-serif', fontSize:11, color:'rgba(232,184,75,0.7)', letterSpacing:4, marginTop:12, animation:'subAppear 0.6s ease-out 1.8s both' }}>AR TREASURE ADVENTURE</span>

        {/* START ADVENTUREボタン */}
        <div style={{ marginTop: 36, animation: 'subAppear 0.8s ease-out 2.2s both' }}>
          <button onClick={handleStart} style={{
            position: 'relative', background: 'transparent', border: 'none',
            padding: '14px 44px', cursor: 'pointer',
          }}>
            {/* 光る枠線 */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 40,
              border: '1.5px solid rgba(232,184,75,0.6)',
              boxShadow: '0 0 12px rgba(232,184,75,0.3),inset 0 0 12px rgba(232,184,75,0.05)',
              animation: 'borderGlow 2s ease-in-out infinite',
            }} />
            {/* 四隅 */}
            {[
              { top:-1, left:-1,  borderWidth:'2px 0 0 2px',  borderRadius:'4px 0 0 0' },
              { top:-1, right:-1, borderWidth:'2px 2px 0 0',  borderRadius:'0 4px 0 0' },
              { bottom:-1, left:-1,  borderWidth:'0 0 2px 2px', borderRadius:'0 0 0 4px' },
              { bottom:-1, right:-1, borderWidth:'0 2px 2px 0', borderRadius:'0 0 4px 0' },
            ].map((s, i) => (
              <div key={i} style={{
                position:'absolute', width:8, height:8,
                borderColor:'#e8b84b', borderStyle:'solid',
                animation:'cornerGlow 2s ease-in-out infinite',
                ...s,
              }} />
            ))}
            <span style={{
              position: 'relative', fontFamily: 'Georgia,serif', fontSize: 15,
              fontWeight: 700, color: '#e8b84b', letterSpacing: 6,
            }}>START ADVENTURE</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes expandRing { 0%{transform:scale(0);opacity:0.8} 100%{transform:scale(4);opacity:0} }
        @keyframes raysAppear { from{opacity:0} to{opacity:1} }
        @keyframes rayPulse   { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
        @keyframes coreExpand { 0%{transform:scale(0);opacity:0} 30%{transform:scale(0.3);opacity:1} 60%{transform:scale(1.5);opacity:0.8} 100%{transform:scale(1);opacity:0.6} }
        @keyframes logoAppear { 0%{opacity:0;transform:scale(0.3) translateY(20px);filter:brightness(10)} 60%{opacity:1;transform:scale(1.05) translateY(-4px);filter:brightness(2)} 100%{opacity:1;transform:scale(1) translateY(0);filter:brightness(1)} }
        @keyframes globeGlow  { 0%,100%{filter:drop-shadow(0 0 12px rgba(232,184,75,0.6))} 50%{filter:drop-shadow(0 0 24px rgba(232,184,75,1.0))} }
        @keyframes spinGlobe  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes subAppear  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes borderGlow { 0%,100%{box-shadow:0 0 8px rgba(232,184,75,0.3),inset 0 0 8px rgba(232,184,75,0.05);border-color:rgba(232,184,75,0.5)} 50%{box-shadow:0 0 20px rgba(232,184,75,0.7),0 0 40px rgba(232,184,75,0.2),inset 0 0 16px rgba(232,184,75,0.1);border-color:rgba(232,184,75,0.9)} }
        @keyframes cornerGlow { 0%,100%{opacity:0.5} 50%{opacity:1} }
      `}</style>
    </div>
  );
}