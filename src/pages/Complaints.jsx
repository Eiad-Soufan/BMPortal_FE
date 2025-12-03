import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Form, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Paginator from "../components/Paginator";
// src/pages/Complaints.jsx
// ✅ تعديل المطلوب فقط:
// 1) زر الرجوع → إلى الداشبورد.
// 2) إضافة الهيدر والفوتر.
// ⚠️ لا تغييرات وظيفية على الاستدعاءات أو المنطق.

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

/* Animations */
.bm-fadein{animation:bmFade .45s ease both}
@keyframes bmFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* Task status color accents */
.bm-card--open{border-inline-start:6px solid #0ea5e9}
.bm-card--success{border-inline-start:6px solid #22c55e}
.bm-card--failed{border-inline-start:6px solid #ef4444}
.bm-card--cancelled{border-inline-start:6px solid #6b7f78}

/* Progress bar polish */
.progress{height:8px;border-radius:999px; overflow:hidden; background: rgba(0,0,0,.06)}
.progress .progress-bar{transition: width .3s ease}
`;


function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [count, setCount] = useState(0);
  const [reply, setReply] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBlockedAlert, setShowBlockedAlert] = useState(false);
  const { t, i18n } = useTranslation();

  const userRole = localStorage.getItem('userRole'); // 'employee' | 'manager' | 'hr'
  const navigate = useNavigate();

  // حدّد مسار الجلب بحسب الدور (بدون تعديل)
  const endpointRef = useRef('');
  if (userRole === 'employee') endpointRef.current = '/api/complaints/my_complaints/';
  else if (userRole === 'hr') endpointRef.current = '/api/complaints/hr_complaints/';
  else if (userRole === 'manager') endpointRef.current = '/api/complaints/manager_complaints/';

  const fetchComplaints = async () => {
    if (!endpointRef.current) return;
    const token = localStorage.getItem('access');
    const res = await axios.get(endpointRef.current, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, page_size: pageSize }
    });
    const data = res.data;
    setComplaints(Array.isArray(data?.results) ? data.results : (data || []));
    setCount(Number(data?.count || 0));
  };

  // تحميل أولي + تحديث دوري وعلى تركيز النافذة (بدون تعديل)
  useEffect(() => {
    (async () => { await fetchComplaints(); })();
    const id = setInterval(fetchComplaints, 10000);
    const onFocus = () => fetchComplaints();
    const onVis = () => { if (!document.hidden) fetchComplaints(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, page, pageSize]);

  // تعليم شكوى كمقروءة عند فتح التفاصيل (بدون تعديل)
  const markSeen = async (id) => {
    try {
      await axios.post(`/api/complaints/${id}/mark_seen/`);
    } catch (e) {
      // صامت
    }
  };

  const handleSelect = async (complaint) => {
    setSelectedComplaint(complaint);
    setShowModal(true);
    await markSeen(complaint.id);
    await fetchComplaints();
  };

  const handleReplySubmit = async () => {
    if (!selectedComplaint) return;
    const endpoint = `/api/complaints/${selectedComplaint.id}/${userRole}_reply/`; // hr_reply | manager_reply
    await axios.post(endpoint, { response: reply });
    setShowModal(false);
    setReply('');
    await fetchComplaints();
  };

  const handleSubmitComplaint = () => {
    if (userRole !== 'employee') {
      setShowBlockedAlert(true);
      return;
    }
    navigate('/submit-complaint'); // كما هو
  };

  // منطق النقطة الحمراء كما هو
  const isUnreadForMe = (c) => {
    if (userRole === 'employee') {
      return c.is_responded && !c.is_seen_by_employee;
    }
    if (userRole === 'manager' || userRole === 'hr') {
      return !c.is_seen_by_recipient;
    }
    return false;
  };

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      {/* ✅ الهيدر */}
      <Header />

      <section className="cmp-hero">
        <div className="cmp-hero-inner">
          <div className="cmp-hero-text">
            <h1 className="cmp-hero-title">{t('complaints', { defaultValue: 'complaints' })}</h1>
          </div>
          {(localStorage.getItem('userRole') === 'employee') && (
            <button
              onClick={() => navigate('/submit-complaint')}
              className="bm-btn bm-btn--primary me-2"
              style={{ border: '1px solid rgba(255,255,255,.6)' }}
            >
              {t('add_complaint', { defaultValue: 'New Complaint' })}
            </button>
          )}
        </div>
      </section>


      <main className="flex-grow-1">
        <style>{__LOCAL_UI_CSS__}</style>
        <div className="container mt-3 mb-4 complaints-ui">
          {/* شريط العنوان + زر الرجوع (إلى الداشبورد) */}
          <div className="d-flex align-items-center gap-2 mb-4 bm-actionbar">
            <Button className="bm-btn bm-btn--primary me-2" onClick={handleSubmitComplaint}>
              {t('submitnewcomplain', { defaultValue: 'submit new complain' })}
            </Button>
          </div>

          {showBlockedAlert && (
            <Alert variant="warning" onClose={() => setShowBlockedAlert(false)} dismissible className="cmp-alert">
              {t('submit_complain_error', { defaultValue: 'submit_complain_error' })}
            </Alert>
          )}

          {complaints.length === 0 ? (
            <div className="text-center text-muted py-5 cmp-emptybox">
              <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
              <p className="mt-2">No complaints to display at the moment.</p>
            </div>
          ) : (
            complaints.map((c, i) => (
              <Card
                key={c.id}
                className="mb-4 position-relative bm-card"
                role="button"
                onClick={() => handleSelect(c)}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <Card.Body>
                  <Card.Title className="position-relative cmp-card-title">
                    {c.title}
                    {isUnreadForMe(c) && (
                      <span
                        className="position-absolute translate-middle p-1 bg-danger border border-light rounded-circle notif-dot"
                        style={{ top: 0, right: 0 }}
                      >
                        <span className="visually-hidden">New</span>
                      </span>
                    )}
                  </Card.Title>

                  <Card.Subtitle className="text-muted cmp-sub">
                    {(userRole === 'manager' || userRole === 'hr') && <>From: {c.sender_username}<br /></>}
                    Sent to: {c.recipient_display} | {new Date(c.created_at).toLocaleString()}
                  </Card.Subtitle>

                  {c.is_responded && (
                    <div className="mt-2">
                      <strong>Response:</strong>{' '}
                      <span className="text-muted">
                        {(c.response || '').slice(0, 140)}{(c.response || '').length > 140 ? '…' : ''}
                      </span>
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))
          )}

          {/* Modal التفاصيل (بدون تغيير وظيفي) */}
          <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered contentClassName="cmp-modal">
            <Modal.Header closeButton className="cmp-modal-head">
              <Modal.Title>Complaint Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p><strong>Title:</strong> {selectedComplaint?.title}</p>
              <p className="mb-2"><strong>Message:</strong></p>
              <div className="p-2 border rounded bg-light cmp-msg">{selectedComplaint?.message}</div>

              {selectedComplaint?.is_responded ? (
                <>
                  <hr />
                  <p className="mb-2"><strong>Response:</strong></p>
                  <div className="p-2 border rounded bg-white cmp-resp">{selectedComplaint?.response}</div>
                </>
              ) : (userRole !== 'employee') && (
                <>
                  <hr />
                  <Form.Group className="mb-4">
                    <Form.Label>Write Response</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                    />
                  </Form.Group>
                </>
              )}
            </Modal.Body>
            <Modal.Footer className="cmp-modal-foot">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
              {(!selectedComplaint?.is_responded && userRole !== 'employee') && (
                <Button variant="primary" className="bm-btn bm-btn--primary me-2" onClick={handleReplySubmit}>Send Reply</Button>
              )}
            </Modal.Footer>
          </Modal>
        </div>

        <Paginator page={page} pageSize={pageSize} count={count} onPageChange={setPage} />
      </main>

      {/* ✅ الفوتر */}
      <Footer />

      {/* ===== Styles: تصميم فقط ===== */}
      <style>{`
        :root{
          --g1:#10c48b; --g2:#0ea36b; --g3:#0a6f47;
          --ink:#063b28; --ink2:#1b4d3a;
          --danger:#e75162;
        }

        /* خلفية خفيفة وحواف ناعمة لعناصر الصفحة */
        .complaints-ui{
          animation: fadePage .5s ease both;
        }

        /* شريط أعلى أنيق */
        .cmp-headbar{
          padding: 10px 12px;
          background:
            radial-gradient(800px 140px at 20% -80%, rgba(255,255,255,.22), transparent 60%),
            linear-gradient(135deg, var(--g1), var(--g2), var(--g3));
          border-radius: 16px;
          box-shadow: 0 10px 24px rgba(0,0,0,.10);
          color:#fff;
        }
        .cmp-title{
          color:#fff; font-weight: 900;
          text-shadow: 0 1px 0 rgba(0,0,0,.15);
        }

        /* الأزرار */
        .btn-glass{
          background: rgba(255,255,255,.15) !important;
          border: 1px solid rgba(255,255,255,.35) !important;
          color: #fff !important;
          font-weight: 700;
          backdrop-filter: blur(6px);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.12);
        }
        .btn-glass:hover{ background: rgba(255,255,255,.22) !important; transform: translateY(-1px); }

        .btn-grad{
          background-image: linear-gradient(135deg, var(--g1), var(--g2)) !important;
          border: none !important;
          font-weight: 800;
        }
        .btn-elev{
          box-shadow: 0 10px 22px rgba(0,0,0,.12);
          transition: transform .12s ease, box-shadow .12s ease, filter .12s ease;
        }
        .btn-elev:hover{
          transform: translateY(-1px);
          box-shadow: 0 16px 28px rgba(0,0,0,.16);
          filter: saturate(110%);
        }

        /* التنبيه */
        .cmp-alert{
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(0,0,0,.08);
        }

        /* حالة لا يوجد */
        .cmp-emptybox{
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 18px rgba(0,0,0,.08);
        }

        /* البطاقات */
        .cmp-card{
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,.06);
          transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease, filter .12s ease;
          animation: fadeInUp .5s ease both;
          background:
            radial-gradient(600px 140px at -10% -80%, rgba(16,196,139,.06), transparent 60%),
            #fff;
        }
        .cmp-card:hover{
          transform: translateY(-2px);
          box-shadow: 0 14px 26px rgba(0,0,0,.14);
          border-color: rgba(16,196,139,.25);
          filter: saturate(108%);
        }
        .cmp-card-title{
          font-weight: 900;
          color: var(--ink);
          padding-right: 24px; /* مساحة للنقطة */
        }

        .cmp-sub{ margin-top: 2px; }

        /* النقطة الحمراء — مع وهج لطيف */
        .notif-dot{
          box-shadow: 0 0 0 2px #fff;
        }
        .notif-dot::after{
          content: '';
          position: absolute; inset: -4px;
          border-radius: 999px;
          background: rgba(231,81,98,.28);
          filter: blur(2px);
          z-index: -1;
          animation: ping 1.4s ease-out infinite;
        }

        /* Modal تحسين بسيط */
        .cmp-modal .modal-content{
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 18px 42px rgba(0,0,0,.22);
          border: 1px solid rgba(0,0,0,.06);
        }
        .cmp-modal-head{
          background:
            radial-gradient(600px 120px at 20% -80%, rgba(255,255,255,.22), transparent 60%),
            linear-gradient(135deg, var(--g1), var(--g2), var(--g3));
          color:#fff;
        }
        .cmp-modal-foot{
          background: #f6faf8;
        }
        .cmp-msg, .cmp-resp{
          white-space: pre-wrap; /* يحافظ على الأسطر */
        }

        /* Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px) scale(.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadePage {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ping{
          0%{ transform: scale(.95); opacity: .8; }
          80%{ transform: scale(1.25); opacity: 0; }
          100%{ transform: scale(1.25); opacity: 0; }
        }
      `}</style>

      <style>{`
        /* ===== CMP hero (green gradient, centered) ===== */
        .cmp-hero{
          direction:ltr;
          background:
            radial-gradient(1200px 200px at 20% -60%, rgba(255,255,255,.22), transparent 60%),
            linear-gradient(135deg, #10c48b, #0ea36b, #0a6f47);
          color:#fff;
          padding: 18px 16px;
          box-shadow: 0 8px 18px rgba(0,0,0,.12);
          animation: cmpHeroIn .7s ease both;
        }
        .cmp-hero-inner{
          max-width:1100px; margin:0 auto;
          min-height:120px;
          display:flex; gap:12px;
          flex-direction:column;
          align-items:center; justify-content:center;
          text-align:center;
        }
        .cmp-hero-title{
          margin:0; font-weight:900; letter-spacing:.2px;
          text-shadow: 0 2px 10px rgba(0,0,0,.25);
          font-size: clamp(1.6rem, 1.2rem + 1.2vw, 2.2rem);
        }
        .cmp-hero-subtitle{ margin:.25rem 0 0; opacity:.92; letter-spacing:.15px; }
        .cmp-hero-action{ animation: fadeInUp .6s ease both .15s; margin-top:6px; }

        @keyframes cmpHeroIn{ from{opacity:0; transform:translateY(-8px)} to{opacity:1; transform:translateY(0)} }
        @keyframes fadeInUp{ from{opacity:0; transform:translateY(6px)} to{opacity:1; transform:translateY(0)} }
      `}</style>
    </div>
  );
}

export default Complaints;