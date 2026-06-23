import React, { useState, useEffect, useRef } from 'react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [fading, setFading] = useState(false);

  function handleStart() {
    setTimeout(() => setFading(true), 200);
    setTimeout(() => onFinish(), 1000);
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'#000',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      zIndex:99999, overflow:'hidden',
      opacity: fading ? 0 : 1, transition:'opacity 0.8s ease-out',
    }}>
      {/* 背景星 */}
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{
          position:'absolute',
          width: i % 3 === 0 ? 3 : 2,
          height: i % 3 === 0 ? 3 : 2,
          borderRadius:'50%',
          background:'#e8b84b',
          top:`${10 + (i * 7.3) % 80}%`,
          left:`${5 + (i * 13.7) % 90}%`,
          animation:`starTwinkle ${2 + (i % 3) * 0.5}s ease-in-out ${i * 0.3}s infinite`,
        }}/>
      ))}

      {/* 拡散リング */}
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position:'absolute',
          width:300, height:300,
          borderRadius:'50%',
          border:'1px solid rgba(232,184,75,0.15)',
          animation:`ringExpand 4s ease-out ${i * 1.3}s infinite`,
        }}/>
      ))}

      {/* 光線 */}
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{
          position:'absolute',
          width:1, height:200,
          background:'linear-gradient(to bottom,transparent,rgba(232,184,75,0.35),transparent)',
          top:'50%', left:'50%',
          transformOrigin:'bottom center',
          transform:`rotate(${i * 45}deg) translateY(-100px)`,
          animation:`rayPulse 3s ease-in-out ${i * 0.2}s infinite`,
        }}/>
      ))}

      {/* ロゴ */}
      <div style={{
        position:'relative', zIndex:10,
        display:'flex', flexDirection:'column', alignItems:'center',
        animation:'logoAppear 1s cubic-bezier(0.34,1.56,0.64,1) 0.5s both',
      }}>
        <img
          src="/images/NEXARAlogo.png"
          alt="NEXARA"
          style={{
            width:280, height:'auto',
            animation:'logoFloat 3s ease-in-out 1.5s infinite, logoGlow 2s ease-in-out 1.5s infinite',
          }}
        />
        <span style={{
          fontFamily:'sans-serif', fontSize:11, letterSpacing:5,
          color:'rgba(232,184,75,0.6)', marginTop:8,
          animation:'subAppear 0.8s ease-out 1.8s both',
        }}>AR TREASURE ADVENTURE</span>

        {/* STARTボタン */}
        <div style={{ marginTop:40, animation:'subAppear 0.8s ease-out 2.2s both' }}>
          <button onClick={handleStart} style={{
            position:'relative', background:'transparent',
            border:'none', padding:'14px 44px', cursor:'pointer',
          }}>
            <div style={{
              position:'absolute', inset:0, borderRadius:40,
              border:'1.5px solid rgba(232,184,75,0.6)',
              animation:'borderGlow 2s ease-in-out infinite',
            }}/>
            {[
              { top:-1, left:-1,  borderWidth:'2px 0 0 2px',  borderRadius:'4px 0 0 0' },
              { top:-1, right:-1, borderWidth:'2px 2px 0 0',  borderRadius:'0 4px 0 0' },
              { bottom:-1, left:-1,  borderWidth:'0 0 2px 2px', borderRadius:'0 0 0 4px' },
              { bottom:-1, right:-1, borderWidth:'0 2px 2px 0', borderRadius:'0 0 4px 0' },
            ].map((s, i) => (
              <div key={i} style={{
                position:'absolute', width:8, height:8,
                borderColor:'#e8b84b', borderStyle:'solid', ...s,
              }}/>
            ))}
            <span style={{
              position:'relative', fontFamily:'Georgia,serif',
              fontSize:14, fontWeight:700, color:'#e8b84b', letterSpacing:5,
            }}>START ADVENTURE</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes starTwinkle { 0%,100%{opacity:0.1;transform:scale(0.8)} 50%{opacity:0.8;transform:scale(1.2)} }
        @keyframes ringExpand  { 0%{transform:scale(0.3);opacity:0.8} 100%{transform:scale(2.5);opacity:0} }
        @keyframes rayPulse    { 0%,100%{opacity:0.15} 50%{opacity:0.6} }
        @keyframes logoAppear  { 0%{opacity:0;transform:scale(0.3) translateY(20px);filter:brightness(10)} 60%{opacity:1;transform:scale(1.05) translateY(-4px);filter:brightness(2)} 100%{opacity:1;transform:scale(1) translateY(0);filter:brightness(1)} }
        @keyframes logoFloat   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes logoGlow    { 0%,100%{filter:drop-shadow(0 0 10px rgba(232,184,75,0.4)) drop-shadow(0 0 20px rgba(232,184,75,0.2))} 50%{filter:drop-shadow(0 0 20px rgba(232,184,75,0.8)) drop-shadow(0 0 40px rgba(232,184,75,0.4))} }
        @keyframes subAppear   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes borderGlow  { 0%,100%{box-shadow:0 0 8px rgba(232,184,75,0.2);border-color:rgba(232,184,75,0.4)} 50%{box-shadow:0 0 20px rgba(232,184,75,0.6),0 0 40px rgba(232,184,75,0.2);border-color:rgba(232,184,75,0.9)} }
      `}</style>
    </div>
  );
}