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
:root{--bm-g1:#10c48b;--bm-g2:#0ea36b;--bm-g3:#0a6f47;--bm-ink:#082d1f;--bm-ink2:#134233;--bm-border:color-mix(in oklab,#0b2e13 12%,#fff 88%);--space-1:.5rem;--space-2:.75rem;--space-3:1rem}
.bm-btn{display:inline-flex;align-items:center;gap:.5rem;font-weight:800;border-radius:14px;padding:.6rem .95rem;border:0;cursor:pointer;transition:transform .12s ease,box-shadow .12s ease,filter .2s ease}
.bm-btn:active{transform:translateY(1px) scale(.98)}
.bm-btn--primary{color:#fff;background:linear-gradient(135deg,var(--bm-g1),var(--bm-g2),var(--bm-g3));box-shadow:inset 0 0 0 1px rgba(255,255,255,.22),0 10px 22px rgba(0,0,0,.14)}
.bm-btn--primary:hover{filter:brightness(1.05)}
.bm-btn--outline{background:#fff;color:var(--bm-ink);border:1.5px solid color-mix(in oklab,var(--bm-g2) 70%,#fff 30%);box-shadow:0 6px 16px rgba(0,0,0,.08)}
.bm-actionbar{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;background:#fff;padding:.55rem;border-radius:14px;box-shadow:0 10px 24px rgba(0,0,0,.10);border:1px solid var(--bm-border);margin-top:var(--space-2)}
.bm-actionbar .d-flex{gap:.6rem;flex-wrap:wrap}
.bm-input{border-radius:12px !important;border:1.5px solid var(--bm-border) !important;box-shadow:none !important;padding:.58rem .8rem !important}
.bm-card{border-radius:16px;border:1px solid var(--bm-border);box-shadow:0 8px 18px rgba(0,0,0,.08);transition:transform .12s ease,box-shadow .12s ease;overflow:hidden;background:#fff}
.bm-card:hover{transform:translateY(-2px);box-shadow:0 16px 28px rgba(0,0,0,.12)}
.bm-chip{display:inline-block;padding:.25rem .55rem;border-radius:999px;font-weight:800;font-size:.8rem}
.bm-chip--open{background: color-mix(in oklab,#0ea5e9 18%,#fff 82%);color:var(--bm-ink2)}
.bm-chip--success{background: color-mix(in oklab,#22c55e 18%,#fff 82%);color:var(--bm-ink2)}
.bm-chip--failed{background: color-mix(in oklab,#ef4444 18%,#fff 82%);color:var(--bm-ink2)}
.bm-chip--cancelled{background: color-mix(in oklab,#6b7f78 18%,#fff 82%);color:var(--bm-ink2)}

/* hero — مطابق للداشبورد */
.tsk-hero{
  background:
    radial-gradient(1200px 200px at 20% -60%, rgba(255,255,255,.22), transparent 60%),
    linear-gradient(135deg, #10c48b, #0ea36b, #0a6f47);
  color:#fff;
  padding: 16px 16px;
  box-shadow: 0 8px 18px rgba(0,0,0,.12);
  animation: dashHeroIn .7s ease both;
  text-align:center;
}
.tsk-hero-inner{
  max-width:980px; margin:0 auto;
  min-height:110px;
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
}

/* انيميشن خفيف مثل الداشبورد */
@keyframes fadeInUp{ from{opacity:0; transform:translateY(12px) scale(.985)} to{opacity:1; transform:translateY(0) scale(1)} }
@keyframes dashHeroIn{ from{opacity:0; transform:translateY(-8px)} to{opacity:1; transform:translateY(0)} }

.tsk-content{ animation: fadeInUp .7s ease both; }

/* cards appear (نفس الانيميشن الخفيف) */
.card-appear{opacity:0;transform:translateY(12px) scale(.985);animation:fadeInUp .7s ease forwards}

/* progress (تبقى كما هي بصرياً) */
.progress-track{height:.4rem;border-radius:999px;background:#e5e7eb;overflow:hidden}
.progress-bar{height:100%;border-radius:999px;background:linear-gradient(90deg,#0ea5e9,#22c55e)}

/* status text colors (كما كانت) */
.status-text{font-size:.8rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
.status-text.st--open{color:#0ea5e9}
.status-text.st--success{color:#22c55e}
.status-text.st--failed{color:#ef4444}
.status-text.st--cancelled{color:#6b7f78}

/* رسبونسيف للشريط */
@media (max-width: 576px){
  .bm-actionbar{flex-direction: column;align-items: stretch;}
  .bm-actionbar > .d-flex{width:100%;flex-direction: column;align-items: stretch;gap:.5rem;}
  .bm-actionbar .bm-input{width:100%;}
  .bm-actionbar .dropdown,.bm-actionbar .bm-btn{width:100%;justify-content:center;}
}

/* ✅ Laptop/Desktop: keep search + dropdown on same row */
@media (min-width: 992px){
  .bm-actionbar{
    flex-wrap: nowrap;
  }
  .bm-actionbar .d-flex{
    flex-wrap: nowrap !important;
  }
  .bm-actionbar .bm-input{
    min-width: 320px;
    width: 320px;
  }
  .bm-actionbar .dropdown{
    flex: 0 0 auto;
  }
}


.tsk-hero-title{
  margin:0;
  font-weight:900;
  letter-spacing:.2px;
  text-shadow: 0 2px 10px rgba(0,0,0,.25);
  font-size: clamp(1.6rem, 1.2rem + 1.2vw, 2.2rem);
}

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

// ✅ helper لاختيار أول قيمة رقمية صالحة (نفضّل progress_percentage)
const getNumericProgress = (task) => {
  const candidates = [
    task.progress_percentage,
    task.progress,
    task.progress_percent,
    task.completion_percentage,
  ];

  for (const v of candidates) {
    if (v === undefined || v === null) continue;
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
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
      style={{ backgroundColor: '#f8f9fa' }}
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

      <div className="container py-3 tsk-content">

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
          <div className="text-center text-muted py-5">

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

              // ✅ نستخدم الآن helper يفضّل progress_percentage
              const rawProgress = getNumericProgress(task);
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
                <div className="text-center text-muted py-5">

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


