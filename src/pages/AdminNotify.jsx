// src/pages/AdminNotify.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from '../api/axios';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const SEND_URL = '/api/notifications/send_notification/'; // ✅ API الوحيدة المعتمدة

export default function AdminNotify() {
  const { t, i18n } = useTranslation();
  const isAR = (i18n.language || 'en').startsWith('ar');

  // ===== form state
  const [title, setTitle]       = useState('');
  const [message, setMessage]   = useState('');
  const [priority, setPriority] = useState('normal'); // سيُرسل كـ importance

  // ===== audience/users with pagination
  const [users, setUsers]               = useState([]);
  const [nextUrl, setNextUrl]           = useState(null);
  const [audienceAll, setAudienceAll]   = useState(true);
  const [selectedUsernames, setSelectedUsernames] = useState(new Set());
  const [q, setQ]                       = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // ===== ui state
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState({ show: false, type: 'success', text: '' });

  // guard لمنع الجلب مرتين تحت StrictMode
  const didInit = useRef(false);

  const showToast = (type, text) => {
    setToast({ show: true, type, text });
    setTimeout(() => setToast(s => ({ ...s, show: false })), 2200);
  };

  // ---------- helpers: username + name + key + dedupe ----------
  const getUsername = (u) => u?.username || u?.user?.username || null;
  const getKey = (u) => getUsername(u) || (u?.email ? u.email.split('@')[0] : null) || (u?.id ?? u?.user_id ?? u?.pk ?? null);
  const getName = (u) =>
    u?.full_name ||
    u?.name_ar ||
    [u?.first_name, u?.last_name].filter(Boolean).join(' ').trim() ||
    getUsername(u) ||
    (u?.email ? u.email.split('@')[0] : '') ||
    String(getKey(u) ?? '');

  // دمج بدون تكرار — نعتمد username أولًا
  const mergeUsers = (prev, incoming) => {
    const m = new Map();
    [...prev, ...incoming].forEach(u => {
      const key = getUsername(u) || getKey(u);
      if (key == null) return;
      m.set(String(key), u);
    });
    return Array.from(m.values());
  };

  // ---------- fetch users (نستخدم endpoints تعيد username) ----------
  const fetchUsers = async (urlOverride) => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem('access');
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      // الأفضل أن يكون عندك /api/users/ يعيد username صريح
      const baseUrl = urlOverride || '/api/users/?page=1&page_size=100';
      const res = await axios.get(baseUrl, { headers });

      let incoming = [];
      let next = null;

      if (Array.isArray(res.data)) {
        incoming = res.data;
      } else if (Array.isArray(res.data?.results)) {
        incoming = res.data.results;
        next = res.data.next || null;
      } else if (Array.isArray(res.data?.users)) {
        incoming = res.data.users;
        next = res.data.next || null;
      } else if (Array.isArray(res.data?.employees)) {
        incoming = res.data.employees;
        next = res.data.next || null;
      }

      setUsers(prev => mergeUsers(prev, incoming));
      setNextUrl(next);
    } catch (e) {
      // احتياط: جرّب employees
      try {
        const token = localStorage.getItem('access');
        const headers = { Authorization: `Bearer ${token}` };
        const alt = await axios.get('/api/employees/?page=1&page_size=100', { headers });

        let incoming = [];
        let next = null;
        if (Array.isArray(alt.data)) {
          incoming = alt.data;
        } else if (Array.isArray(alt.data?.results)) {
          incoming = alt.data.results;
          next = alt.data.next || null;
        } else if (Array.isArray(alt.data?.employees)) {
          incoming = alt.data.employees;
          next = alt.data.next || null;
        }
        setUsers(prev => mergeUsers(prev, incoming));
        setNextUrl(next);
      } catch (e2) {
        console.error('All user endpoints failed', e2?.message);
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchUsers();
  }, []);

  const loadMore = () => { if (nextUrl) fetchUsers(nextUrl); };

  // ----- search filter -----
  const filteredUsers = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return users;
    return users.filter(u =>
      getName(u).toLowerCase().includes(needle) || (getUsername(u) || '').toLowerCase().includes(needle)
    );
  }, [q, users]);

  // ----- selection by USERNAME -----
  const toggleUser = (u) => {
    const uname = getUsername(u);
    if (!uname) return; // لا نسمح بالاختيار بدون username
    setAudienceAll(false);
    setSelectedUsernames(prev => {
      const c = new Set(prev);
      if (c.has(uname)) c.delete(uname); else c.add(uname);
      return c;
    });
  };
  const selectAllFiltered = () => {
    setAudienceAll(false);
    const next = new Set(selectedUsernames);
    filteredUsers.forEach(u => {
      const uname = getUsername(u);
      if (uname) next.add(uname);
    });
    setSelectedUsernames(next);
  };
  const clearSelection = () => setSelectedUsernames(new Set());

  // ------- submit (API واحدة، payload مطابق للباك) -------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!title.trim() || !message.trim()) {
      showToast('error', isAR ? 'يرجى تعبئة العنوان والتفاصيل' : 'Please fill title and message');
      return;
    }
    if (!audienceAll && selectedUsernames.size === 0) {
      showToast('error', isAR ? 'اختر مستلمين أو فعّل خيار الكل' : 'Select recipients or enable All');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      if (!token) throw new Error('No token');
      const headers = { Authorization: `Bearer ${token}` };
      const importance = (priority === 'urgent') ? 'important' : 'normal';

      // ⚠️ الباك يريد "importance" وليس "priority"
      const base = { title, message, importance };

      // للجميع: لا نرسل usernames
      // لمحددين: نرسل usernames = []
      const payload = audienceAll
        ? base
        : { ...base, usernames: Array.from(selectedUsernames) };

      const res = await axios.post(SEND_URL, payload, { headers });

      // الباك يعيد 201 + {"status": "Notification sent successfully"}
      if (!(res?.status === 201)) throw new Error('Server did not return 201');

      // reset
      setTitle('');
      setMessage('');
      setPriority('normal');
      setAudienceAll(true);
      setSelectedUsernames(new Set());
      setQ('');

      showToast('success', t('op.success', { defaultValue: isAR ? 'تمت العملية بنجاح' : 'Operation completed successfully' }));
    } catch (err) {
      console.error('Notify submit failed', err?.message);
      showToast('error', t('op.fail', { defaultValue: isAR ? 'حدث خطأ، الرجاء المحاولة لاحقًا' : 'Something went wrong, please try again' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="notify-page">
        <div className="notify-bg" />

        {/* Hero */}
        <section className="notify-hero">
          <div className="notify-hero-inner">
            <h1 className="notify-title">
              {t('notify.title', { defaultValue: isAR ? 'إضافة إشعار' : 'Add Notification' })}
            </h1>
            <Link to="/dashboard" className="back-btn">
              <span className="back-ic" aria-hidden>←</span>
              <span>{t('actions.back_home', { defaultValue: isAR ? 'عودة للرئيسية' : 'Back to Home' })}</span>
            </Link>
          </div>
        </section>

        {/* المحتوى */}
        <section className="notify-content">
          <form className={`notify-card ${isAR ? 'rtl' : ''}`} onSubmit={handleSubmit}>
            <div className="grid">
              {/* عنوان — أوسع */}
              <div className="field title-field">
                <label>{t('notify.form.title', { defaultValue: isAR ? 'عنوان الإشعار' : 'Notification Title' })}</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('notify.form.title_ph', { defaultValue: isAR ? 'اكتب عنوانًا موجزًا' : 'Write a concise title' })}
                  required
                />
              </div>

              {/* الأولوية → importance */}
              <div className="field">
                <label>{t('notify.form.priority', { defaultValue: isAR ? 'الأولوية' : 'Priority' })}</label>
 <div className="segmented" role="radiogroup" aria-label="importance">
    <label className={`seg-btn ${priority === 'normal' ? 'active' : ''}`}>
      <input
        type="radio"
        name="importance"
        value="normal"
        checked={priority === 'normal'}
        onChange={(e) => setPriority(e.target.value)}
      />
      <span>{t('notify.priority.normal', { defaultValue: isAR ? 'عادي' : 'Normal' })}</span>
    </label>

    <label className={`seg-btn ${priority === 'urgent' ? 'active' : ''}`}>
      <input
        type="radio"
        name="importance"
        value="urgent"
        checked={priority === 'urgent'}
        onChange={(e) => setPriority(e.target.value)}
      />
      <span>{t('notify.priority.urgent', { defaultValue: isAR ? 'مستعجل' : 'Urgent' })}</span>
    </label>
  </div>
              </div>

              {/* الجمهور */}
              <div className="field audience-field full">
                <label>{t('notify.form.audience', { defaultValue: isAR ? 'الجمهور' : 'Audience' })}</label>

                <div className="aud-row">
                  <label className="chk">
                    <input
                      type="checkbox"
                      checked={audienceAll}
                      onChange={() => {
                        const v = !audienceAll;
                        setAudienceAll(v);
                        if (v) setSelectedUsernames(new Set());
                      }}
                    />
                    <span>{t('notify.audience.all', { defaultValue: isAR ? 'الكل' : 'All' })}</span>
                  </label>

                  {!audienceAll && (
                    <>
                      <button type="button" className="mini" onClick={selectAllFiltered}>
                        {t('notify.actions.select_all', { defaultValue: isAR ? 'تحديد الكل (النتائج)' : 'Select all (results)' })}
                      </button>
                      <button type="button" className="mini" onClick={clearSelection}>
                        {t('notify.actions.clear', { defaultValue: isAR ? 'مسح التحديد' : 'Clear' })}
                      </button>
                      <span className="count">
                        {isAR ? `المحدد: ${selectedUsernames.size}` : `Selected: ${selectedUsernames.size}`}
                      </span>
                    </>
                  )}
                </div>

                {!audienceAll && (
                  <>
                    {/* بحث */}
                    <input
                      className="search"
                      type="text"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder={t('notify.search', { defaultValue: isAR ? 'ابحث بالاسم...' : 'Search by name...' })}
                    />

                    {/* قائمة المستخدمين — Scroll كبيرة */}
                    <div className="user-list" aria-busy={loadingUsers}>
                      {filteredUsers.length === 0 && !loadingUsers && (
                        <div className="empty">{t('notify.empty', { defaultValue: isAR ? 'لا توجد نتائج' : 'No results' })}</div>
                      )}

                      {filteredUsers.map(u => {
                        const uname = getUsername(u);
                        const key = String(getKey(u));
                        const disabled = !uname; // لا نسمح باختيار عنصر بلا username
                        return (
                          <label key={key} className={`user-row ${disabled ? 'disabled' : ''}`} title={getName(u)}>
                            <input
                              type="checkbox"
                              disabled={disabled}
                              checked={uname ? selectedUsernames.has(uname) : false}
                              onChange={() => (disabled ? null : toggleUser(u))}
                            />
                            <span className="nm">{getName(u)}{uname ? ` (@${uname})` : ''}</span>
                          </label>
                        );
                      })}

                      {nextUrl && (
                        <div className="load-more">
                          <button type="button" onClick={loadMore} disabled={loadingUsers}>
                            {loadingUsers
                              ? t('notify.loading', { defaultValue: isAR ? 'جارٍ التحميل…' : 'Loading…' })
                              : t('notify.load_more', { defaultValue: isAR ? 'تحميل المزيد' : 'Load more' })
                            }
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* الرسالة */}
              <div className="field full">
                <label>{t('notify.form.message', { defaultValue: isAR ? 'تفاصيل الإشعار' : 'Notification Message' })}</label>
                <textarea
                  rows="6"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t('notify.form.message_ph', { defaultValue: isAR ? 'اكتب التفاصيل (يدعم أسطر متعددة)' : 'Write details (multiline supported)' })}
                  required
                />
              </div>
            </div>

            <div className="actions">
              <button className="submit" type="submit" disabled={loading}>
                <span className="plane" aria-hidden>🡆</span>
                {loading
                  ? t('actions.submitting', { defaultValue: isAR ? 'جارٍ الإرسال…' : 'Submitting…' })
                  : t('actions.submit',     { defaultValue: isAR ? 'إرسال الإشعار' : 'Send Notification' })
                }
              </button>
            </div>
          </form>
        </section>
      </div>

      <Footer />

      {/* Toast */}
      <div className={`bm-toast ${toast.show ? 'show' : ''} ${toast.type}`}>
        <div className="toast-inner">
          <div className="toast-ic" aria-hidden>{toast.type === 'success' ? '✔' : '✖'}</div>
          <div className="toast-text">{toast.text}</div>
        </div>
      </div>

      {/* ============== Styles ============== */}
      <style>{`
        :root{
          --g1:#10c48b; --g2:#0ea36b; --g3:#0a6f47;
          --white:#fff; --ink:#0a6f47;
          --radius:14px;
        }

        .notify-page{ position:relative; min-height:60vh; direction:ltr; background:#f3f7f5; }
        .notify-bg{
          position:absolute; inset:0; z-index:0;
          background:
            radial-gradient(1200px 200px at 20% -60%, rgba(255,255,255,.22), transparent 60%),
            linear-gradient(135deg, var(--g1), var(--g2), var(--g3));
          opacity:.96;
        }
        .notify-hero{ position:relative; z-index:1; color:#fff; padding:14px 16px; animation: heroIn .8s ease both; }
        .notify-hero-inner{
          max-width:980px; margin:0 auto; min-height:110px;
          display:grid; align-items:center; grid-template-columns: 1fr auto; gap:12px;
        }
        .notify-title{ margin:0; font-size:1.8rem; font-weight:900; text-shadow:0 1px 0 rgba(0,0,0,.12); }

        .back-btn{
          height:40px; display:inline-flex; align-items:center; gap:8px;
          padding:0 14px; border-radius:999px; text-decoration:none;
          color:#fff; background: rgba(255,255,255,.16);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.24);
          transition: transform .12s ease, background .12s ease, box-shadow .12s ease;
          font-weight:900;
        }
        .back-btn:hover{ transform: translateY(-1px); background: rgba(255,255,255,.22); box-shadow: 0 10px 18px rgba(0,0,0,.14); }
        .back-ic{ font-size:18px; line-height:1; }

        .notify-content{ position:relative; z-index:2; }
        .notify-card{
          max-width:980px; margin:14px auto 24px; padding:18px 16px;
          background:#fff; border-radius:var(--radius);
          box-shadow:0 10px 24px rgba(0,0,0,.10);
          border:1px solid rgba(0,0,0,.06);
          animation: fadeInUp .8s ease both;
        }
        .notify-card.rtl{ direction:rtl; text-align:right; }

        .grid{ display:grid; grid-template-columns: repeat(12, 1fr); gap:16px; }
        .field{ grid-column: span 4; display:flex; flex-direction:column; gap:6px; }
        .field.full{ grid-column: span 12; }

        /* العنوان أعرض */
        .field.title-field{ grid-column: span 9; }
        @media (max-width: 960px){ .field.title-field{ grid-column: span 12; } }

        .field label{ font-weight:800; color:var(--ink); }
        .field input, .field select, .field textarea{
          border-radius:12px; border:1px solid rgba(10,111,71,.28); padding:10px 12px; font-weight:600; background:#fff;
          outline:none; transition: box-shadow .15s ease, border-color .15s ease;
        }
        .field input:focus, .field select:focus, .field textarea:focus{
          box-shadow:0 0 0 4px rgba(16,196,139,.18); border-color: var(--g1);
        }
        .field textarea{ resize: vertical; }

        .segmented{
          display:inline-flex; background:#f0faf6; border:1px solid rgba(16,196,139,.25);
          border-radius:12px; padding:3px; gap:3px;
        }
        .seg-btn{
          display:inline-flex; align-items:center; gap:8px;
          border:none; background:transparent; padding:8px 12px; border-radius:10px;
          font-weight:900; color:#0a6f47; cursor:pointer;
        }
        .seg-btn input{ position:absolute; opacity:0; pointer-events:none; }
        .seg-btn.active{
          background:linear-gradient(135deg, #e8fff6, #d8fff2);
          box-shadow: inset 0 0 0 1px rgba(16,196,139,.32);
        }
        .aud-row{ display:flex; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:8px; }
        .chk{ display:inline-flex; align-items:center; gap:8px; font-weight:800; color:#0a6f47; }
        .mini{
          border:none; background:#eef8f4; color:#0a6f47; font-weight:900; padding:6px 10px; border-radius:10px; cursor:pointer;
          box-shadow: inset 0 0 0 1px rgba(16,196,139,.22);
        }
        .mini:hover{ background:#e2f5ef; }
        .count{ font-weight:800; color:#2b4b3e; }

        .search{
          width:100%; margin-bottom:8px;
          border-radius:10px; border:1px solid rgba(10,111,71,.28); padding:8px 10px; font-weight:600; background:#fff;
        }

        .user-list{
          max-height: 420px;
          overflow: auto;
          border:1px solid rgba(0,0,0,.06); border-radius:10px; padding:8px;
          background:#fcfffd;
        }
        .user-row{
          display:flex; align-items:center; gap:10px; padding:6px 4px; border-radius:8px; cursor:pointer;
        }
        .user-row:hover{ background:#f1fbf6; }
        .user-row.disabled{ opacity:.6; cursor:not-allowed; }
        .user-row input{ transform: translateY(1px); }
        .nm{ font-weight:800; color:#0a6f47; }
        .empty{ padding:6px; color:#6b8; font-weight:800; }
        .load-more{ display:flex; justify-content:center; padding-top:8px; }
        .load-more button{
          border:none; background:#eef8f4; color:#0a6f47; font-weight:900; padding:8px 12px; border-radius:10px; cursor:pointer;
          box-shadow: inset 0 0 0 1px rgba(16,196,139,.22);
        }
        .load-more button:hover{ background:#e2f5ef; }

        .actions{ display:flex; justify-content:flex-end; margin-top:8px; }
        .submit{
          display:inline-flex; align-items:center; gap:10px;
          padding:12px 16px; border:none; border-radius:14px; cursor:pointer; color:#fff; font-weight:900; letter-spacing:.2px;
          background: linear-gradient(135deg, var(--g1), var(--g2));
          box-shadow: 0 12px 26px rgba(0,0,0,.18), inset 0 0 0 1px rgba(255,255,255,.22);
          transition: transform .12s ease, box-shadow .12s ease, filter .12s ease, opacity .12s ease;
        }
        .submit:hover{ transform: translateY(-1px); box-shadow: 0 16px 32px rgba(0,0,0,.2); filter: saturate(112%); }
        .submit:disabled{ opacity:.7; cursor:not-allowed; }
        .plane{ font-size:18px; transform: translateY(1px); }

        .bm-toast{
          position: fixed; top: 84px; left: 50%; transform: translateX(-50%);
          z-index: 2040; opacity:0; pointer-events:none; transition: opacity .2s ease, transform .2s ease;
        }
        .bm-toast.show{ opacity:1; transform: translateX(-50%) translateY(0); pointer-events:auto; }
        .toast-inner{
          display:flex; align-items:center; gap:10px; padding:12px 16px; border-radius:12px;
          box-shadow: 0 12px 28px rgba(0,0,0,.18);
          color:#fff; font-weight:900; letter-spacing:.2px;
        }
        .bm-toast.success .toast-inner{ background: linear-gradient(135deg, #10c48b, #0ea36b); }
        .bm-toast.error   .toast-inner{ background: linear-gradient(135deg, #e75162, #cc2640); }
        .toast-ic{ font-size:18px; line-height:1; }
        .toast-text{ white-space:nowrap; }

        @keyframes fadeInUp{ from{opacity:0; transform:translateY(12px) scale(.985)} to{opacity:1; transform:translateY(0) scale(1)} }
        @keyframes heroIn{ from{opacity:0; transform:translateY(-8px)} to{opacity:1; transform:translateY(0)} }
      `}</style>
    </>
  );
}
