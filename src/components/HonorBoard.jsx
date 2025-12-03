// src/components/HonorBoard.jsx
import { jwtDecode } from 'jwt-decode';
import { useEffect, useMemo, useRef, useState } from 'react';
import axios, { API_BASE_URL } from '../api/axios';

// تحويل المسار النسبي لمسار كامل بناءً على الـ API_BASE_URL
function absMedia(url) {
  if (!url) return null;
  if (/^(https?:)?\/\//i.test(url) || /^data:/i.test(url)) return url;

  const origin = API_BASE_URL.replace(/\/$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

function CrownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3.5 7.5 7 11l3-7 3 7 3.5-3.5L21 12l-2 7H5L3 12l.5-4.5Z"
        fill="#f4b41a"
        stroke="#c98a00"
        strokeWidth="1"
      />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 4h10v3a5 5 0 0 1-4 4.9V14h2v2H9v-2h2v-2.1A5 5 0 0 1 7 7V4Zm-2 1h2v3a3 3 0 0 1-3 3H3V7a2 2 0 0 1 2-2Zm14 0h-2v3a3 3 0 0 0 3 3h1V7a2 2 0 0 0-2-2Z"
        fill="#9fa8da"
      />
    </svg>
  );
}

function Featured({ title, list, accent }) {
  const featured = list?.[0] || null;
  const others = (list || []).slice(1);

  const mainName = featured
    ? featured.full_name || featured.username || ''
    : '';

  return (
    <div className="hb-card" style={{ borderColor: accent }}>
      <div className="hb-card__head" style={{ color: accent }}>
        <span className="hb-icon">
          {title === 'الشهر' ? <CrownIcon /> : <TrophyIcon />}
        </span>
        <strong>موظف {title}</strong>
      </div>

      {featured ? (
        <div className="hb-main">
          <div className="hb-avatar">
            {featured.avatar ? (
              <img
                src={absMedia(featured.avatar)}
                alt={mainName || 'avatar'}
              />
            ) : (
              <span>{(mainName || '?').charAt(0)}</span>
            )}
          </div>
          <div className="hb-name">{mainName || '؟'}</div>

          {others.length > 0 && (
            <div className="hb-others" aria-label="مرشحون آخرون">
              {others.map((u) => {
                const name = u.full_name || u.username || '';
                return (
                  <div
                    key={u.id || name}
                    className="hb-chip"
                    title={name}
                  >
                    {u.avatar ? (
                      <img
                        src={absMedia(u.avatar)}
                        alt={name || 'avatar'}
                      />
                    ) : (
                      <span>{(name || '?').charAt(0)}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="hb-empty">لا يوجد مرشح بعد.</div>
      )}
    </div>
  );
}

export default function HonorBoard({ mount = 'header' }) {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(true);
  const fetchingRef = useRef(false);
  const attemptsRef = useRef(0);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access') : '';

  const userId = useMemo(() => {
    if (!token) return 'guest';
    try {
      const decoded = jwtDecode(token);
      return decoded.user_id || decoded.id || 'user';
    } catch {
      return 'user';
    }
  }, [token]);

  const closeKey = useMemo(() => `hb_closed_${userId}`, [userId]);

  const enabledMonth = !!data?.enabled_month;
  const enabledYear = !!data?.enabled_year;

  const month = useMemo(
    () => (Array.isArray(data?.month) ? data.month : []),
    [data]
  );
  const year = useMemo(
    () => (Array.isArray(data?.year) ? data.year : []),
    [data]
  );

  const fetchData = async (forceOpen = false) => {
    if (!token) return;
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const currentToken = localStorage.getItem('access') || '';
      const res = await axios.get('/api/honorboard/', {
        headers: currentToken
          ? { Authorization: `Bearer ${currentToken}` }
          : {},
      });
      setData(res.data);

      if (
        forceOpen &&
        (res.data?.enabled_month || res.data?.enabled_year)
      ) {
        if (sessionStorage.getItem(closeKey) !== '1') {
          setOpen(true);
        }
      }

      attemptsRef.current = 99;
    } catch (e) {
      attemptsRef.current += 1;
      if (attemptsRef.current < 3) {
        setTimeout(() => {
          fetchingRef.current = false;
          fetchData(forceOpen);
        }, 1500);
      }
    } finally {
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, closeKey]);

  useEffect(() => {
    const onFocus = () => {
      attemptsRef.current = 0;
      fetchData(true);
    };
    const onToggle = () => {
      attemptsRef.current = 0;
      fetchData(true);
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('honorboard:toggle', onToggle);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('honorboard:toggle', onToggle);
    };
  }, []);

  if (!data || (!enabledMonth && !enabledYear) || !open) return null;

  return (
    <div
      className={mount === 'header' ? 'hb-wrap hb-wrap--header' : 'hb-wrap'}
      style={{
        position: mount === 'header' ? 'fixed' : 'relative',
        right: mount === 'header' ? 16 : 'auto',
        zIndex: 1100,
      }}
      role="dialog"
      aria-label="لوحة الشرف"
    >
      <div className="hb-panel">
        <button
          className="hb-close"
          onClick={() => {
            setOpen(false);
            sessionStorage.setItem(closeKey, '1');
          }}
          aria-label="إغلاق"
        >
          ×
        </button>
        <div className="hb-title">لوحة الشرف</div>

        <div className="hb-grid">
          {enabledMonth && (
            <Featured title="الشهر" list={month} accent="#ffd54f" />
          )}
          {enabledYear && (
            <Featured title="السنة" list={year} accent="#9fa8da" />
          )}
        </div>
      </div>

      {/* CSS خاص بلوحة الشرف + الرسبونسيف */}
      <style>{`
        .hb-wrap{ max-width: 300px; width: 75vw; }
        .hb-wrap--header{ top: 76px; }
        @media (max-width: 768px){
          .hb-wrap--header{
            top: 118px;
            right: 8px;
            width: calc(100vw - 24px);
            max-width: 360px;
          }
        }

        .hb-panel{
          position: relative;
          background: linear-gradient(180deg, #ffffffee, #fdfdfde8);
          border: 2px solid #e6c36c;
          border-radius: 14px;
          box-shadow: 0 8px 22px rgba(0,0,0,.18);
          backdrop-filter: blur(6px);
          padding: 8px 10px;
          animation: hbIn .35s ease both;
        }
        @keyframes hbIn { from{ opacity:0; transform: translateY(-6px)} to{opacity:1; transform:none} }

        .hb-close{
          position:absolute; top:6px; right:6px;
          width:22px; height:22px; border-radius:999px;
          border:1px solid rgba(0,0,0,.1); background:#fff; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          font-weight:700; font-size:14px; line-height:1;
          box-shadow:0 2px 6px rgba(0,0,0,.16);
        }

        .hb-title{
          text-align:center; margin:2px 0 10px; font-weight:800;
          color:#b48a15; background:#fff7da; padding:4px 10px; border-radius:999px;
          font-size:13px;
        }

        .hb-grid{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        @media (max-width: 640px){
          .hb-grid{
            grid-template-columns: 1fr;
          }
        }

        .hb-card{
          border-radius:10px;
          border:1px solid rgba(0,0,0,.05);
          background:#fff;
          box-shadow:0 3px 10px rgba(0,0,0,.08);
          padding:6px;
        }
        .hb-card__head{
          display:flex;
          align-items:center;
          gap:6px;
          font-size:12px;
          margin-bottom:4px;
        }
        .hb-icon{
          width:22px; height:22px; border-radius:999px;
          display:grid; place-items:center;
          background:#fff7da;
        }

        .hb-main{
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          padding-bottom:4px;
        }

        .hb-empty{
          font-size:12px;
          color:#4b5563;
          text-align:center;
          padding:4px 0 2px;
        }

        .hb-avatar{
          width:58px; height:58px; border-radius:999px;
          display:grid; place-items:center;
          background:#fef6dd;
          overflow:hidden;
          box-shadow: 0 5px 12px rgba(0,0,0,.14);
          border:2px solid #e6c36c;
        }
        .hb-avatar img{
          width:100%; height:100%; object-fit:cover; display:block;
        }

        .hb-name{
          margin-top:4px;
          font-weight:800;
          text-align:center;
          color:#111827;
          font-size:12px;
        }

        .hb-others{
          display:flex;
          gap:4px;
          margin-top:4px;
          flex-wrap:wrap;
          justify-content:center;
        }
        .hb-chip{
          width:18px; height:18px; border-radius:999px;
          display:grid; place-items:center;
          font-size:10px;
          background:#fffef6;
          box-shadow:0 1px 3px rgba(0,0,0,.12);
          border:1px solid #e6c36c;
        }
        .hb-chip img{
          width:100%; height:100%; object-fit: cover; display:block;
        }
      `}</style>
    </div>
  );
}
