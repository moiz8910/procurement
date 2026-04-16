import React, { useState } from 'react';
import { MOCK_USERS } from '../context/AppContext';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(MOCK_USERS[0].id);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    // Simulate a short network delay then succeed (dummy login)
    setTimeout(() => {
      const user = MOCK_USERS.find((u) => u.id === parseInt(selectedUserId));
      localStorage.setItem('procura_user_id', user.id);
      localStorage.setItem('procura_logged_in', 'true');
      setIsLoading(false);
      onLogin(user);
    }, 900);
  };

  const selectedUser = MOCK_USERS.find((u) => u.id === parseInt(selectedUserId));

  return (
    <div className="login-root">
      {/* Animated blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo-row">
          <div className="login-logo-spark" />
          <span className="login-logo-text">
            Procura<span className="login-logo-pip">PRO</span>
          </span>
        </div>

        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in to your procurement command centre</p>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {/* Role selector */}
          <div className="login-field">
            <label className="login-label" htmlFor="role-select">Login as</label>
            <div className="login-role-grid">
              {MOCK_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  id={`role-${u.id}`}
                  className={`role-chip ${parseInt(selectedUserId) === u.id ? 'role-chip--active' : ''}`}
                  onClick={() => setSelectedUserId(u.id)}
                >
                  <span className="role-chip-avatar">
                    {u.name.charAt(0)}
                  </span>
                  <span className="role-chip-info">
                    <span className="role-chip-name">{u.name}</span>
                    <span className="role-chip-role">{u.role}</span>
                  </span>
                  {parseInt(selectedUserId) === u.id && (
                    <span className="role-chip-check">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="login-field">
            <label className="login-label" htmlFor="login-email">Email address</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                id="login-email"
                type="email"
                className="login-input"
                placeholder={`${selectedUser?.name.toLowerCase().replace(' ', '.')}@procura.io`}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <label className="login-label" htmlFor="login-password">Password</label>
            <div className="login-input-wrapper">
              <span className="login-input-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="Enter any password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C6 20 1 12 1 12a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="login-error" role="alert">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errorMsg}
            </div>
          )}

          {/* Remember + Forgot */}
          <div className="login-meta-row">
            <label className="login-remember">
              <input type="checkbox" id="remember-me" />
              Remember me
            </label>
            <button type="button" className="login-forgot">Forgot password?</button>
          </div>

          {/* Submit */}
          <button
            id="login-submit-btn"
            type="submit"
            className={`login-btn ${isLoading ? 'login-btn--loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="login-spinner" />
                Signing in…
              </>
            ) : (
              <>
                Sign in to Procura
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="login-footer-note">
          🔒 This is a demo environment — any credentials will work.
        </p>
      </div>

      {/* Inline styles scoped to the login page */}
      <style>{loginStyles}</style>
    </div>
  );
};

const loginStyles = `
  .login-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    position: relative;
    overflow: hidden;
    font-family: 'Inter', sans-serif;
  }

  /* animated gradient blobs */
  .blob {
    position: absolute;
    border-radius: 0;
    filter: blur(80px);
    opacity: 0.35;
    animation: blobFloat 8s ease-in-out infinite;
  }
  .blob-1 {
    width: 520px; height: 520px;
    background: radial-gradient(circle, #34d399 0%, transparent 70%);
    top: -120px; left: -180px;
    animation-delay: 0s;
  }
  .blob-2 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, #6ee7b7 0%, transparent 70%);
    bottom: -80px; right: -100px;
    animation-delay: 3s;
  }
  .blob-3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, #a7f3d0 0%, transparent 70%);
    top: 50%; right: 25%;
    animation-delay: 5s;
  }
  @keyframes blobFloat {
    0%, 100% { transform: translateY(0px) scale(1); }
    50%       { transform: translateY(-30px) scale(1.05); }
  }

  /* Card */
  .login-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 480px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 0;
    padding: 40px;
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.05);
    animation: cardIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(40px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Logo */
  .login-logo-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
  }
  .login-logo-spark {
    width: 16px; height: 16px;
    border-radius: 0;
    background: linear-gradient(135deg, #059669, #10b981);
    transform: rotate(45deg);
    box-shadow: 0 0 16px rgba(16, 185, 129, 0.4);
    flex-shrink: 0;
  }
  .login-logo-text {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #1e293b;
  }
  .login-logo-pip {
    font-size: 10px;
    font-weight: 800;
    color: #059669;
    background: rgba(5, 150, 105, 0.15);
    padding: 2px 6px;
    border-radius: 0;
    margin-left: 4px;
  }

  .login-title {
    font-size: 28px;
    font-weight: 800;
    color: #1e293b;
    letter-spacing: -0.5px;
    margin: 0 0 6px;
  }
  .login-subtitle {
    font-size: 14px;
    color: #64748b;
    margin: 0 0 32px;
  }

  /* Form */
  .login-form { display: flex; flex-direction: column; gap: 20px; }

  .login-field { display: flex; flex-direction: column; gap: 8px; }

  .login-label {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    letter-spacing: 0.3px;
  }

  /* Role grid */
  .login-role-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .role-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 0;
    border: 1px solid #cbd5e1;
    background: #f8fafc;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    position: relative;
  }
  .role-chip:hover {
    border-color: rgba(5, 150, 105, 0.5);
    background: rgba(5, 150, 105, 0.05);
  }
  .role-chip--active {
    border-color: #059669;
    background: rgba(5, 150, 105, 0.1);
    box-shadow: 0 0 0 1px #059669;
  }
  .role-chip-avatar {
    width: 32px; height: 32px;
    border-radius: 0;
    background: linear-gradient(135deg, #059669, #10b981);
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .role-chip-info {
    display: flex; flex-direction: column;
    overflow: hidden;
  }
  .role-chip-name {
    font-size: 13px; font-weight: 700;
    color: #1e293b;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .role-chip-role {
    font-size: 11px;
    color: #64748b;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .role-chip-check {
    position: absolute; top: 6px; right: 8px;
    font-size: 11px; color: #059669; font-weight: 800;
  }

  /* Input */
  .login-input-wrapper {
    position: relative;
    display: flex; align-items: center;
  }
  .login-input-icon {
    position: absolute; left: 14px;
    color: #94a3b8;
    display: flex; align-items: center;
    pointer-events: none;
  }
  .login-input {
    width: 100%;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 0;
    padding: 12px 44px 12px 42px;
    font-size: 14px;
    color: #1e293b;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
  }
  .login-input::placeholder { color: #94a3b8; }
  .login-input:focus {
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.25);
    background: #ffffff;
  }
  .login-eye-btn {
    position: absolute; right: 14px;
    background: none; border: none;
    color: #94a3b8;
    cursor: pointer; padding: 0;
    display: flex; align-items: center;
    transition: color 0.2s;
  }
  .login-eye-btn:hover { color: #475569; }

  /* Error */
  .login-error {
    display: flex; align-items: center; gap: 6px;
    font-size: 13px; color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 0;
    padding: 10px 14px;
    animation: shake 0.3s ease;
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25%       { transform: translateX(-4px); }
    75%       { transform: translateX(4px); }
  }

  /* Meta row */
  .login-meta-row {
    display: flex; align-items: center; justify-content: space-between;
  }
  .login-remember {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: #64748b;
    cursor: pointer;
  }
  .login-remember input { accent-color: #059669; }
  .login-forgot {
    background: none; border: none;
    font-size: 13px; color: #059669;
    cursor: pointer; font-weight: 600;
    transition: color 0.2s;
  }
  .login-forgot:hover { color: #047857; }

  /* Submit button */
  .login-btn {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    width: 100%;
    padding: 14px;
    border-radius: 0;
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    color: #fff; font-size: 15px; font-weight: 700;
    border: none; cursor: pointer;
    box-shadow: 0 8px 24px rgba(5, 150, 105, 0.4);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    letter-spacing: 0.2px;
    font-family: 'Inter', sans-serif;
  }
  .login-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(5, 150, 105, 0.5);
  }
  .login-btn:active:not(:disabled) { transform: translateY(0); }
  .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .login-btn--loading { background: linear-gradient(135deg, #064e3b 0%, #047857 100%); }

  /* Spinner */
  .login-spinner {
    width: 18px; height: 18px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 0;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Footer note */
  .login-footer-note {
    text-align: center;
    font-size: 12px;
    color: #94a3b8;
    margin-top: 24px;
  }
`;

export default LoginPage;
