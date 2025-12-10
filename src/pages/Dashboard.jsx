import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import CheckTimestampInline from '../components/CheckTimestampInline';
import Footer from '../components/Footer';
import Header from '../components/Header';
import ModelTable from '../components/ModelTable';

const __LOCAL_UI_CSS__ = `
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
.bm-chip{display:inline-block;padding:.25rem .55rem;border-radius:999px;font-weight:800;font-size:.8rem}
.bm-chip--open{background: color-mix(in oklab,#0ea5e9 18%,#fff 82%);color:var(--bm-ink2)}
.bm-chip--success{background: color-mix(in oklab,#22c55e 18%,#fff 82%);color:var(--bm-ink2)}
.bm-chip--failed{background: color-mix(in oklab,#ef4444 18%,#fff 82%);color:var(--bm-ink2)}
.bm-chip--cancelled{background: color-mix(in oklab,#6b7f78 18%,#fff 82%);color:var(--bm-ink2)}
`;

function Dashboard() {
  const { t, i18n } = useTranslation();
  const [sections, setSections] = useState([]);
  const [forms, setForms] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // يظهر زر الإشعار لـ HR / Manager فقط
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();

  // الشكاوى (تبقى كما هي)
  useEffect(() => {
    const fetchComplaints = async () => {
      const role = (localStorage.getItem('userRole') || '').toLowerCase();
      const token = localStorage.getItem('access');
      let endpoint = '';

      if (role === 'employee') endpoint = '/api/complaints/my_complaints/';
      else if (role === 'hr') endpoint = '/api/complaints/hr_complaints/';
      else if (role === 'manager') endpoint = '/api/complaints/manager_complaints/';
      else return;

      try {
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = response?.data;
        setComplaints(Array.isArray(d?.results) ? d.results : (d || []));
      } catch (error) {
        console.error('Error fetching complaints:', error);
      }
    };
    fetchComplaints();
  }, []);

  // الأقسام + النماذج + هوية المستخدم
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access');
        if (!token) { console.warn('No access token found'); return; }

        const [secRes, formRes, userRes] = await Promise.all([
          axios.get('/api/sections/?page_size=1000', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/forms/?page_size=1000', {headers: { Authorization: `Bearer ${token}` },}),

          axios.get('/api/current-user/', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setSections(Array.isArray(secRes?.data?.results) ? secRes.data.results : (secRes?.data || []));
        setForms(Array.isArray(formRes?.data?.results) ? formRes.data.results : (formRes?.data || []));

        // ✅ تحديد الإدارة حسب الدور (hr/manager)، لا نعتمد على is_staff
        const roleFromApi = (userRes?.data?.role || userRes?.data?.userRole || '').toLowerCase();
        const roleFromLocal = (localStorage.getItem('userRole') || '').toLowerCase();
        const role = roleFromApi || roleFromLocal;
        setIsAdmin(role === 'hr' || role === 'manager');

        if (secRes.data.length > 0) setActiveSection(secRes.data[0].id);
      } catch (error) {
        console.error('❌ فشل تحميل البيانات:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTabClick = (sectionId) => setActiveSection(sectionId);
  const filteredForms = forms.filter(f => f.section && String(f.section.id) === String(activeSection));

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Header t={t} i18n={i18n} />

      {/* Hero أقل ارتفاعًا والنص في الوسط */}
      <section className="dash-hero">
        <div className="dash-hero-inner">
          <h1 className="dash-title">{t('dashboard_title')}</h1>
        </div>
      </section>

      <main className="flex-grow-1">
        <style>{__LOCAL_UI_CSS__}</style>
        <div className="container py-3 dash-content">
          {/* شريط علوي — زر إضافة إشعار محسّن بصريًا */}
          <div className="d-flex justify-content-between align-items-center mb-4 cmp-headbar">
            {isAdmin && (
              <>
                <button
                  className="bm-btn bm-btn--primary me-2"
                  onClick={() => navigate('/admin-notify')}
                  aria-label={t('add_notification', { defaultValue: 'Add notification' })}
                  title={t('add_notification', { defaultValue: 'Add notification' })}
                >
                  {/* أيقونة جرس + علامة إضافة (SVG خفيف) */}
                  <svg className="ic" width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M12 22a2.1 2.1 0 0 0 2.1-2.1h-4.2A2.1 2.1 0 0 0 12 22Zm6.3-6.3v-4.2c0-3.066-1.641-5.628-4.5-6.318V4.8a1.8 1.8 0 0 0-3.6 0v.382c-2.859.69-4.5 3.252-4.5 6.318v4.2L4.2 17.7v1.2h15.6v-1.2l-1.5-1.5ZM13 8.4v2.4h2.4v1.8H13v2.4h-1.8v-2.4H8.8v-1.8h2.4V8.4H13Z"
                    />
                  </svg>
                  <span className="txt">{t('add_notification', { defaultValue: 'Add notification' })}</span>
                </button>

                {/* زر التحقق */}
                <CheckTimestampInline />
              </>
            )}
          </div>


          {loading ? (
            <div className="text-center">{t('loading')}</div>
          ) : (
            <>
              {/* Tabs */}
              <ul className="nav nav-tabs mb-4 flex-wrap justify-content-center dash-tabs">
                {sections.map((section, idx) => (
                  <li className="nav-item" key={section.id} style={{ animationDelay: `${0.06 * idx}s` }}>
                    <button
                      className={`nav-link ${section.id === activeSection ? 'active' : ''}`}
                      onClick={() => handleTabClick(section.id)}
                    >
                      {i18n.language === 'ar' ? section.name_ar : section.name_en}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Table */}
              <div className="dash-card">
                <ModelTable forms={filteredForms} t={t} i18n={i18n} />
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />

      <style>{`
        .dash-hero{
          direction:ltr;
          background:
            radial-gradient(1200px 200px at 20% -60%, rgba(255,255,255,.22), transparent 60%),
            linear-gradient(135deg, #10c48b, #0ea36b, #0a6f47);
          color:#fff;
          padding: 16px 16px;
          box-shadow: 0 8px 18px rgba(0,0,0,.12);
          animation: dashHeroIn .7s ease both;
        }
        .dash-hero-inner{
          max-width:980px; margin:0 auto;
          min-height:110px;
          display:flex; flex-direction:column;
          align-items:center; justify-content:center;
          text-align:center;
        }
        .dash-title{ margin:0; font-size:1.9rem; font-weight:900; text-shadow:0 1px 0 rgba(0,0,0,.12); }
        .dash-subtitle{ margin:6px 0 0; opacity:.96; }

        .dash-content{
          direction:ltr;
          margin-top:10px;
          animation: fadeInUp .7s ease both;
        }

        /* ===== زر إضافة إشعار (احترافي ومتناسق مع الهوية) ===== */
        .dash-action{
          display:inline-flex; align-items:center; gap:10px;
          padding:10px 14px;
          border:none; cursor:pointer; border-radius:14px;
          color:#fff; font-weight:900; letter-spacing:.2px;
          background:
            linear-gradient(135deg, #10c48b, #0ea36b);
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,.22),
            0 10px 22px rgba(0,0,0,.16);
          backdrop-filter: blur(4px) saturate(120%);
          -webkit-backdrop-filter: blur(4px) saturate(120%);
          transition: transform .12s ease, box-shadow .12s ease, filter .12s ease, opacity .12s ease;
        }
        .dash-action:hover{
          transform: translateY(-1px);
          box-shadow: 0 14px 28px rgba(0,0,0,.18), inset 0 0 0 1px rgba(255,255,255,.26);
          filter: saturate(112%);
        }
        .dash-action:active{ transform: translateY(0); opacity:.95; }
        .dash-action .ic{ display:block; opacity:.96; }
        .dash-action .txt{ display:inline-block; }

        .dash-tabs > li{ animation: fadeInUp .7s ease both; }
        .dash-card{
          background:#fff; border-radius:14px; padding:12px 10px;
          box-shadow:0 6px 18px rgba(0,0,0,.08);
          border:1px solid rgba(0,0,0,.05);
          animation: fadeInUp .7s ease both; animation-delay:.18s;
        }

        @keyframes fadeInUp{ from{opacity:0; transform:translateY(12px) scale(.985)} to{opacity:1; transform:translateY(0) scale(1)} }
        @keyframes dashHeroIn{ from{opacity:0; transform:translateY(-8px)} to{opacity:1; transform:translateY(0)} }

        @media (max-width:560px){
          .dash-hero{ padding:14px; }
          .dash-title{ font-size:1.6rem; }
          .dash-action{ padding:9px 12px; border-radius:12px; }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;

