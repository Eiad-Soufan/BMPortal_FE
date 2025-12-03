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
const __LOCAL_UI_CSS__

  = `
  .sv-hero{
    background: linear-gradient(135deg,#10c48b,#0ea36b,#0a6f47); color:#fff;
    padding: 18px 16px; text-align:center;
  }
  .sv-hero-inner{ max-width:1100px; margin:0 auto; min-height:120px; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .sv-hero-title{ margin:0; font-weight:900; letter-spacing:.2px; font-size: clamp(1.6rem,1.2rem + 1.2vw,2.2rem); }

  .bm-card{border-radius:16px;border:1px solid color-mix(in oklab,#0b2e13 12%,#fff 88%);box-shadow:0 8px 18px rgba(0,0,0,.08);transition:transform .12s ease,box-shadow .12s ease;overflow:hidden}
  .bm-card:hover{transform:translateY(-2px);box-shadow:0 16px 28px rgba(0,0,0,.12)}
  @keyframes cardIn{to{opacity:1; transform:none}}
  .card-appear{opacity:0; transform: translateY(8px); animation: cardIn .45s ease forwards}

  .sv-status{ font-weight:800; letter-spacing:.3px; text-transform:uppercase }
  .sv-status.published{ color:#22c55e }
  .sv-status.draft{ color:#0ea5e9 }
  .sv-status.archived{ color:#6b7280 }

  .bm-btn{
    display:inline-flex; align-items:center; justify-content:center;
    border:0; border-radius:999px; font-weight:700;
    padding:.5rem .9rem; box-shadow:0 4px 12px rgba(0,0,0,.12);
    transition:transform .12s ease, box-shadow .12s ease, filter .18s ease;
  }
  .bm-btn--sm{ padding:.35rem .7rem; font-size:.85rem; }
  .bm-btn:active{ transform:translateY(1px) scale(.98); }
  .bm-btn:disabled{ opacity:.6; cursor:not-allowed; box-shadow:none; }
  .bm-btn--primary{ color:#fff; background:linear-gradient(135deg,#10c48b,#0ea36b,#0a6f47); }
  .bm-btn--primary:hover{ filter:brightness(1.05); }
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
    <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(180deg, #0f5132 0%, #1b4332 40%, #0b2e13 100%)' }}>
      <Header />

      <section className="sv-hero">
        <div className="sv-hero-inner">
          <h1 className="sv-hero-title">{t('surveys') || 'Surveys / الاستبيانات'}</h1>
        </div>
      </section>

      <style>{__LOCAL_UI_CSS__}</style>
      <div className="container mt-3 mb-4">
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
          <div className="text-center text-white py-5">{t('loading') || 'Loading...'}</div>
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
              <div className="text-center text-white-50 py-5">{t('no_results') || 'No results'}</div>
            )}
          </div>
        )}
      </div>

      <Paginator page={page} pageSize={pageSize} count={count} onPageChange={setPage} />
      <Footer />
    </div>
  );
}
