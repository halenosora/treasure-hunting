import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

export default function VRoidCallback() {
  const [status, setStatus] = useState('VRoid Hubと連携中...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      setStatus(`エラー: ${error}`);
      setTimeout(() => { window.location.href = '/'; }, 3000);
      return;
    }

    if (!code) {
      setStatus('認証コードがありません');
      setTimeout(() => { window.location.href = '/'; }, 3000);
      return;
    }

    const codeVerifier = sessionStorage.getItem('vroid_code_verifier') ?? '';
    const clientId = process.env.REACT_APP_VROID_CLIENT_ID ?? '';
    const redirectUri = `${window.location.origin}/vroid-callback`;

    setStatus('アクセストークンを取得中...');

    fetch('https://exwzquyxfenoguytiren.supabase.co/functions/v1/vroid-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, code_verifier: codeVerifier, redirect_uri: redirectUri, client_id: clientId }),
    })
      .then(async r => {
        const text = await r.text();
        console.log('Token response:', r.status, text);
        return JSON.parse(text);
      })
      .then(async token => {
        if (token.error) {
          setStatus(`トークンエラー: ${token.error_description ?? token.error}`);
          setTimeout(() => { window.location.href = '/'; }, 3000);
          return;
        }

        setStatus('アバター情報を取得中...');
        const res = await fetch('https://exwzquyxfenoguytiren.supabase.co/functions/v1/vroid-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_models', access_token: token.access_token }),
        });
        const models = await res.json();
        console.log('Models:', models);

        console.log('Models detail:', JSON.stringify(models));
        const firstModel = models.character_models?.[0] ?? models.data?.[0];
        if (firstModel) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('profiles').update({
              avatar_url: firstModel.avatar_image?.square_url ?? '',
            }).eq('id', user.id);
            setStatus('連携完了！');
          }
        } else {
          setStatus('VRoid Hubにモデルが見つかりませんでした。先にVRoid Hubでモデルを登録してください。');
        }
        setTimeout(() => { window.location.href = '/'; }, 2000);
      })
      .catch(err => {
        console.error('Error:', err);
        setStatus(`エラーが発生しました: ${err.message}`);
        setTimeout(() => { window.location.href = '/'; }, 3000);
      });
  }, []);

  return (
    <div style={{ position:'fixed', inset:0, background:'#0a0e1a', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ width:40, height:40, border:'3px solid rgba(232,184,75,0.2)', borderTopColor:'#e8b84b', borderRadius:'50%', animation:'spin 1s linear infinite' }}/>
      <p style={{ color:'rgba(232,184,75,0.7)', fontSize:14, textAlign:'center', maxWidth:300 }}>{status}</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}