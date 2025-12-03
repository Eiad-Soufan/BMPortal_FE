// src/components/NavTabs.jsx
import { jwtDecode } from 'jwt-decode';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { fetchIndicators, markSeenComplaints, markSeenTasks } from '../api/indicators';

export default function NavTabs({ className = '' }) {
  const { t } = useTranslation();
  const location = useLocation();

  const tabs = [
    { key: 'home', to: '/dashboard', label: t('home') || 'الصفحة الرئيسية' },
    { key: 'complaints', to: '/complaints', label: t('complaints') || 'الشكاوى' },
    { key: 'tasks', to: '/tasks', label: t('tasks') || 'المهام' },
    { key: 'surveys', to: '/surveys', label: t('surveys') || 'الاستبيانات' }, // ← جديد
  ];

  const [hasNewComplaints, setHasNewComplaints] = useState(false);
  const [hasNewTasks, setHasNewTasks] = useState(false);
  const pollRef = useRef(null);


  const getRole = () => {
    try {
      const token = localStorage.getItem('access');
      if (token) { const d = jwtDecode(token); if (d?.role) return String(d.role).toLowerCase(); }
    } catch { }
    return (localStorage.getItem('userRole') || 'employee').toLowerCase();
  };


  async function refresh() {
    try {
      const r = await fetchIndicators();
      setHasNewComplaints(!!r.hasNewComplaints);
      setHasNewTasks(!!r.hasNewTasks);
    } catch {
      setHasNewComplaints(false);
      setHasNewTasks(false);
    }
  }

  useEffect(() => {
    refresh();
    pollRef.current = setInterval(refresh, 15000);
    return () => clearInterval(pollRef.current);
  }, []);

  // عند دخول صفحة الشكاوى/المهام نسجل آخر زيارة ونحدّث المؤشّرات فورًا
  useEffect(() => {
    if (location.pathname.startsWith('/complaints')) {
      markSeenComplaints();
      const t = setTimeout(refresh, 300);
      return () => clearTimeout(t);
    }
    if (location.pathname.startsWith('/tasks')) {
      markSeenTasks();
      const t = setTimeout(refresh, 300);
      return () => clearTimeout(t);
    }
  }, [location.pathname]);

  return (
    <div className={`d-flex align-items-center gap-2 ${className}`}>
      <style>{`
        .app-tab {
          position: relative;
          border: 1px solid rgba(255,255,255,.28);
          background: rgba(255,255,255,.86);
          color: #0b2e13;
          padding: 10px 16px;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 800;
          letter-spacing: .2px;
          box-shadow: 0 6px 16px rgba(0,0,0,.12);
          transition: transform .12s ease, box-shadow .18s ease, background .18s ease, color .18s ease, border-color .18s ease;
        }
        .app-tab:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(0,0,0,.16);
          background: #ffffff;
        }
        .app-tab.active{
          background: #ffffff;
          color: #0b2e13;
          border-color: color-mix(in oklab, var(--emerald) 70%, #ffffff 30%);
          box-shadow:
            0 10px 24px rgba(0,0,0,.16),
            0 0 0 3px color-mix(in oklab, var(--emerald) 18%, transparent) inset;
        }
        .app-tab.active::after{
          content: "";
          position: absolute;
          inset-inline: 18px;
          bottom: 6px;
          height: 3px;
          border-radius: 2px;
          background: linear-gradient(90deg, color-mix(in oklab, var(--emerald) 80%, #fff 20%), color-mix(in oklab, var(--emerald) 55%, #fff 45%));
          filter: saturate(110%);
        }
        .notify-dot{
          position: absolute;
          top: -4px;
          inset-inline-end: -4px;
          width: 10px; height: 10px;
          background: #e53935;
          border-radius: 50%;
          box-shadow: 0 0 0 2px rgba(255,255,255,.95);
        }
        .notify-dot::after{
          content:"";
          position:absolute; inset:0;
          border-radius:50%;
          border: 2px solid rgba(229,57,53,.55);
          animation: notifyPulse 1.2s ease-out infinite;
        }
        @keyframes notifyPulse {
          0%   { transform: scale(1);   opacity: .9; }
          100% { transform: scale(1.8); opacity: 0;  }
        }
      `}</style>

      {tabs.map((tab) => {
        const showDot =
          (tab.key === 'complaints' && hasNewComplaints) ||
          (tab.key === 'tasks' && hasNewTasks);

        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => `app-tab ${isActive ? 'active' : ''}`}
          >
            {tab.label}
            {showDot && <span className="notify-dot" aria-hidden="true" />}
          </NavLink>
        );
      })}
    </div>
  );
}
