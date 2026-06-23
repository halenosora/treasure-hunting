import React, { useEffect } from 'react';
import { supabase } from './supabase';

export default function VRoidCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return;

    // アクセストークンを取得
    fetch('https://exwzquyxfenoguytiren.supabase.co/functions/v1/vroid-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          code_verifier: codeVerifier,
          redirect_uri: redirectUri,
          client_id: clientId,
        }),
      })
        .then(r => r.json())
        .then(async token => {
        // モデル一覧を取得
        const res = await fetch('https://hub.vroid.com/api/v1/account/character_models', {
          headers: { Authorization: `Bearer ${token.access_token}` },
        });
        const models = await res.json();
        const firstModel = models.character_models?.[0];
        if (firstModel) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('profiles').update({
              avatar_url: firstModel.avatar_image?.square_url ?? '',
              vroid_model_url: firstModel.id,
            }).eq('id', user.id);
          }
        }
        window.location.href = '/';
      });
  }, []);

  return (
    <div style={{ position:'fixed', inset:0, background:'#0a0e1a', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ width:40, height:40, border:'3px solid rgba(232,184,75,0.2)', borderTopColor:'#e8b84b', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
      <p style={{ color:'rgba(232,184,75,0.7)', fontSize:14 }}>VRoid Hubと連携中...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}