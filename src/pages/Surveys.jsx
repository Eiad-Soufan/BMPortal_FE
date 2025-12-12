// src/pages/Surveys.jsx
import { jwtDecode } from 'jwt-decode';
import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { listSurveys } from '../api/surveys';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Paginator from '../components/Paginator';

const __LOCAL_UI_CSS__ = `
:root{--bm-g1:#10c48b;--bm-g2:#0ea36b;--bm-g3:#0a6f47;--bm-ink:#082d1f;--bm-ink2:#134233;--bm-border:color-mix(in oklab,#0b2e13 12%,#fff 88%);--space-2:.75rem}

/* مهم جداً: لا نحدد font-family هنا حتى يبقى نفس خط الداشبورد */
.srv-hero{
  background:
    radial-gradient(1200px 200px at 20% -60%, rgba(255,255,255,.22), transparent 60%),
    linear-gradient(135deg, #10c48b, #0ea36b, #0a6f47);
  color:#fff;
  padding: 16px 16px;
  box-shadow: 0 8px 18px rgba(0,0,0,.12);
  animation: dashHeroIn .7s ease both;
  text-align:center;
}
.srv-hero-inner{
  max-width:980px; margin:0 auto;
  min-height:110px;              /* ✅ نفس ارتفاع الداشبورد */
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
}

/* انيميشن خفيف مثل الداشبورد */
@keyframes fadeInUp{ from{opacity:0; transform:translateY(12px) scale(.985)} to{opacity:1; transform:translateY(0) scale(1)} }
@keyframes dashHeroIn{ from{opacity:0; transform:translateY(-8px)} to{opacity:1; transform:translateY(0)} }

.srv-content{ animation: fadeInUp .7s ease both; }

.bm-actionbar{
  display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;
  background:#fff;padding:.55rem;border-radius:14px;
  box-shadow:0 10px 24px rgba(0,0,0,.10);
  border:1px solid var(--bm-border);
  margin-top:var(--space-2)
}
.bm-input{
  border-radius:12px !important;border:1.5px solid var(--bm-border) !important;
  box-shadow:none !important;padding:.58rem .8rem !important
}
.bm-card{
  border-radius:16px;border:1px solid var(--bm-border);
  box-shadow:0 8px 18px rgba(0,0,0,.08);
  transition:transform .12s ease,box-shadow .12s ease;
  overflow:hidden;background:#fff
}
.bm-card:hover{transform:translateY(-2px);box-shadow:0 16px 28px rgba(0,0,0,.12)}
.card-appear{opacity:0;transform:translateY(12px) scale(.985);animation:fadeInUp .7s ease forwards}

@media (max-width: 576px){
  .bm-actionbar{flex-direction: column;align-items: stretch;}
  .bm-actionbar > .d-flex{width:100%;flex-direction: column;align-items: stretch;gap:.5rem;}
  .bm-actionbar .bm-input{width:100%;}
  .bm-actionbar .dropdown{width:100%;}
}
`;



const getRole = () => {
  try {
    const token = localStorage.getItem('access');
    if (token) { const d = jwtDecode(token); if (d?.role) return String(d.role).toLowerCase(); }
  } catch { }
  return (localStorage.getItem('userRole') || 'employee').toLowerCase();
};

export default function Surveys() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const role = useMemo(getRole, []);
  const canCreate = role === 'hr' || role === 'manager';

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const data = await listSurveys({ page, page_size: pageSize });
        // API يعيد بحسب الدور أصلاً؛ نرتب الأحدث أولاً
        const arr = Array.isArray(data?.results) ? data.results : (data || []);
        const sorted = arr.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setItems(sorted);
        setCount(Number(data?.count || 0));
      } catch (e) {
        console.error('listSurveys error', e?.response?.data || e.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [page, pageSize]);

  const filtered = items.filter(sv => {
    if (statusFilter !== 'all' && sv.status !== statusFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!((sv.title || '').toLowerCase().includes(q) || (sv.description || '').toLowerCase().includes(q))) return false;
    }
    return true;
  });

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: "#f8f9fa" }}>

      <Header />

      <div className="srv-hero">
        <div className="srv-hero-inner">
          <h1 className="m-0 fw-bold">{t('surveys') || 'Surveys / الاستبيانات'}</h1>
        </div>
      </div>

      <style>{__LOCAL_UI_CSS__}</style>
      <div className="container py-3 srv-content">

        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex gap-2">
            <input
              className="form-control"
              style={{ minWidth: 220, borderRadius: 12, border: '1.5px solid color-mix(in oklab,#0b2e13 12%,#fff 88%)' }}
              placeholder={t('search_placeholder') || 'Search...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Dropdown>
              <Dropdown.Toggle className="bm-btn bm-btn--primary bm-btn--sm">
                {t(`filter_${statusFilter}`) || statusFilter}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {['all', 'draft', 'published', 'archived'].map(k => (
                  <Dropdown.Item key={k} onClick={() => setStatusFilter(k)}>
                    {t(`filter_${k}`) || k}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {canCreate && (
            <Button className="bm-btn bm-btn--primary bm-btn--sm" onClick={() => navigate('/surveys/new')}>
              {t('create_survey') || 'New Survey'}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center text-muted py-5">{t('loading') || 'Loading...'}</div>
        ) : (
          <div className="row g-3">
            {filtered.map((sv, i) => (
              <div className="col-12 col-md-6 col-lg-4" key={sv.id}>
                <Card className="h-100 bm-card card-appear" style={{ animationDelay: `${i * 0.04}s` }}>
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex align-items-start justify-content-between">
                      <Card.Title className="mb-1">{sv.title}</Card.Title>
                      <span className={`sv-status ${sv.status}`}>{sv.status}</span>
                    </div>
                    <Card.Text className="text-muted" style={{ minHeight: 48 }}>
                      {sv.description || ''}
                    </Card.Text>
                    <div className="mt-auto d-flex align-items-center justify-content-between">
                      <small className="text-muted">
                        {t('created_at') || 'Created'}: {new Date(sv.created_at).toLocaleDateString()}
                      </small>
                      <Link to={`/surveys/${sv.id}`} className="bm-btn bm-btn--primary bm-btn--sm">
                        {t('view') || 'View'}
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))}
            {filtered.length === 0 && !loading && (
              <div className="text-center text-muted-50 py-5">{t('no_results') || 'No results'}</div>
            )}
          </div>
        )}
      </div>

      <Paginator page={page} pageSize={pageSize} count={count} onPageChange={setPage} />
      <Footer />
    </div>
  );
}

