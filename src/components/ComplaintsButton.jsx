import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

/**
 * زر الشكاوى في الهيدر:
 * - نفس شكل الإشعارات بالضبط (نفس الحجم والتدوير)
 * - بادج حمراء بالعدد
 * - تسمية تحت الزر (ثنائي اللغة)
 */
export default function ComplaintsButton() {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const role = localStorage.getItem('userRole'); // 'employee' | 'manager' | 'hr'
  const token = localStorage.getItem('access');

  const fetchUnreadCount = async () => {
    try {
      if (!role) return;
      let endpoint = '';
      if (role === 'employee') endpoint = '/api/complaints/my_complaints/';
      else if (role === 'manager') endpoint = '/api/complaints/manager_complaints/';
      else if (role === 'hr') endpoint = '/api/complaints/hr_complaints/';
      if (!endpoint) return;

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = Array.isArray(res?.data?.results) ? res.data.results : (Array.isArray(res?.data) ? res.data : []);

      const count =
        role === 'employee'
          ? list.filter(c => c.is_responded && !c.is_seen_by_employee).length
          : list.filter(c => !c.is_seen_by_recipient).length;

      setUnreadCount(count);
    } catch {
      // صامت
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const id = setInterval(fetchUnreadCount, 10000);
    const onFocus = () => fetchUnreadCount();
    const onVis = () => { if (!document.hidden) fetchUnreadCount(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [role]); // eslint-disable-line

  return (
    <div className="d-flex flex-column align-items-center" style={{ minWidth: 64 }}>
      <button
        className="btn btn-light position-relative d-flex align-items-center justify-content-center shadow-sm"
        onClick={() => navigate('/complaints')}
        aria-label={t('complaints') || 'Complaints'}
        title={t('complaints') || 'Complaints'}
        style={{
          width: 44,
          height: 44,
          padding: 0,
          borderRadius: 12,      // ✅ نفس التدوير تمامًا
        }}
      >
        {/* أيقونة فقّاعة كلام */}
        💬
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
          </span>
        )}
      </button>
      <small className="mt-1 text-white" style={{ opacity: 0.95, fontWeight: 600 }}>
        {t('complaints') || 'Complaints'}
      </small>
    </div>
  );
}
