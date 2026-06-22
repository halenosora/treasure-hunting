import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDone(true);
      setTimeout(onFinish, 600);
    }, 4000);
    return () => clearTimeout(t);
  }, [onFinish]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, overflow: 'hidden',
      opacity: done ? 0 : 1, transition: 'opacity 0.6s ease-out',
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
        <div style={{ width: 110, height: 110, margin: '0 auto 16px', animation: 'globeGlow 2s ease-in-out 1.5s infinite' }}>
          <svg viewBox="0 0 110 110" width="110" height="110" style={{ filter: 'drop-shadow(0 0 12px rgba(232,184,75,0.8))' }}>
            <defs>
              <clipPath id="gc"><circle cx="55" cy="55" r="44"/></clipPath>
            </defs>
            <circle cx="55" cy="55" r="44" fill="none" stroke="#e8b84b" strokeWidth="2"/>
            <g clipPath="url(#gc)">
              <g style={{ animation: 'spinGlobe 4s linear infinite' }}>
                {[10,42,74,106,142,174,206,238].map((x, i) => (
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
            <circle cx="66" cy="42" r="9"  fill="none" stroke="#e8b84b" strokeWidth="0.8" strokeOpacity="0.5"/>
          </svg>
        </div>

        <span style={{
          display: 'block', fontFamily: 'Georgia,serif', fontSize: 52, fontWeight: 700,
          color: '#e8b84b', letterSpacing: 8,
          textShadow: '0 0 30px rgba(232,184,75,0.8),0 0 60px rgba(232,184,75,0.4)',
        }}>TERRA</span>
        <span style={{
          display: 'block', fontFamily: 'Georgia,serif', fontSize: 52, fontWeight: 700,
          color: '#fff', letterSpacing: 10, marginTop: 4,
          textShadow: '0 0 20px rgba(255,255,255,0.6)',
        }}>HUNT</span>
        <span style={{
          display: 'block', fontFamily: 'sans-serif', fontSize: 11,
          color: 'rgba(232,184,75,0.7)', letterSpacing: 4, marginTop: 12,
          animation: 'subAppear 0.6s ease-out 1.8s both',
        }}>AR TREASURE ADVENTURE</span>

        {/* ローディングバー */}
        <div style={{ width: 160, height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2, margin: '20px auto 0', overflow: 'hidden', animation: 'subAppear 0.3s ease-out 1.8s both' }}>
          <div style={{ height: '100%', width: 0, background: 'linear-gradient(to right,#e8b84b,#fff)', borderRadius: 2, animation: 'loadP 1.5s ease-out 1.9s forwards' }} />
        </div>
        <div style={{ fontFamily: 'sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: 4, marginTop: 8, animation: 'subAppear 0.3s ease-out 1.8s both' }}>
          LOADING...
        </div>
      </div>

      <style>{`
        @keyframes expandRing { 0%{transform:scale(0);opacity:0.8} 100%{transform:scale(4);opacity:0} }
        @keyframes raysAppear { to{opacity:1} }
        @keyframes rayPulse   { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
        @keyframes coreExpand { 0%{transform:scale(0);opacity:0} 30%{transform:scale(0.3);opacity:1} 60%{transform:scale(1.5);opacity:0.8} 100%{transform:scale(1);opacity:0.6} }
        @keyframes logoAppear { 0%{opacity:0;transform:scale(0.3) translateY(20px);filter:brightness(10)} 60%{opacity:1;transform:scale(1.05) translateY(-4px);filter:brightness(2)} 100%{opacity:1;transform:scale(1) translateY(0);filter:brightness(1)} }
        @keyframes globeGlow  { 0%,100%{filter:drop-shadow(0 0 12px rgba(232,184,75,0.6))} 50%{filter:drop-shadow(0 0 24px rgba(232,184,75,1.0))} }
        @keyframes spinGlobe  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes subAppear  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes loadP      { to{width:100%} }
      `}</style>
    </div>
  );
}