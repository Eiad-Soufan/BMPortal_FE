// src/components/HonorBoard.jsx
import { jwtDecode } from 'jwt-decode';
import { useEffect, useMemo, useRef, useState } from 'react';
import axios from '../api/axios';

import { API_BASE_URL } from '../api/axios';

function absMedia(url) {
    if (!url) return null;
    if (/^(https?:)?\/\//i.test(url) || /^data:/i.test(url)) return url;

    const origin = API_BASE_URL.replace(/\/$/, '');
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}


// استخرج معلومات الجلسة الحالية من التوكن
function getSessionKeyParts() {
    try {
        const token = localStorage.getItem('access') || '';
        if (!token) return { uid: 'anon', iat: '0' };
        const d = jwtDecode(token);
        const uid = d?.user_id ?? d?.id ?? 'anon';
        const iat = d?.iat ? String(d.iat) : '0';
        return { uid, iat };
    } catch {
        return { uid: 'anon', iat: '0' };
    }
}
function makeCloseKey({ uid, iat }) {
    return `hb_closed_${uid}_${iat}`;
}

function CrownIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 7l4 4 5-7 5 7 4-4v10H3V7z" fill="currentColor" />
        </svg>
    );
}

function TrophyIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17 3H7v4H4v3a5 5 0 004 4.9V17H6v2h12v-2h-2v-2.1A5 5 0 0020 10V7h-3V3zM6 10V9h1V7h2v4a3 3 0 01-3-1zM18 10a3 3 0 01-3 1V7h2v2h1v1z" fill="currentColor" />
        </svg>
    );
}

function Featured({ title, list, accent }) {
    const featured = list?.[0] || null;
    const others = (list || []).slice(1);

    return (
        <div className="hb-card" style={{ borderColor: accent }}>
            <div className="hb-card__head" style={{ color: accent }}>
                <span className="hb-icon">{title === 'الشهر' ? <CrownIcon /> : <TrophyIcon />}</span>
                <strong>موظف {title}</strong>
            </div>

            {featured ? (
                <div className="hb-featured">
                    <div className="hb-avatar">
                        <img src={absMedia(featured.avatar) || '/avatar.png'} alt={featured.full_name || featured.username} />
                        <span className="hb-glow" style={{ background: accent }} />
                    </div>
                    <div className="hb-name">{featured.full_name || featured.username}</div>
                    {others.length > 0 && (
                        <div className="hb-others">
                            {others.map((u) => (
                                <div key={u.id} className="hb-chip" title={u.full_name || u.username}>
                                    <img src={absMedia(u.avatar) || '/avatar.png'} alt={u.full_name || u.username} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-muted small" style={{ textAlign: 'center' }}>لا يوجد مرشّح بعد</div>
            )}
        </div>
    );
}

export default function HonorBoard({ mount = 'header' }) {
    const session = getSessionKeyParts();                // { uid, iat }
    const closeKey = makeCloseKey(session);              // hb_closed_<uid>_<iat>

    const [data, setData] = useState(null);
    const [open, setOpen] = useState(() => (sessionStorage.getItem(closeKey) === '1' ? false : true));
    const fetchingRef = useRef(false);
    const attemptsRef = useRef(0);
    const prevKeyRef = useRef(closeKey);

    const enabledMonth = !!data?.enabled_month;
    const enabledYear = !!data?.enabled_year;

    const month = useMemo(() => (Array.isArray(data?.month) ? data.month : []), [data]);
    const year = useMemo(() => (Array.isArray(data?.year) ? data.year : []), [data]);
    const token = typeof window !== 'undefined' ? localStorage.getItem('access') : '';

    const fetchData = async (forceOpen = false) => {
        if (!token) {
            return null;
        }
        if (fetchingRef.current) return;
        fetchingRef.current = true;
        try {
            const token = localStorage.getItem('access') || '';
            const res = await axios.get('/api/honorboard/', {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            setData(res.data);

            // افتح بعد الدخول/التبديل إن كان أي قسم مفعّل ولم يُغلق بهذه الجلسة
            if (forceOpen && (res.data?.enabled_month || res.data?.enabled_year)) {
                if (sessionStorage.getItem(closeKey) !== '1') setOpen(true);
            }
            attemptsRef.current = 99;
        } catch (e) {
            attemptsRef.current += 1;
            if (attemptsRef.current < 5) {
                const delay = 300 * attemptsRef.current;
                setTimeout(() => { fetchingRef.current = false; fetchData(forceOpen); }, delay);
            }
        } finally {
            fetchingRef.current = false;
        }
    };

    // راقب تغيّر الجلسة (توكن جديد = مستخدم جديد أو login جديد) وافتح حسب المفتاح الجديد
    useEffect(() => {
        const iv = setInterval(() => {
            const cur = makeCloseKey(getSessionKeyParts());
            if (cur !== prevKeyRef.current) {
                prevKeyRef.current = cur;
                // إعادة تقييم حالة الإغلاق للجلسة الجديدة
                const closed = sessionStorage.getItem(cur) === '1';
                setOpen(!closed);
                attemptsRef.current = 0;
                fetchData(true);
            }
        }, 800);
        return () => clearInterval(iv);
    }, []);

    useEffect(() => {
        attemptsRef.current = 0;
        fetchData(true);

        const onFocus = () => { attemptsRef.current = 0; fetchData(true); };
        const onToggle = () => { attemptsRef.current = 0; fetchData(true); };
        window.addEventListener('focus', onFocus);
        window.addEventListener('honorboard:toggle', onToggle);
        return () => {
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('honorboard:toggle', onToggle);
        };
    }, []); // mount once

    if (!data || (!enabledMonth && !enabledYear) || !open) return null;

    return (
        <div
            className="hb-wrap"
            style={{
                position: mount === 'header' ? 'fixed' : 'relative',
                top: mount === 'header' ? 76 : 'auto',
                right: mount === 'header' ? 16 : 'auto',
                zIndex: 1100
            }}
            role="dialog"
            aria-label="لوحة الشرف"
        >
            <div className="hb-panel">
                <button
                    className="hb-close"
                    onClick={() => { setOpen(false); sessionStorage.setItem(closeKey, '1'); }}
                    aria-label="إغلاق"
                >
                    ×
                </button>

                <div className="hb-title">
                    <span className="hb-badge">لوحة الشرف</span>
                </div>

                <div className="hb-grid">
                    {enabledMonth && <Featured title="الشهر" list={month} accent="#ffd54f" />}
                    {enabledYear && <Featured title="السنة" list={year} accent="#9fa8da" />}
                </div>
            </div>

            {/* نفس الـCSS المُحسّن والمُصغّر الذي اعتمدناه */}
            <style>{`
        .hb-wrap{ max-width: 300px; width: 75vw; }
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
          font-size:14px; line-height:1; color:#333;
          box-shadow: 0 3px 8px rgba(0,0,0,.08);
        }
        .hb-close:hover{ filter: brightness(1.1) }

        .hb-title{ display:flex; align-items:center; justify-content:center; margin: 4px 0 6px; }
        .hb-badge{
          display:inline-flex; align-items:center; gap:6px;
          background: linear-gradient(90deg, #e6c36c, #f5d77a);
          color:#fff; font-weight:900; letter-spacing:.4px;
          padding: 4px 10px; border-radius: 999px; box-shadow: 0 3px 8px rgba(230,195,108,.4);
          font-size: 13px;
          animation: shine 3s linear infinite;
        }
        @keyframes shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .hb-grid{ display:grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        @media (max-width: 640px){ .hb-grid{ grid-template-columns: 1fr } }

        .hb-card{ border: 1px solid rgba(0,0,0,.05); border-radius: 10px; background: #fff;
          box-shadow: 0 3px 10px rgba(0,0,0,.08); padding: 6px; }
        .hb-card__head{ display:flex; align-items:center; gap:6px; margin-bottom: 4px; font-weight:700; font-size: 12px; }
        .hb-icon{ display:inline-flex; width:20px; height:20px; align-items:center; justify-content:center;
          background: rgba(0,0,0,.04); border-radius: 999px; }

        .hb-featured{ display:flex; flex-direction:column; align-items:center; }
        .hb-avatar{ position:relative; width:40px; height:40px; border-radius:999px;
          overflow:hidden; box-shadow: 0 5px 12px rgba(0,0,0,.14); border:2px solid #e6c36c;
          animation: glow 2.5s ease-in-out infinite alternate;
        }
        .hb-avatar img{ width:100%; height:100%; object-fit:cover; display:block; }
        @keyframes glow {
          from { box-shadow: 0 0 8px rgba(230,195,108,.5); }
          to   { box-shadow: 0 0 16px rgba(230,195,108,.9); }
        }
        .hb-name{ margin-top:4px; font-weight:800; text-align:center; color:#111827; font-size: 12px; }

        .hb-others{ display:flex; gap:4px; margin-top:4px; flex-wrap:wrap; justify-content:center }
        .hb-chip{ width:18px; height:18px; border-radius:999px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.12); border:1px solid #e6c36c; }
        .hb-chip img{ width:100%; height:100%; object-fit: cover; display:block }
      `}</style>
        </div>
    );
}
