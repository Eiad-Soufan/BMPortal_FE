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
    if (loading) return;
    setErr('');
    setLoading(true);
    try {
      // 1) Token
      let res = await axios.post('/api/token/', { username, password });
      const { access, refresh } = res.data || {};
      if (!access) throw new Error('No access token');
      localStorage.setItem('access', access);
      if (refresh) localStorage.setItem('refresh', refresh);

      // 2) Current user
      const ures = await axios.get('/api/current-user/', {
        headers: { Authorization: `Bearer ${access}` }
      });
      const u = ures.data || {};
      const role = (u.role || u.userRole || 'employee').toLowerCase();
      const uid = u.id;
      const uname = u.username || username;

      localStorage.setItem('userRole', role);
      if (uid !== undefined) localStorage.setItem('userId', uid);
      localStorage.setItem('username', uname);

      navigate('/dashboard');
    } catch (e1) {
      setErr(t('login.error', { defaultValue: 'Invalid username or password.' }));
    } finally {
      setLoading(false);
    }
  };

  // ====== Content from your image (NO icons) ======
  const blocksEn = [
    {
      title: 'Vision',
      text:
        'At Berkat Madinah we aspire to open 6 major branches in Malaysia, establish 3 international sales offices, and expand our products to over 10,000 retail points worldwide by the year 2030.'
    },
    {
      title: 'Purpose',
      text:
        'Our goal is to provide high-quality Arab food products in every city around the world, bringing the authentic flavors of Arabia to all those who cherish tradition and originality.'
    },
    {
      title: 'Mission',
      text:
        'At Berkat Madinah, we take pride in providing authentic and diverse Arab food products of the highest quality, meeting the expectations of Southeast Asia’s population as well as the Islamic world.'
    }
  ];

  // ترجمة عربية جميلة وواضحة (إذا بدك نفس صياغة معيّنة قلّي وعدّلها حرفيًا)
  const blocksAr = [
    {
      title: 'الرؤية',
      text:
        'نطمح في بركة المدينة إلى افتتاح 6 فروع رئيسية في ماليزيا، وإنشاء 3 مكاتب مبيعات دولية، وتوسيع انتشار منتجاتنا لتصل إلى أكثر من 10,000 نقطة بيع حول العالم بحلول عام 2030.'
    },
    {
      title: 'الغاية',
      text:
        'هدفنا تقديم منتجات غذائية عربية عالية الجودة في كل مدينة حول العالم، ونقل النكهات العربية الأصيلة لكل من يقدّر التقاليد والأصالة.'
    },
    {
      title: 'الرسالة',
      text:
        'نفخر في بركة المدينة بتقديم منتجات غذائية عربية أصيلة ومتنوعة بأعلى مستويات الجودة، لتلبية توقعات سكان جنوب شرق آسيا وكذلك العالم الإسلامي.'
    }
  ];

  return (
    <>
      <div className="login-page">
        <div className="login-bg" />

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
                    defaultValue: 'Internal portal for forms, approvals & communications'
                  })}
                </p>
              </div>
            </div>

            <div className="lang-switch">
              <button
                className={`lang-btn ${isAR ? 'active' : ''}`}
                onClick={() => changeLang('ar')}
                type="button"
              >
                AR
              </button>
              <span className="lang-sep">|</span>
              <button
                className={`lang-btn ${!isAR ? 'active' : ''}`}
                onClick={() => changeLang('en')}
                type="button"
              >
                EN
              </button>
            </div>
          </div>
        </section>

        <section className="login-content">
          <div className="login-layout">
            {/* Login Card */}
            <form className={`login-card ${isAR ? 'rtl' : ''}`} onSubmit={handleSubmit}>
              <h2 className="card-title">{t('login.signin', { defaultValue: 'Sign in' })}</h2>

              {err && <div className="card-error">{err}</div>}

              <div className="field">
                <label>{t('login.username', { defaultValue: 'Username' })}</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('login.username_ph', { defaultValue: 'Enter your username' })}
                  required
                  autoFocus
                />
              </div>

              <div className="field">
                <label>{t('login.password', { defaultValue: 'Password' })}</label>
                <div className="pwd-wrap">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('login.password_ph', { defaultValue: 'Enter your password' })}
                    required
                  />
                  <button
                    type="button"
                    className="pwd-toggle"
                    onClick={() => setShowPwd(!showPwd)}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button className="submit" type="submit" disabled={loading}>
                {loading
                  ? t('login.loading', { defaultValue: 'Signing in…' })
                  : t('login.signin', { defaultValue: 'Sign in' })}
              </button>

              <p className="policy-note">
                {t('login.policy_note', {
                  defaultValue: 'بتسجيل دخولك، فإنك تقر بأنك اطلعت على سياسات الشركة والتزمت بها.'
                })}{' '}
                <a href="/policies" className="policy-link">
                  {t('login.policy_link', { defaultValue: 'عرض سياسات الشركة' })}
                </a>
              </p>
            </form>

            {/* Vision / Purpose / Mission (NO icons) */}
            <aside className="vp-panel" aria-label="Vision Purpose Mission">
              <div className="vp-head">
                <div className="vp-kicker">
                  <span className="vp-dot" />
                  <span className="vp-title">Vision • Purpose • Mission</span>
                </div>
                <div className="vp-sub">
                  Balanced bilingual summary in a clean, brand-consistent style.
                </div>
              </div>

              <div className="vp-grid">
                {/* EN (left) */}
                <div className="vp-col en">
                  <div className="vp-colLabel">EN</div>

                  {blocksEn.map((b, idx) => (
                    <section className="vp-card" key={`en-${idx}`}>
                      <h3 className="vp-h">{b.title}:</h3>
                      <p className="vp-p">{b.text}</p>
                    </section>
                  ))}
                </div>

                {/* AR (right) */}
                <div className="vp-col ar" dir="rtl">
                  <div className="vp-colLabel">AR</div>

                  {blocksAr.map((b, idx) => (
                    <section className="vp-card" key={`ar-${idx}`}>
                      <h3 className="vp-h">{b.title}:</h3>
                      <p className="vp-p">{b.text}</p>
                    </section>
                  ))}
                </div>
              </div>

              <div className="vp-foot">
                <span className="vp-footText">
                  {t('login.vpm.footer', {
                    defaultValue: 'All statements are part of the company identity and internal brand direction.'
                  })}
                </span>
              </div>
            </aside>
          </div>
        </section>
      </div>

      <style>{`
        :root{
          --gA:#22c55e;
          --g1:#009447;
          --g2:#007a39;
          --g3:#00602c;
          --g4:#004a22;
          --ink:#00602c;

          --white:#fff;
          --radius:16px;
        }

        .login-page{
          position:relative;
          min-height:100vh;
          direction:ltr;
          overflow:hidden;
          background:#eef6f2;
        }

        .login-bg{
          position:absolute; inset:0; z-index:0;
          background:
            radial-gradient(1400px 260px at 16% -60%, rgba(255,255,255,.28), transparent 60%),
            radial-gradient(900px 200px at 100% 0%, rgba(255,255,255,.12), transparent 60%),
            linear-gradient(135deg, var(--gA) 0%, var(--g1) 18%, var(--g2) 48%, var(--g3) 78%, var(--g4) 100%);
          filter:saturate(120%) contrast(105%);
          opacity:.98;
        }

        /* Hero */
        .login-hero{
          position:relative; z-index:1;
          padding:16px;
          animation:heroIn .8s ease both;
        }
        .login-hero-inner{
          max-width:1080px;
          margin:0 auto;
          min-height:110px;
          display:flex; align-items:center; justify-content:space-between;
        }
        .brand{ display:flex; align-items:center; gap:12px; }

        .brand-logo{
          width:80px;
          height:80px;
          border-radius:20px;
          background:rgba(255,255,255,.96);
          display:grid;
          place-items:center;
          backdrop-filter:blur(10px) saturate(130%);
          -webkit-backdrop-filter:blur(10px) saturate(130%);
          box-shadow:0 14px 32px rgba(0,0,0,.25);
          border:1px solid rgba(255,255,255,.9);
          overflow:hidden;
        }
        .brand-logo img{
          width:100%;
          height:100%;
          object-fit:contain;
          display:block;
        }

        .brand-title{
          margin:0; color:#fff; font-weight:900; font-size:1.6rem;
          text-shadow:0 1px 0 rgba(0,0,0,.12);
        }
        .brand-sub{
          margin:4px 0 0; color:#f2fffa; opacity:.95;
        }

        /* Language */
        .lang-switch{
          display:flex; align-items:center; gap:8px;
          background:rgba(255,255,255,.16);
          padding:6px 8px; border-radius:12px;
        }
        .lang-btn{
          border:none; background:transparent; color:#f0fff4;
          font-weight:900; padding:4px 8px; border-radius:8px; cursor:pointer;
        }
        .lang-btn.active{ background:rgba(255,255,255,.3); }
        .lang-sep{ color:rgba(255,255,255,.7); font-weight:800; }

        /* Content layout */
        .login-content{ position:relative; z-index:2; padding: 0 16px 28px; }
        .login-layout{
          max-width:1080px;
          margin: 0 auto;
          display:grid;
          grid-template-columns: 520px 1fr;
          gap: 16px;
          align-items:start;
        }

        /* Card */
        .login-card{
          width:100%;
          padding:22px 18px;
          background:rgba(255,255,255,.18);
          border:1px solid rgba(255,255,255,.45);
          border-radius:var(--radius);
          box-shadow:0 16px 40px rgba(0,0,0,.2);
          backdrop-filter:blur(12px) saturate(135%);
          -webkit-backdrop-filter:blur(12px) saturate(135%);
          animation:fadeInUp .8s ease both;
        }
        .login-card.rtl{
          direction:rtl;
          text-align:right;
        }
        .card-title{
          margin:0 0 12px;
          font-weight:900; color:var(--ink);
        }
        .card-error{
          background:#ffe6e6; color:#b00020;
          border:1px solid #ffbcbc;
          border-radius:10px; padding:10px 12px;
          margin-bottom:10px; font-weight:700;
        }

        .field{
          display:flex; flex-direction:column;
          gap:6px; margin-top:10px;
        }
        .field label{
          font-weight:800; color:var(--ink);
        }
        .field input{
          border-radius:12px;
          border:1px solid rgba(10,111,71,.28);
          padding:10px 12px;
          font-weight:600;
          outline:none;
          transition:box-shadow .15s ease, border-color .15s ease;
          background:#fff;
        }
        .field input:focus{
          border-color:var(--g2);
          box-shadow:0 0 0 2px rgba(0,148,71,.18);
        }

        .pwd-wrap{ position:relative; }
        .pwd-wrap input{ padding-right:36px; }
        .login-card.rtl .pwd-wrap input{
          padding-right:12px; padding-left:36px; text-align:right;
        }

        .pwd-toggle{
          position:absolute; right:8px; top:50%;
          transform:translateY(-50%);
          border:none; background:transparent;
          font-size:18px; line-height:1; cursor:pointer; opacity:.85;
        }
        .login-card.rtl .pwd-toggle{ right:auto; left:8px; }
        .pwd-toggle:hover{ opacity:1; }

        .submit{
          margin-top:16px;
          width:100%;
          padding:12px 14px;
          border-radius:12px;
          border:none;
          color:#fff;
          font-weight:900; letter-spacing:.2px;
          cursor:pointer;
          background:linear-gradient(135deg,var(--gA),var(--g1) 25%,var(--g2) 60%);
          box-shadow:0 10px 26px rgba(0,0,0,.22);
          transition:transform .12s ease, box-shadow .12s ease, filter .12s ease;
        }
        .submit:hover{
          transform:translateY(-1px);
          box-shadow:0 14px 32px rgba(0,0,0,.24);
          filter:saturate(112%);
        }
        .submit:disabled{ opacity:.7; cursor:not-allowed; }

        .policy-note{
          margin-top:10px;
          font-size:0.8rem;
          color:rgba(0,0,0,.7);
          text-align:center;
        }
        .policy-link{ font-weight:600; text-decoration:underline; cursor:pointer; }

        /* ===== VPM Panel (NO icons) ===== */
        .vp-panel{
          padding:18px 16px;
          border-radius: var(--radius);
          background: rgba(255,255,255,.14);
          border: 1px solid rgba(255,255,255,.38);
          box-shadow: 0 16px 40px rgba(0,0,0,.18);
          backdrop-filter: blur(12px) saturate(135%);
          -webkit-backdrop-filter: blur(12px) saturate(135%);
          animation: fadeInUp .9s ease both;
          overflow:hidden;
          position:relative;
        }
        .vp-panel:before{
          content:"";
          position:absolute; inset:-40px;
          background:
            radial-gradient(520px 200px at 0% 0%, rgba(255,255,255,.20), transparent 60%),
            radial-gradient(520px 220px at 100% 0%, rgba(34,197,94,.13), transparent 60%);
          pointer-events:none;
        }

        .vp-head{ position:relative; z-index:1; margin-bottom:12px; }
        .vp-kicker{
          display:inline-flex; align-items:center; gap:10px;
          padding:8px 10px;
          border-radius:12px;
          background: rgba(255,255,255,.18);
          border:1px solid rgba(255,255,255,.28);
        }
        .vp-dot{
          width:10px; height:10px; border-radius:50%;
          background: linear-gradient(135deg,var(--gA),var(--g1));
          box-shadow: 0 0 0 3px rgba(0,148,71,.12);
        }
        .vp-title{
          font-weight:900;
          color: rgba(0,0,0,.78);
          letter-spacing:.2px;
        }
        .vp-sub{
          margin-top:8px;
          color: rgba(0,0,0,.70);
          font-weight:600;
          line-height:1.45;
        }

        .vp-grid{
          position:relative; z-index:1;
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 12px;
        }

        .vp-col{
          border-radius:14px;
          padding:12px;
          background: rgba(255,255,255,.18);
          border:1px solid rgba(255,255,255,.28);
          transition: transform .12s ease, filter .12s ease;
        }
        .vp-col:hover{ transform: translateY(-1px); filter: saturate(110%); }

        .vp-col.en{ text-align:left; }
        .vp-col.ar{ text-align:right; }

        .vp-colLabel{
          display:inline-flex;
          align-items:center;
          gap:8px;
          font-weight:900;
          color: var(--ink);
          margin-bottom:10px;
        }
        .vp-colLabel:after{
          content:"";
          height:1px;
          width:56px;
          background: rgba(0,96,44,.25);
          display:inline-block;
          margin-left:8px;
        }
        .vp-col.ar .vp-colLabel:after{
          margin-left:0;
          margin-right:8px;
        }

        .vp-card{
          padding:12px 0;
        }
        .vp-card + .vp-card{
          border-top:1px solid rgba(0,0,0,.08);
        }
        .vp-h{
          margin:0 0 6px;
          font-weight: 950;
          color: rgba(0,0,0,.78);
          font-size: 1.06rem;
          letter-spacing:.1px;
        }
        .vp-p{
          margin:0;
          color: rgba(0,0,0,.68);
          font-weight:650;
          line-height:1.55;
          font-size: .96rem;
        }

        .vp-foot{
          position:relative; z-index:1;
          margin-top:12px;
          padding-top:12px;
          border-top: 1px solid rgba(255,255,255,.28);
          color: rgba(0,0,0,.70);
          font-weight:700;
          font-size: .88rem;
        }

        /* Animations */
        @keyframes fadeInUp{
          from{ opacity:0; transform:translateY(18px) scale(.985); }
          to{ opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes heroIn{
          from{ opacity:0; transform:translateY(-8px); }
          to{ opacity:1; transform:translateY(0); }
        }

        /* Responsive */
        @media (max-width: 980px){
          .login-layout{
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .login-card{ max-width: 520px; margin: 12px auto 0; }
          .vp-panel{ max-width: 520px; margin: 0 auto; }
          .vp-grid{ grid-template-columns: 1fr; }
        }

        @media (max-width:560px){
          .login-hero-inner{
            min-height:96px;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            text-align:center;
            gap:10px;
          }
          .brand{ justify-content:center; }
          .brand-title{ font-size:1.4rem; }
          .brand-sub{ font-size:0.9rem; }
          .login-content{ padding: 0 12px 22px; }
        }
      `}</style>
    </>
  );
}
