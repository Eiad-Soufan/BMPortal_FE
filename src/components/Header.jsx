// src/components/Header.jsx
import { jwtDecode } from 'jwt-decode';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import logo2 from '../assets/logo2.png';
import HonorBoard from './HonorBoard';
import NavTabs from './NavTabs';
import NotificationButton from './NotificationButton';

export default function Header() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  // Glass on scroll
  const [isScrolled, setIsScrolled] = useState(false);

  // Profile dropdown
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const avatarBtnRef = useRef(null);

  const switchTo = (lng) => {
    i18n.changeLanguage(lng);
  };

  // ===== معلومات المستخدم من JWT / localStorage =====
  const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
  const claims = useMemo(() => {
    if (!token) return null;
    try { return jwtDecode(token); } catch { return null; }
  }, [token]);

  const baseURL = (api?.defaults?.baseURL || '').replace(/\/+$/, '');

  // الاسم الأول والثاني
  const firstName =
    (typeof window !== 'undefined' && (localStorage.getItem('first_name') || localStorage.getItem('firstName'))) ||
    (claims?.first_name || claims?.firstName) ||
    '';
  const lastName =
    (typeof window !== 'undefined' && (localStorage.getItem('last_name') || localStorage.getItem('lastName'))) ||
    (claims?.last_name || claims?.lastName) ||
    '';

  // إن لم يتوفّر الاسم الأول/الثاني نستخدم اسم المستخدم
  const username =
    (typeof window !== 'undefined' && (localStorage.getItem('username') || localStorage.getItem('userName'))) ||
    claims?.username ||
    '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || username || 'User';
  const initial = fullName.trim().charAt(0).toUpperCase() || 'U';

  // الصورة: من JWT أو localStorage (مسار نسبي -> نحوله مطلق)
  const avatarPathFromJWT = claims?.avatar || claims?.avatar_url || claims?.avatarUrl || '';
  const avatarPathFromLS = (typeof window !== 'undefined' && (localStorage.getItem('avatar') || localStorage.getItem('avatarUrl'))) || '';
  const rawAvatar = avatarPathFromJWT || avatarPathFromLS || '';
  const avatarUrl = rawAvatar
    ? (/^https?:\/\//i.test(rawAvatar) ? rawAvatar : `${baseURL}${rawAvatar.startsWith('/') ? '' : '/'}${rawAvatar}`)
    : '';

  // الدور للـHR
  let isHR = false;
  try {
    isHR = (claims?.role || '').toLowerCase() === 'hr';
  } catch {
    isHR = false;
  }

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuOpen) return;
      const target = e.target;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        avatarBtnRef.current &&
        !avatarBtnRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [menuOpen]);

  const logout = () => {
    try {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
    } finally {
      navigate('/login');
    }
  };

  return (
    <div className={`app-navbar py-2 ${isScrolled ? 'scrolled' : ''}`} style={{ position: 'sticky', top: 0, zIndex: 100, direction: 'ltr' }}>
      <style>{`
        /* لوحة ألوان */
        .app-navbar{
          --c1:#0f5132; --c2:#1b4332; --c3:#0b2e13;
          --emerald:#0ea76a;
        }
        .app-navbar{
          background:
            linear-gradient(
              180deg,
              color-mix(in oklab, var(--c1) 18%, transparent) 0%,
              color-mix(in oklab, var(--c2) 12%, transparent) 55%,
              color-mix(in oklab, var(--c3) 6%, transparent) 100%
            );
          border-bottom: 1px solid rgba(255,255,255,0.14);
          transition: background .25s ease, border-color .25s ease, box-shadow .25s ease,
                      backdrop-filter .25s ease, -webkit-backdrop-filter .25s ease;
        }
        .app-navbar.scrolled{
          background:
            linear-gradient(
              180deg,
              color-mix(in oklab, var(--c1) 40%, rgba(255,255,255,0)) 0%,
              color-mix(in oklab, var(--c2) 30%, rgba(255,255,255,0)) 70%,
              color-mix(in oklab, var(--c3) 20%, rgba(255,255,255,0)) 100%
            );
          backdrop-filter: blur(10px) saturate(110%);
          -webkit-backdrop-filter: blur(10px) saturate(110%);
          border-bottom: 1px solid rgba(255,255,255,0.2);
          box-shadow: 0 10px 28px rgba(0,0,0,0.18);
        }

        /* الشعار */
        .app-navbar .app-logo{
          height: 40px !important; width: auto !important; max-height: 40px !important; max-width: 190px !important;
          object-fit: contain !important; display: inline-block; vertical-align: middle; border-radius: 10px;
        }
        @media (max-width: 576px){
          .app-navbar .app-logo{ height: 44px !important; max-height: 44px !important; }
        }

        /* محول اللغة */
        .app-navbar .lang-switch{
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 10px; border-radius: 999px;
          border: 1.5px solid color-mix(in oklab, var(--emerald) 65%, #ffffff 35%);
          background: rgba(255,255,255,0.92);
          color: #0b2e13;
          box-shadow: 0 6px 16px rgba(0,0,0,.10);
        }
        .app-navbar .lang-switch .lang-btn{
          border: 0; background: transparent; padding: 0 6px;
          font-weight: 700; color: #0b2e13; cursor: pointer;
          transition: transform .12s ease, color .12s ease, opacity .12s ease;
        }
        .app-navbar .lang-switch .lang-btn:hover{ transform: translateY(-1px); color: var(--emerald); }
        .app-navbar .lang-switch .sep{ opacity: .4; }

        /* زر الإشعار */
        .app-navbar .notif-wrapper :where(button){
          box-shadow: 0 6px 18px rgba(0,0,0,.16), inset 0 0 0 1px rgba(255,255,255,.35);
        }

        /* زر البروفايل الجديد (حبة كابسول + صورة + اسم) */
        .app-navbar .profile-pill{
          display:flex; align-items:center; gap:10px;
          padding: 4px 8px 4px 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,.45);
          background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.86));
          box-shadow: 0 6px 18px rgba(0,0,0,.16), inset 0 0 0 1px rgba(255,255,255,.35);
          transition: transform .12s ease, filter .2s ease;
          min-height: 44px;
        }
        .app-navbar .profile-pill:hover{ transform: translateY(-1px); filter: saturate(1.03); }
        .app-navbar .avatar-img{
          width: 36px; height: 36px; border-radius: 50%; object-fit: cover;
          display:block; box-shadow: 0 0 0 2px #fff, 0 6px 12px rgba(0,0,0,.12);
          background: #e8f5ee;
        }
        .app-navbar .avatar-fallback{
          width: 36px; height: 36px; border-radius: 50%;
          display:flex; align-items:center; justify-content:center;
          font-weight: 800; color:#0b2e13;
          background: radial-gradient(100% 100% at 70% 0%, #c4f7d4 0%, #8fd3a9 100%);
          box-shadow: 0 0 0 2px #fff, 0 6px 12px rgba(0,0,0,.12);
        }
        .app-navbar .avatar-name{
          display:flex; flex-direction:column; line-height:1.1; text-align:left;
          color:#0b2e13; margin-inline-end:4px;
        }
        .app-navbar .avatar-name .n1{ font-weight:800; font-size:14px; white-space:nowrap; max-width:140px; overflow:hidden; text-overflow:ellipsis; }
        .app-navbar .avatar-name .n2{ font-size:11px; opacity:.65; white-space:nowrap; }

        /* القائمة المنسدلة */
        .app-navbar .menu{
          position: absolute; right: 0; left: auto; top: calc(100% + 10px);
          width: min(260px, calc(100vw - 24px)); border-radius: 16px; padding: 12px;
          border: 1px solid rgba(255,255,255,.18);
          background: rgba(255,255,255,.96);
          backdrop-filter: blur(12px) saturate(110%);
          -webkit-backdrop-filter: blur(12px) saturate(110%);
          box-shadow: 0 16px 40px rgba(0,0,0,.22);
          animation: fadeIn .14s ease both;
          z-index: 2100;
        }
        .app-navbar .menu .head{
          display:flex; align-items:center; gap:10px; padding:8px 10px 12px 10px;
        }
        .app-navbar .menu .head .h-name{ font-weight:800; color:#0b2e13; }
        .app-navbar .menu .item{
          display:flex; align-items:center; gap:10px;
          padding:10px 12px; border-radius:12px;
          color:#0b2e13; text-decoration:none; cursor:pointer;
          transition: background .12s ease, transform .12s ease;
        }
        .app-navbar .menu .item:hover{
          background: rgba(15,81,50,.08);
          transform: translateX(-1px);
        }
        .app-navbar .menu .divider{ height:1px; background: rgba(0,0,0,.08); margin:6px 4px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px) } to { opacity: 1; transform: translateY(0) } }

        @media (max-width: 576px){
          .app-navbar .avatar-name{ display:none; } /* على الموبايل نكتفي بالدائرة */
        }
      `}</style>

      <div className="container">
        <div className="row g-2 align-items-center">
          {/* الشعار */}
          <div className="col-auto d-flex align-items-center">
            <img src={logo2} alt="logo" className="app-logo" />
          </div>

          {/* التبويبات (وسط) */}
          <div className="col d-none d-md-flex justify-content-center">
            <NavTabs />
          </div>

          {/* يمين: اللغات + الإشعارات + بروفايل */}
          <div className="col-auto d-flex align-items-center gap-2">
            <div className="lang-switch">
              <button className="lang-btn" onClick={() => switchTo('ar')}>AR</button>
              <span className="sep">|</span>
              <button className="lang-btn" onClick={() => switchTo('en')}>EN</button>
            </div>

            <div className="notif-wrapper">
              <NotificationButton />
              {isHR && (
                <Link to="/hr/points" className="btn btn-sm btn-outline-light ms-2 d-none d-md-inline-flex align-items-center">
                  إدارة النقاط
                </Link>
              )}
            </div>

            {/* زر البروفايل */}
            <div className="position-relative">
              <button
                ref={avatarBtnRef}
                className="profile-pill"
                title={t('profile') || 'Profile'}
                onClick={() => setMenuOpen((v) => !v)}
                type="button"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="avatar-img" />
                ) : (
                  <span className="avatar-fallback" aria-hidden>{initial}</span>
                )}
                <span className="avatar-name">
                  <span className="n1">{fullName}</span>
                  <span className="n2">{(claims?.role || '').toUpperCase() || 'USER'}</span>
                </span>
              </button>

              {menuOpen && (
                <div ref={menuRef} className="menu">
                  <div className="head">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" className="avatar-img" style={{ width: 42, height: 42 }} />
                    ) : (
                      <span className="avatar-fallback" style={{ width: 42, height: 42 }}>{initial}</span>
                    )}
                    <div>
                      <div className="h-name">{fullName}</div>
                      <div style={{ fontSize: 12, opacity: .6 }}>{(claims?.role || 'User')}</div>
                    </div>
                  </div>

                  <div className="divider" />

                  <div className="item" onClick={() => { setMenuOpen(false); navigate('/profile'); }}>
                    <span>👤</span>
                    <div style={{ fontWeight: 700 }}>{t('my_profile') || 'My Profile'}</div>
                  </div>

                  <div className="item" onClick={logout}>
                    <span>🚪</span>
                    <div style={{ fontWeight: 700 }}>{t('logout') || 'Logout'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* موبايل: التبويبات تحت الهيدر */}
        <div className="d-block d-md-none mt-2">
          <NavTabs />
          {isHR && (
            <div className="mt-2">
              <Link to="/hr/points" className="btn btn-success w-100">
                إدارة النقاط
              </Link>
            </div>
          )}
        </div>

        <HonorBoard mount="header" />
      </div>
    </div>
  );
}


