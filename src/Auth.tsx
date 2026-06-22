import React, { useState } from 'react';
import { supabase } from './supabase';
import './Auth.css';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async () => {
    if (!email || !password || !username) {
      setError('全ての項目を入力してください');
      return;
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上にしてください');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signupError) throw signupError;
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          username,
        });
        setMessage('確認メールを送信しました。メールを確認してください。');
      }
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('メールとパスワードを入力してください');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) throw loginError;
      onLogin();
    } catch (err: any) {
      setError('メールまたはパスワードが間違っています');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">🗺️</div>
        <h1 className="auth-title">たからさがし</h1>
        <p className="auth-subtitle">AR宝探しアプリ</p>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); setMessage(''); }}
          >
            ログイン
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
          >
            新規登録
          </button>
        </div>

        {mode === 'signup' && (
          <div className="auth-field">
            <label>冒険者名</label>
            <input
              type="text"
              placeholder="ニックネームを入力"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
        )}

        <div className="auth-field">
          <label>メールアドレス</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="auth-field">
          <label>パスワード</label>
          <input
            type="password"
            placeholder="6文字以上"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-message">{message}</p>}

        <button
          className="auth-btn"
          onClick={mode === 'login' ? handleLogin : handleSignup}
          disabled={loading}
        >
          {loading ? '処理中...' : mode === 'login' ? 'ログイン' : '冒険を始める！'}
        </button>

        {mode === 'login' && (
          <p className="auth-switch">
            アカウントをお持ちでない方は
            <button onClick={() => setMode('signup')}>新規登録</button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Auth;