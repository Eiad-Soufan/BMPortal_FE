// src/components/TasksButton.jsx
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { listTasks } from '../api/tasks';

/**
 * زر المهام في الهيدر:
 * - شكل دائري متوهّج مثل الشكاوى والإشعارات
 * - بادج بعدد المهام المفتوحة المرئية للمستخدم حسب دوره
 * - تسمية تحت الزر (ثنائي اللغة)
 */
export default function TasksButton() {
  const [openCount, setOpenCount] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getRole = () => {
    const token = localStorage.getItem('access');
    try {
      if (token) {
        const dec = jwtDecode(token);
        const role = (dec.role || localStorage.getItem('userRole') || 'employee').toLowerCase();
        return role;
      }
    } catch { }
    return (localStorage.getItem('userRole') || 'employee').toLowerCase();
  };

  const fetchCount = async () => {
    try {
      const tasks = await listTasks();
      // فلترة حسب الحالة المفتوحة فقط
      const open = (tasks || []).filter(t => (t.status || 'open') === 'open').length;
      setOpenCount(open);
    } catch (e) {
      console.warn('Tasks count error:', e?.response?.data || e.message);
    }
  };

  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, 10000);
    const onFocus = () => fetchCount();
    const onVis = () => { if (!document.hidden) fetchCount(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <div className="d-flex flex-column align-items-center mx-2">
      <button
        className="position-relative d-flex align-items-center justify-content-center rounded-circle border-0"
        style={{
          width: 46, height: 46,
          background: 'linear-gradient(135deg, rgba(76,175,80,0.2), rgba(255,255,255,0.1))',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          boxShadow: '0 4px 18px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.25)',
          color: '#fff', fontSize: 20
        }}
        title={t('tasks') || 'Tasks'}
        onClick={() => navigate('/tasks')}
      >
        {/* أيقونة ملف */}
        🗂️
        {openCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {openCount}
          </span>
        )}
      </button>
      <small className="mt-1 text-white" style={{ opacity: 0.95, fontWeight: 600 }}>
        {t('tasks') || 'Tasks'}
      </small>
    </div>
  );
}