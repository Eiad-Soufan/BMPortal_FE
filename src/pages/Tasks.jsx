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

const __LOCAL_UI_CSS__ = `
:root{--bm-g1:#10c48b;--bm-g2:#0ea36b;--bm-g3:#0a6f47;--bm-ink:#0b2e13;--bm-bg:#02140c;--bm-card:#f9fafb;--bm-muted:#6b7280;--bm-radius:1rem;--bm-radius-sm:.75rem;--space-1:.5rem;--space-2:.75rem;--space-3:1rem}
.bm-btn{display:inline-flex;align-items:center;gap:.5rem;font-weight:700;border-radius:999px;padding:.45rem .9rem;border:1.5px solid transparent;font-size:.9rem;letter-spacing:.02em;cursor:pointer;transition:transform .12s ease,box-shadow .12s ease,filter .2s ease}
.bm-btn:active{transform:translateY(1px) scale(.98)}
.bm-btn--primary{color:#fff;background:linear-gradient(135deg,var(--bm-g1),var(--bm-g2),var(--bm-g3));box-shadow:0 10px 24px rgba(0,0,0,.32)}
.bm-btn--primary:hover{filter:brightness(1.03);box-shadow:0 14px 30px rgba(0,0,0,.4)}
.bm-btn--outline{background:rgba(255,255,255,.08);color:#ecfdf5;border-color:rgba(255,255,255,.45);box-shadow:0 8px 20px rgba(0,0,0,.26)}
.bm-btn--outline:hover{background:rgba(255,255,255,.16);filter:brightness(1.04)}
.bm-input{border-radius:999px;border:1.5px solid rgba(255,255,255,.56);background:rgba(255,255,255,.12);color:#f9fafb;padding:.45rem .9rem;font-size:.9rem;min-width:220px}
.bm-input::placeholder{color:rgba(226,232,240,.7)}
.bm-input:focus{outline:none;border-color:#a7f3d0;box-shadow:0 0 0 1px rgba(45,212,191,.7)}
.bm-card{border:none;background:radial-gradient(circle at top left,#ffffff 0,#f9fafb 38%,#f3f4f6 100%);box-shadow:0 18px 45px rgba(15,23,42,.22);border-radius:var(--bm-radius);position:relative;overflow:hidden}
.bm-card::before{content:"";position:absolute;inset:-40%;background:radial-gradient(circle at 0 0,rgba(16,196,139,.11),transparent 56%),radial-gradient(circle at 100% 0,rgba(14,163,107,.09),transparent 58%);opacity:.9;mix-blend-mode:multiply;pointer-events:none}
.bm-card > .card-body{position:relative;z-index:1}
.status-chip{display:inline-flex;align-items:center;gap:.35rem;border-radius:999px;padding:.15rem .55rem;font-size:.72rem;font-weight:700;border:1px solid transparent;background:rgba(248,250,252,.5);box-shadow:0 8px 18px rgba(15,23,42,.12)}
.status-dot{width:.6rem;height:.6rem;border-radius:999px;box-shadow:0 0 0 1px rgba(15,23,42,.12)}
.task-meta{font-size:.8rem;color:var(--bm-muted)}
.progress-track{height:.4rem;border-radius:999px;background:#e5e7eb;overflow:hidden}
.progress-bar{height:100%;border-radius:999px;background:linear-gradient(90deg,#0ea5e9,#22c55e)}
.status-chip--open{border-color:#0ea5e9;color:#0369a1;background:rgba(219,234,254,.9)}
.status-chip--success{border-color:#22c55e;color:#166534;background:rgba(220,252,231,.9)}
.status-chip--failed{border-color:#ef4444;color:#991b1b;background:rgba(254,226,226,.9)}
.status-chip--cancelled{border-color:#6b7280;color:#374151;background:rgba(243,244,246,.95)}
.bm-actionbar{display:flex;flex-wrap:wrap;gap:.5rem}
.bm-actionbar .d-flex{gap:.5rem}
.status-text{font-size:.8rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
.status-text.st--open{color:#0ea5e9}
.status-text.st--success{color:#22c55e}
.status-text.st--failed{color:#ef4444}
.status-text.st--cancelled{color:#6b7280}

/* ✅ رسبونسيف لشريط الأدوات في الموبايل */
@media (max-width: 576px){
  .bm-actionbar{
    flex-direction: column;
    align-items: stretch;
  }
  .bm-actionbar > .d-flex{
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  .bm-actionbar .bm-input{
    min-width: 0 !important;
    width: 100%;
  }
  .bm-actionbar .dropdown,
  .bm-actionbar .bm-btn{
    width: 100%;
    justify-content: center;
  }
}

/* hero */
.tsk-hero{
  background:linear-gradient(135deg,#10c48b,#0ea36b,#0a6f47);
  color:#fff;
  padding:18px 16px;
  text-align:center;
}
.tsk-hero-inner{max-width:1100px;margin:0 auto;min-height:96px;display:flex;align-items:center;justify-content:center;flex-direction:column}
.tsk-hero-title{margin:0;font-weight:900;letter-spacing:.2px;font-size:clamp(1.6rem,1.2rem + 1.2vw,2.2rem)}
@keyframes cardIn{to{opacity:1;transform:none}}
.card-appear{opacity:0;transform:translateY(8px);animation:cardIn .45s ease forwards}
`;

// role helpers
const getRole = () => {
  try {
    const token = localStorage.getItem('access');
    if (token) {
      const d = jwtDecode(token);
      if (d?.role) return String(d.role).toLowerCase();
    }
  } catch {}
  return (localStorage.getItem('userRole') || 'employee').toLowerCase();
};

const canCreateTask = () => {
  const r = getRole();
  return (
    r === 'hr' ||
    r === 'manager' ||
    r === 'general_manager' ||
    localStorage.getItem('is_staff') === 'true'
  );
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
  return map[v] || '';
};

// helper for word label (normalize synonyms)
const statusLabel = (s) => {
  const v = String(s || '').toLowerCase();
  if (['success', 'completed', 'done', 'closed'].includes(v)) {
    return 'DONE';
  }
  if (['failed', 'error'].includes(v)) {
    return 'FAILED';
  }
  if (['cancelled', 'canceled'].includes(v)) {
    return 'CANCELLED';
  }
  return 'OPEN';
};

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

export default function Tasks() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const role = useMemo(() => {
    const token = localStorage.getItem('access');
    try {
      if (token) {
        const dec = jwtDecode(token);
        return (dec.role || localStorage.getItem('userRole') || 'employee').toLowerCase();
      }
    } catch {}
    return (localStorage.getItem('userRole') || 'employee').toLowerCase();
  }, []);

  const canCreate =
    role === 'hr' ||
    role === 'manager' ||
    role === 'general_manager' ||
    localStorage.getItem('is_staff') === 'true';

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await listTasks({ page, page_size: pageSize });
      const arr = Array.isArray(data?.results) ? data.results : data || [];
      const sorted = arr
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setTasks(sorted);
      setCount(Number(data?.count || 0));
    } catch (e) {
      console.error('listTasks error', e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const filtered = tasks.filter((task) => {
    const status = String(task.status || '').toLowerCase();
    const isOpen =
      status === 'open' ||
      status === 'pending' ||
      status === 'in_progress';

    const isSuccess =
      status === 'success' ||
      status === 'completed' ||
      status === 'done' ||
      status === 'closed';

    const isFailed = status === 'failed' || status === 'error';
    const isCancelled = status === 'cancelled' || status === 'canceled';

    if (filter === 'open' && !isOpen) return false;
    if (filter === 'success' && !isSuccess) return false;
    if (filter === 'failed' && !isFailed) return false;
    if (filter === 'cancelled' && !isCancelled) return false;

    if (query) {
      const q = query.toLowerCase();
      const haystack = `${task.title || ''} ${task.description || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{
        background:
          'linear-gradient(180deg, #0f5132 0%, #1b4332 40%, #0b2e13 100%)',
      }}
    >
      <Header />

      <section className="tsk-hero">
        <div className="tsk-hero-inner">
          <div className="tsk-hero-text">
            <h1 className="tsk-hero-title">
              {t('tasks', { defaultValue: 'Tasks / المهام' })}
            </h1>
          </div>
        </div>
      </section>

      <style>{__LOCAL_UI_CSS__}</style>

      <div className="container mt-3 mb-4">
        {/* شريط الأدوات: بحث + فلتر + زر إضافة مهمة */}
        <div className="d-flex align-items-center justify-content-between mb-4 bm-actionbar">
          <div className="d-flex">
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
                {['all', 'open', 'success', 'failed', 'cancelled'].map((k) => (
                  <Dropdown.Item key={k} onClick={() => setFilter(k)}>
                    {t(`filter_${k}`) || k}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            {canCreate && (
              <Button
                variant="success"
                className="bm-btn bm-btn--primary me-2"
                onClick={() => navigate('/tasks/new')}
              >
                {t('create_task') || 'New Task'}
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center text-white py-5">
            {t('loading') || 'Loading...'}
          </div>
        ) : (
          <div className="row g-3">
            {filtered.map((task, i) => {
              const recs = Array.isArray(task.recipients)
                ? task.recipients
                : [];

              const names = recs
                .map((r) =>
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
                : t('unassigned') || 'Unassigned';

              const rawDate = task.created_at || task.updated_at;
              const dateLabel = rawDate
                ? new Date(rawDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : t('no_date') || '—';

              const rawProgress = Number(task.progress || task.progress_percentage || 0);
              const progress =
                Number.isFinite(rawProgress) && rawProgress >= 0 && rawProgress <= 100
                  ? rawProgress
                  : 0;

              return (
                <div className="col-12 col-md-6 col-lg-4" key={task.id}>
                  <Card
                    className="h-100 bm-card card-appear"
                    style={{ borderRadius: 16, animationDelay: `${i * 0.04}s` }}
                  >
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex align-items-start justify-content-between">
                        <Card.Title className="mb-1">{task.title}</Card.Title>
                        <span
                          className={`status-text ${statusTextClass(task.status)}`}
                        >
                          {statusLabel(task.status)}
                        </span>
                      </div>

                      <div className="text-muted small mb-2 d-flex flex-wrap gap-3">
                        <span
                          title={assigneeLabel}
                          className="text-truncate"
                          style={{ maxWidth: 180 }}
                        >
                          {t('assignee') || 'Assignee'}: {assigneeLabel}
                        </span>
                        <span>
                          {t('date') || 'Date'}: {dateLabel}
                        </span>
                      </div>

                      <div className="mb-2 small text-muted">
                        {task.description || t('no_description') || 'No description'}
                      </div>

                      <div className="mt-auto">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <span className="task-meta">
                            {t('progress') || 'Progress'}: {progress.toFixed(2)}%
                          </span>
                          <span
                            className={chipClass(task.status)}
                            style={{ fontSize: '.7rem' }}
                          >
                            <span className="status-dot" />
                            {statusLabel(task.status)}
                          </span>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-bar"
                            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
                          />
                        </div>

                        <div className="mt-3 text-end">
                          <Link
                            to={`/tasks/${task.id}`}
                            className="btn btn-success btn-sm rounded-pill px-3 fw-bold"
                          >
                            {t('view') || 'View'}
                          </Link>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              );
            })}

            {!loading && filtered.length === 0 && (
              <div className="col-12">
                <div className="text-center text-white-50 py-5">
                  {t('no_tasks') || 'No tasks found.'}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="d-flex justify-content-center mt-4">
          <Paginator
            count={count}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
