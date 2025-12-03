// src/pages/Login.jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import logo2 from '../assets/logo2.png';

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [isLicenseExpired, setIsLicenseExpired] = useState(false);

  const isAR = i18n.language === 'ar';

  useEffect(() => {
    const storedLang = localStorage.getItem('bm_portal_lang');
    if (storedLang && storedLang !== i18n.language) {
      i18n.changeLanguage(storedLang);
    }
  }, [i18n]);

  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('bm_portal_lang', lang);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/login/', {
        username,
        password,
      });

      const { access, refresh, user } = response.data;

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      if (error.response?.status === 403 && error.response?.data?.code === 'LICENSE_EXPIRED') {
        setIsLicenseExpired(true);
        setErr(t('login.license_expired', { defaultValue: 'System license expired, please contact IT.' }));
      } else {
        setErr(
          error.response?.data?.detail ||
            t('login.error', { defaultValue: 'Invalid username or password' })
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-page">
        {/* خلفية بتدرّج أقوى */}
        <div className="login-bg" />

        {/* Hero بنفس أنيميشن بقية الصفحات */}
        <section className="login-hero">
          <div className="login-hero-inner">
            <div className="brand">
              <div className="brand-logo">
                <img src={logo2} alt="logo" />
              </div>
              <div className="brand-text">
                <h1 className="brand-title">
                  {t('system_title', { defaultValue: 'Berkat Madinah Portal' })}
                </h1>
                <p className="brand-sub">
                  {t('system_subtitle', {
                    defaultValue: 'Internal portal for forms, approvals & communications',
                  })}
                </p>
              </div>
            </div>

            {/* اختيار اللغة */}
            <div className="lang-switch">
              <button
                type="button"
                className={`lang-btn ${isAR ? 'active' : ''}`}
                onClick={() => changeLang('ar')}
              >
                AR
              </button>
              <span className="lang-sep">|</span>
              <button
                type="button"
                className={`lang-btn ${!isAR ? 'active' : ''}`}
                onClick={() => changeLang('en')}
              >
                EN
              </button>
            </div>
          </div>
        </section>

        {/* بطاقة تسجيل الدخول (زجاجية) */}
        <section className="login-content">
          <form
            className={`login-card ${isAR ? 'rtl' : ''}`}
            onSubmit={handleSubmit}
          >
            <h2 className="card-title">
              {t('login.signin', { defaultValue: 'Sign in' })}
            </h2>

            {err && <div className="card-error">{err}</div>}

            <div className="field">
              <label>
                {t('login.username', { defaultValue: 'Username' })}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('login.username_ph', {
                  defaultValue: 'Enter your username',
                })}
                required
                autoFocus
              />
            </div>

            <div className="field">
              <label>
                {t('login.password', { defaultValue: 'Password' })}
              </label>
              <div className="pwd-wrap">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.password_ph', {
                    defaultValue: 'Enter your password',
                  })}
                  required
                />
                <button
                  type="button"
                  className="pwd-toggle"
                  onClick={() => setShowPwd(!showPwd)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                  title={
                    showPwd
                      ? t('login.hide', { defaultValue: 'Hide' })
                      : t('login.show', { defaultValue: 'Show' })
                  }
                >
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="submit" disabled={loading}>
              {loading
                ? t('login.loading', { defaultValue: 'Signing in...' })
                : t('login.button', { defaultValue: 'Login' })}
            </button>

            <p className="note login-note">
              {t('login.note', {
                defaultValue:
                  'By logging in, you confirm that you have read and agree to the company policies.',
              })}{' '}
              <span
                className="policy-link"
                onClick={() => navigate('/policies')}
              >
                {t('login.view_policies', { defaultValue: 'View company policies' })}
              </span>
            </p>
          </form>
        </section>
      </div>

      {/* ستايلات مخصصة لصفحة تسجيل الدخول */}
      <style jsx="true">{`
        :root {
          --gA: #0e9f6e;
          --g1: #059669;
          --g2: #10b981;
          --g3: #22c55e;
          --g4: #4ade80;
          --white: #fff;
          --ink: #0a6f47;
          --radius: 16px;
        }

        .login-page {
          position: relative;
          min-height: 100vh;
          direction: ltr;
          overflow: hidden;
          background: #eef6f2;
        }

        .login-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background:
            radial-gradient(
              1400px 260px at 16% -60%,
              rgba(255, 255, 255, 0.28),
              transparent 60%
            ),
            radial-gradient(
              900px 200px at 100% 0%,
              rgba(255, 255, 255, 0.12),
              transparent 60%
            ),
            linear-gradient(
              135deg,
              var(--gA) 0%,
              var(--g1) 18%,
              var(--g2) 48%,
              var(--g3) 78%,
              var(--g4) 100%
            );
          filter: saturate(120%) contrast(105%);
          opacity: 0.98;
        }

        /* Hero */
        .login-hero {
          position: relative;
          z-index: 1;
          padding: 16px;
          animation: heroIn 0.8s ease both;
        }

        .login-hero-inner {
          max-width: 980px;
          margin: 0 auto;
          min-height: 110px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-logo {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.16);
          display: grid;
          place-items: center;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.22);
          overflow: hidden;
        }

        .brand-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .brand-title {
          margin: 0;
          color: #fff;
          font-weight: 900;
          font-size: 1.6rem;
          text-shadow: 0 1px 0 rgba(0, 0, 0, 0.12);
        }

        .brand-sub {
          margin: 4px 0 0;
          color: #f2fffa;
          opacity: 0.95;
        }

        /* Language */
        .lang-switch {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.16);
          padding: 6px 8px;
          border-radius: 12px;
        }

        .lang-btn {
          border: none;
          background: transparent;
          color: #f0fff4;
          font-weight: 900;
          padding: 4px 8px;
          border-radius: 8px;
          cursor: pointer;
        }

        .lang-btn.active {
          background: rgba(255, 255, 255, 0.3);
        }

        .lang-sep {
          color: rgba(255, 255, 255, 0.7);
          font-weight: 800;
        }

        /* Card */
        .login-content {
          position: relative;
          z-index: 2;
        }

        .login-card {
          width: 100%;
          max-width: 520px;
          margin: 14px auto 36px;
          padding: 22px 18px;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.45);
          border-radius: var(--radius);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(12px) saturate(135%);
          -webkit-backdrop-filter: blur(12px) saturate(135%);
          animation: fadeInUp 0.8s ease both;
        }

        .login-card.rtl {
          direction: rtl;
          text-align: right;
        }

        .card-title {
          margin: 0 0 12px;
          font-weight: 900;
          color: var(--ink);
        }

        .card-error {
          background: #ffe6e6;
          color: #b00020;
          border: 1px solid #ffbcbc;
          padding: 8px 10px;
          border-radius: 8px;
          margin-bottom: 10px;
          font-size: 0.9rem;
        }

        .field {
          margin-bottom: 12px;
        }

        .field label {
          display: block;
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--ink);
        }

        .field input {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(15, 118, 110, 0.3);
          outline: none;
          font-size: 0.95rem;
        }

        .field input:focus {
          border-color: var(--g2);
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
        }

        .pwd-wrap {
          position: relative;
        }

        .pwd-toggle {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          opacity: 0.85;
        }

        .login-card.rtl .pwd-toggle {
          right: auto;
          left: 8px;
        }

        .pwd-toggle:hover {
          opacity: 1;
        }

        .submit {
          margin-top: 14px;
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: none;
          color: #fff;
          font-weight: 900;
          letter-spacing: 0.2px;
          cursor: pointer;
          background: linear-gradient(
            135deg,
            var(--gA),
            var(--g1) 25%,
            var(--g2) 60%
          );
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.22);
          transition: transform 0.12s ease, box-shadow 0.12s ease,
            filter 0.12s ease;
        }

        .submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 16px 38px rgba(0, 0, 0, 0.25);
          filter: brightness(1.02);
        }

        .submit:disabled {
          opacity: 0.7;
          cursor: default;
        }

        .note {
          font-size: 0.78rem;
          color: rgba(0, 0, 0, 0.7);
          margin-top: 10px;
        }

        .login-note {
          text-align: center;
        }

        .policy-link {
          font-weight: 600;
          text-decoration: underline;
          cursor: pointer;
        }

        @keyframes heroIn {
          from {
            opacity: 0;
            transform: translateY(-16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 560px) {
          .login-hero-inner {
            min-height: 96px;
          }

          .brand-title {
            font-size: 1.4rem;
          }

          /* 👈 التعديل المهم: إزالة المارجن الجانبي الذي سبب قصّ الفورم */
          .login-card {
            margin: 12px auto 28px;
          }
        }
      `}</style>
    </>
  );
}
