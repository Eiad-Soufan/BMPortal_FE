// src/components/NotificationButton.jsx
import { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import axios from '../api/axios';

//import Paginator from "../components/Paginator";

const NotificationButton = () => {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [count, setCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const { t, i18n } = useTranslation();
  const token = localStorage.getItem('access');

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get('/api/user-notifications/', {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, page_size: pageSize },
      });

      const d = res?.data;
      const arr = Array.isArray(d?.results)
        ? d.results
        : (Array.isArray(d) ? d : []);

      setNotifications(arr);
      setCount(typeof d?.count === 'number' ? d.count : arr.length);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchNotifications(1, false); const id = setInterval(fetchNotifications, 10000);
    const onFocus = () => fetchNotifications();
    const onVis = () => { if (!document.hidden) fetchNotifications(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  // تحديث عند تغيير اللغة (للتواريخ/النصوص)
  useEffect(() => {
    const handler = () => fetchNotifications();
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (userNotifId) => {
    try {
      await axios.post(`/api/user-notifications/${userNotifId}/mark_as_read/`, {});
      setNotifications(prev =>
        prev.map(n => (n.id === userNotifId ? { ...n, is_read: true } : n))
      );
    } catch { /* silent */ }
  };

  const openDetails = async (item) => {
    setSelected(item);
    setShowModal(true);
    if (!item.is_read) await markAsRead(item.id);
  };

  const importanceBadge = (importance) => {
    const isUrgent = importance === 'important';
    const label = isUrgent ? (t('urgent') || t('important') || 'Urgent')
      : (t('normal') || 'Normal');
    const cls = `badge rounded-pill ${isUrgent ? 'bg-danger' : 'bg-secondary'}`;
    return <span className={cls}>{label}</span>;
  };

  const fmtDate = (iso, lang = 'en') => {
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return '';

      // عربي: 23 أغسطس 2025، 11:32 ص
      if (lang.startsWith('ar')) {
        // إن أردت أرقامًا إنجليزية مع العربية استخدم "ar-EG-u-nu-latn" بدل "ar-EG"
        const df = new Intl.DateTimeFormat('ar-EG', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        const parts = df.formatToParts(d);
        const get = (t) => (parts.find(p => p.type === t)?.value || '');
        const day = get('day');
        const month = get('month');
        const year = get('year');
        const hour = get('hour');
        const minute = get('minute');
        const period = get('dayPeriod'); // ص / م
        return `${day} ${month} ${year}، ${hour}:${minute} ${period}`;
      }

      // إنجليزي: Aug 23, 2025, 11:32 AM
      return new Intl.DateTimeFormat(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(d);
    } catch {
      return '';
    }
  };

  return (
    <div className="d-flex flex-column align-items-center position-relative" style={{ minWidth: 64 }}>
      {/* الزر (نفس التدوير/الحجم) */}
      <button
        className="btn btn-light position-relative d-flex align-items-center justify-content-center shadow-sm"
        onClick={() => setShowPanel(prev => !prev)}
        aria-label={t('notifications') || 'Notifications'}
        title={t('notifications') || 'Notifications'}
        style={{ width: 44, height: 44, padding: 0, borderRadius: 12 }}>
        🔔
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
          </span>
        )}
      </button>



      {/* اللوحة المنسدلة — نفس الطابع القديم (قائمة فقط + Close) */}
      {showPanel && (
        <div
          className="position-absolute"
          style={{
            top: 56,
            left: '50%',
            transform: 'translateX(-50%)',
            right: 'auto',
            width: 'min(340px, calc(100vw - 24px))',
            maxHeight: 'min(70vh, 520px)',
            overflowY: 'auto',
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
            zIndex: 2000,
            animation: 'fadeIn 0.18s ease-out',
          }}
        >

        >
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
            <strong style={{ fontSize: '0.95rem' }}>
              {t('notifications') || 'Notifications'}
            </strong>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowPanel(false)}>
              {t('close') || 'Close'}
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="p-3 text-muted">{t('no_notifications') || 'No notifications.'}</div>
          ) : (
            <ul className="list-group list-group-flush">
              <div style={{ maxHeight: '580px', overflowY: 'auto', overscrollBehavior: 'contain' }}>
                {notifications.map((n) => {
                  const notif = n?.notification || {};
                  const title = notif.title || (t('notification') || 'Notification');
                  return (
                    <li
                      key={n.id}
                      className="list-group-item d-flex align-items-center justify-content-between"
                      role="button"
                      onClick={() => openDetails(n)}   // يفتح نافذة تفاصيل (Modal)
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="text-truncate" style={{ maxWidth: 230, fontWeight: 600 }}>
                        {title}
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        {/* لا تستخدم notify-dot هنا حتى لا ترث position:absolute من الستايل العام */}
                        {!n.is_read && (
                          <span
                            // لا className
                            style={{
                              display: 'inline-block',
                              width: 10,
                              height: 10,
                              backgroundColor: '#ef4444',
                              borderRadius: '50%',
                              boxShadow: '0 0 0 2px #fff', // هالة بيضاء لتوضيحها فوق الخلفيات
                              verticalAlign: 'middle',
                            }}
                            aria-hidden="true"
                          />
                        )}

                        {importanceBadge(notif.importance)}
                      </div>
                    </li>
                  );
                })}

              </div>
              {(notifications.length < count) && (
                <li className="list-group-item text-center">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setPage(page + 1)}
                  >
                    تحميل المزيد
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      )}

      {/* نافذة التفاصيل (Modal) — الشكل البسيط الأنيق */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            {importanceBadge(selected?.notification?.importance)}
            <span className="text-truncate">{selected?.notification?.title || (t('notification') || 'Notification')}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-muted small mb-2">
            {selected?.notification?.created_at ? fmtDate(selected.notification.created_at) : null}
          </div>

          {/* ✅ نحافظ على تعدد الأسطر */}
          <div
            style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, wordBreak: 'break-word' }}
            dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
          >
            {selected?.notification?.message || ''}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t('close') || 'Close'}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
};


export default NotificationButton;



