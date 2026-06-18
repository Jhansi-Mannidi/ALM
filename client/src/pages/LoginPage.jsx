import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ThemeToggle from '../components/ThemeToggle';
import { AppIcon, Icons } from '../components/icons';
import vLogo from '../assets/voltuswave-v-logo.png';
import './login.css';

const DEFAULT_EMAIL = 'sasi@voltuswave.com';
const DEFAULT_PASSWORD = 'Apple#123';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginWithCredentials, initError } = useApp();
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await loginWithCredentials(email.trim(), password);
      navigate('/workspace', { replace: true });
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="vw-login-screen">
      <div className="vw-login-theme">
        <ThemeToggle />
      </div>

      <div className="vw-login-layout">
        <div className="vw-login-visual" aria-hidden>
          <div className="vw-login-visual-overlay" />
        </div>

        <div className="vw-login-panel">
          <div className="vw-login-card">
            <div className="vw-login-brand">
              <div className="vw-login-logo" aria-hidden>
                <img className="vw-login-logo-mark" src={vLogo} alt="" />
              </div>
              <div>
                <div className="vw-login-brand-name">VOLTUSWAVE</div>
                <div className="vw-login-brand-tag">Business Operating System</div>
              </div>
            </div>

            <h1 className="vw-login-title">Sign In</h1>

            {initError && !error && (
              <p className="vw-login-error vw-login-api-hint">{initError}</p>
            )}

            <form className="vw-login-form" onSubmit={handleSubmit}>
              <label className="vw-login-field">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                />
              </label>

              <label className="vw-login-field">
                Password
                <span className="vw-login-password-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    minLength={4}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="vw-login-eye"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <AppIcon icon={showPassword ? Icons.eyeOff : Icons.eye} size={18} />
                  </button>
                </span>
              </label>

              <div className="vw-login-forgot-row">
                <button type="button" className="vw-login-link-btn" onClick={() => setError('Password reset is not configured in this demo.')}>
                  Forgot Password?
                </button>
              </div>

              {error && <p className="vw-login-error">{error}</p>}

              <button type="submit" className="vw-login-submit" disabled={busy}>
                {busy ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="vw-login-foot">
              By clicking continue, you agree to our{' '}
              <button type="button" className="vw-login-link-btn inline">Privacy Policy</button>.
            </p>

            <p className="vw-login-demo-hint">
              Demo: use sasi@voltuswave.com and Apple#123.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
