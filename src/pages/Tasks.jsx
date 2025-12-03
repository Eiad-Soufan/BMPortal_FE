// src/pages/Tasks.jsx
import { jwtDecode } from 'jwt-decode';
import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { listTasks } from '../api/tasks';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Paginator from '../components/Paginator';
const __LOCAL_UI_CSS__


  = `
:root{--bm-g1:#10c48b;--bm-g2:#0ea36b;--bm-g3:#0a6f47;--bm-ink:#082d1f;--bm-ink2:#134233;--bm-border:color-mix(in oklab,#0b2e13 12%,#fff 88%);--space-1:.5rem;--space-2:.75rem;--space-3:1rem}
.bm-btn{display:inline-flex;align-items:center;gap:.5rem;font-weight:800;border-radius:14px;padding:.6rem .95rem;border:0;cursor:pointer;transition:transform .12s ease,box-shadow .12s ease,filter .2s ease}
.bm-btn:active{transform:translateY(1px) scale(.98)}
.bm-btn--primary{color:#fff;background:linear-gradient(135deg,var(--bm-g1),var(--bm-g2),var(--bm-g3));box-shadow:inset 0 0 0 1px rgba(255,255,255,.22),0 10px 22px rgba(0,0,0,.14)}
.bm-btn--primary:hover{filter:brightness(1.05)}
.bm-btn--outline{background:#fff;color:var(--bm-ink);border:1.5px solid color-mix(in oklab,var(--bm-g2) 70%,#fff 30%);box-shadow:0 6px 16px rgba(0,0,0,.08)}
.bm-actionbar{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;background:#fff;padding:.55rem;border-radius:14px;box-shadow:0 10px 24px rgba(0,0,0,.10);border:1px solid var(--bm-border);margin-top:var(--space-2)}
.bm-actionbar .spacer{flex:1 1 auto}
.bm-input{border-radius:12px !important;border:1.5px solid var(--bm-border) !important;box-shadow:none !important;padding:.58rem .8rem !important}
.bm-card{border-radius:16px;border:1px solid var(--bm-border);box-shadow:0 8px 18px rgba(0,0,0,.08);transition:transform .12s ease,box-shadow .12s ease;overflow:hidden}
.bm-card:hover{transform:translateY(-2px);box-shadow:0 16px 28px rgba(0,0,0,.12)}
/* === Colored status word (no badge background) === */
.status-text{ font-weight: 800; letter-spacing:.3px; text-transform: uppercase; }
.status-text.st--open{ color: #0ea5e9; }
.status-text.st--success{ color: #22c55e; }
.status-text.st--failed{ color: #ef4444; }
.status-text.st--cancelled{ color: #6b7280; }

`;


// role helpers
const getRole = () => {
  try {
    const token = localStorage.getItem('access');
    if (token) { const d = jwtDecode(token); if (d?.role) return String(d.role).toLowerCase(); }
  } catch { }
  return (localStorage.getItem('userRole') || 'employee').toLowerCase();
};
const canCreateTask = () => {
  const r = getRole();
  return r === 'hr' || r === 'manager' || r === 'general_manager' || localStorage.getItem('is_staff') === 'true';
};

const chipClass = (s) => {
  const v = String(s || '').toLowerCase();
  const map = {
    open: 'bm-chip bm-chip--open',
    pending: 'bm-chip bm-chip--open',
    in_progress: 'bm-chip bm-chip--open',
    success: 'bm-chip bm-chip--success',
    completed: 'bm-chip bm-chip--success',
    done: 'bm-chip bm-chip--success',
    failed: 'bm-chip bm-chip--failed',
    error: 'bm-chip bm-chip--failed',
    cancelled: 'bm-chip bm-chip--cancelled',
    canceled: 'bm-chip bm-chip--cancelled',
    closed: 'bm-chip bm-chip--success',
  };
  return map[v] || 'bm-chip';
};

// helper for colored word class
const statusTextClass = (s) => {
  const v = String(s || '').toLowerCase();
  const map = {
    open: 'st--open',
    pending: 'st--open',
    in_progress: 'st--open',
    success: 'st--success',
    completed: 'st--success',
    done: 'st--success',
    failed: 'st--failed',
    error: 'st--failed',
    cancelled: 'st--cancelled',
    canceled: 'st--cancelled',
    closed: 'st--success',
  };
  return map[v] || '';
};

// helper for word label (normalize synonyms)
const statusLabel = (s) => {
  const v = String(s || '').toLowerCase();
  if (['success', 'completed', 'done', 'closed'].includes(v)) return 'success';
  if (['open', 'pending', 'in_progress'].includes(v)) return 'open';
  if (['failed', 'error'].includes(v)) return 'failed';
  if (['cancelled', 'canceled'].includes(v)) return 'cancelled';
  return v || '';
};

export default function Tasks() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const role = useMemo(() => {
    const token = localStorage.getItem('access');
    try {
      if (token) {
        const dec = jwtDecode(token);
        return (dec.role || localStorage.getItem('userRole') || 'employee').toLowerCase();
      }
    } catch { }
    return (localStorage.getItem('userRole') || 'employee').toLowerCase();
  }, []);

  const canCreate = role === 'hr' || role === 'manager' || role === 'general_manager' || localStorage.getItem('is_staff') === 'true';

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await listTasks({ page, page_size: pageSize });
      const arr = Array.isArray(data?.results) ? data.results : (data || []);
      const sorted = arr.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setTasks(sorted);
      setCount(Number(data?.count || 0));
    } catch (e) {
      console.error('listTasks error', e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, pageSize]);

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filter !== 'all' && (t.status !== filter)) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (t.title || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
    });
  }, [tasks, filter, query]);

  return (
    <div className="min-vh-100 d-flex flex-column" style={{
      background: 'linear-gradient(180deg, #0f5132 0%, #1b4332 40%, #0b2e13 100%)'
    }}>
      <Header />

      <section className="tsk-hero">
        <div className="tsk-hero-inner">
          <div className="tsk-hero-text">
            <h1 className="tsk-hero-title">{t('tasks', { defaultValue: 'Tasks / المهام' })}</h1>
          </div>
        </div>
      </section>

      <style>{__LOCAL_UI_CSS__}</style>
      <div className="container mt-3 mb-4">
        <div className="d-flex align-items-center justify-content-between mb-4 bm-actionbar">
          <div className="d-flex gap-2">
            <input
              className="form-control bm-input"
              style={{ minWidth: 220 }}
              placeholder={t('search_placeholder') || 'Search...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Dropdown>
              <Dropdown.Toggle className="bm-btn bm-btn--outline">
                {t(`filter_${filter}`) || filter}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {['all', 'open', 'success', 'failed', 'cancelled'].map(k => (
                  <Dropdown.Item key={k} onClick={() => setFilter(k)}>
                    {t(`filter_${k}`) || k}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            {canCreate && (
              <Button variant="success" className="bm-btn bm-btn--primary me-2" onClick={() => navigate('/tasks/new')}>
                {t('create_task') || 'New Task'}
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-white py-5">{t('loading') || 'Loading...'}</div>
        ) : (
          <div className="row g-3">
            {filtered.map((task, i) => {
              // استخراج أسماء المكلّفين (recipients) بأمان من الداتا القادمة من الباك اند
              const recs = Array.isArray(task.recipients) ? task.recipients : [];
              const names = recs
                .map(r =>
                  // نحاول جميع الاحتمالات الشائعة التي قد يرسلها السيرفر
                  r?.user_name ||
                  r?.username ||
                  r?.user_username ||
                  r?.user?.username ||
                  r?.user_full_name ||
                  r?.full_name ||
                  r?.user?.full_name
                )
                .filter(Boolean);

              const assigneeLabel = names.length
                ? names.join(', ')
                : (t('unassigned') || 'Unassigned');

              // تاريخ المهمة (نفضّل created_at وإن لم يوجد نستخدم updated_at)
              const rawDate = task.created_at || task.updated_at;
              const dateLabel = rawDate
                ? new Date(rawDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                : (t('no_date') || '—');

              return (
                <div className="col-12 col-md-6 col-lg-4" key={task.id}>
                  <Card className="h-100 bm-card card-appear" style={{ borderRadius: 16, animationDelay: `${i * 0.04}s` }}>
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex align-items-start justify-content-between">
                        <Card.Title className="mb-1">{task.title}</Card.Title>
                        <span className={`status-text ${statusTextClass(task.status)}`}>{statusLabel(task.status)}</span>
                      </div>

                      {/* معلومات الموظف والتاريخ */}
                      <div className="text-muted small mb-2 d-flex flex-wrap gap-3">
                        <span title={assigneeLabel} className="text-truncate" style={{ maxWidth: 180 }}>
                          {t('assignee') || 'Assignee'}: {assigneeLabel}
                        </span>
                        <span>
                          {t('date') || 'Date'}: {dateLabel}
                        </span>
                      </div>

                      <Card.Text className="text-muted" style={{ minHeight: 48 }}>
                        {task.description || ''}
                      </Card.Text>

                      <div className="mt-auto d-flex align-items-center justify-content-between">
                        <div className="flex-grow-1 me-3">
                          <div className="progress" style={{ height: 8 }}>
                            <div
                              className="progress-bar"
                              role="progressbar"
                              style={{ width: `${task.progress_percent || 0}%` }}
                              aria-valuenow={task.progress_percent || 0}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            />
                          </div>
                          <small className="text-muted">
                            {t('progress') || 'Progress'}: {task.progress_percent || 0}%
                          </small>
                        </div>
                        <Link to={`/tasks/${task.id}`} className="bm-btn bm-btn--primary me-2">
                          {t('view') || 'View'}
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              );
            })}

            {filtered.length === 0 && !loading && (
              <div className="text-center text-white-50 py-5">{t('no_results') || 'No results'}</div>
            )}
          </div>
        )}
      </div>

      <Paginator page={page} pageSize={pageSize} count={count} onPageChange={setPage} />
      <Footer />

      <style>{`
        .tsk-hero{
          background: linear-gradient(135deg, #10c48b, #0ea36b, #0a6f47);
          color:#fff;
          padding: 18px 16px;
          text-align:center;
        }
        .tsk-hero-inner{ max-width:1100px; margin:0 auto; min-height:120px; display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .tsk-hero-title{ margin:0; font-weight:900; letter-spacing:.2px; font-size: clamp(1.6rem, 1.2rem + 1.2vw, 2.2rem); }
        @keyframes cardIn{to{opacity:1; transform:none}}
        .card-appear{opacity:0; transform: translateY(8px); animation: cardIn .45s ease forwards}
      `}</style>
    </div>
  );
}
