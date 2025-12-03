// src/api/indicators.js
// ✅ مؤشرات التبويب (الشكاوى + المهام) مع منطق دقيق للنقطة الحمراء
// - الشكاوى: نعتمد على بيانات الـ API نفسها لتحديد غير المقروء حسب الدور،
//   ونوفّر دالة لِتعليم العناصر كمقروءة عبر مسار mark_seen لكل شكوى.
// - المهام: نعتمد على LocalStorage لختم آخر مشاهدة ونقارنها بآخر تحديث فعلي للمهام ذات الصلة.

import axios from './axios';
import { jwtDecode } from 'jwt-decode';

/* ===== LocalStorage مفاتيح ===== */
const LS_SEEN_TASKS = 'seen_tasks_at';

/* ===== أدوات مساعدة ===== */
function arr(x) { return Array.isArray(x) ? x : (x ? [x] : []); }
function nowISO() { return new Date().toISOString(); }

function getCurrentUser() {
  try {
    const token = localStorage.getItem('access');
    if (!token) return { id: null, role: (localStorage.getItem('userRole')||'employee').toLowerCase() };
    const dec = jwtDecode(token);
    const id = dec.user_id || dec.id || dec.uid || dec.sub || null;
    const role = (dec.role || localStorage.getItem('userRole') || 'employee').toLowerCase();
    const username = dec.username || dec.user || null;
    return { id, role, username };
  } catch {
    return { id: null, role: (localStorage.getItem('userRole')||'employee').toLowerCase() };
  }
}

/* ===== الشكاوى (Complaints) ===== */
export async function complaintsIndicator() {
  try {
    const { role } = getCurrentUser();
    const res = await axios.get('/api/complaints/');
    const items = arr(res?.data);
    if (!items.length) return false;

    const hasUnread = items.some(c => {
      if (role === 'employee') {
        return c.is_responded && !c.is_seen_by_employee;
      }
      if (role === 'manager' || role === 'hr' || role === 'general_manager') {
        return !c.is_seen_by_recipient;
      }
      return false;
    });
    return !!hasUnread;
  } catch {
    return false;
  }
}

export async function markSeenComplaints() {
  try {
    const { role } = getCurrentUser();
    const res = await axios.get('/api/complaints/');
    const items = arr(res?.data);

    const targets = items.filter(c => {
      if (role === 'employee') {
        return c.is_responded && !c.is_seen_by_employee;
      }
      if (role === 'manager' || role === 'hr' || role === 'general_manager') {
        return !c.is_seen_by_recipient;
      }
      return false;
    });

    await Promise.allSettled(
      targets.map(c => axios.post(`/api/complaints/${c.id}/mark_seen/`).catch(() => null))
    );
  } catch {
    // تجاهل الأخطاء بصمت
  }
}

/* ===== المهام (Tasks) ===== */
export async function tasksIndicator() {
  try {
    const { id: myId, role } = getCurrentUser();
    const r = await axios.get('/api/tasks/');
    const items = arr(r?.data);
    if (!items.length) return false;

    const relevant = items.filter(t => {
      if (role === 'employee') {
        const rec = arr(t.recipients);
        const hasMe = rec.some(x => (x?.user === myId) || (x?.user_id === myId) || (x?.user?.id === myId));
        return hasMe;
      }
      return true; // المدير/HR/GM
    });

    const latest = relevant
      .map(t => t?.updated_at || t?.created_at)
      .filter(Boolean)
      .sort()
      .slice(-1)[0];
    if (!latest) return false;

    const seenAt = localStorage.getItem(LS_SEEN_TASKS);
    return !seenAt || latest > seenAt;
  } catch {
    return false;
  }
}

export async function markSeenTasks() {
  try {
    const { id: myId, role } = getCurrentUser();
    const r = await axios.get('/api/tasks/');
    const items = arr(r?.data);

    const relevant = items.filter(t => {
      if (role === 'employee') {
        const rec = arr(t.recipients);
        const hasMe = rec.some(x => (x?.user === myId) || (x?.user_id === myId) || (x?.user?.id === myId));
        return hasMe;
      }
      return true;
    });

    const latest = relevant
      .map(t => t?.updated_at || t?.created_at)
      .filter(Boolean)
      .sort()
      .slice(-1)[0];

    localStorage.setItem(LS_SEEN_TASKS, latest || nowISO());
  } catch {
    localStorage.setItem(LS_SEEN_TASKS, nowISO());
  }
}

/* ===== الجامع (للاستخدام في NavTabs) ===== */
export async function fetchIndicators() {
  const [hasNewComplaints, hasNewTasks] = await Promise.all([
    complaintsIndicator(),
    tasksIndicator(),
  ]);
  return { hasNewComplaints, hasNewTasks };
}
