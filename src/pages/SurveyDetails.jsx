// src/pages/SurveyDetails.jsx
import { jwtDecode } from 'jwt-decode';
import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { changeSurveyStatus, getMySubmission, getSurvey, getSurveyResults, submitSurvey } from '../api/surveys';
import Footer from '../components/Footer';
import Header from '../components/Header';

const __LOCAL_UI_CSS__ = `
  .svd-hero{ background: linear-gradient(135deg,#10c48b,#0ea36b,#0a6f47); color:#fff; padding:22px 16px; text-align:center; }
  .svd-hero-title{ font-weight:900; font-size: clamp(1.6rem,1.2rem + 1vw,2.2rem); }

  .bm-card{ border-radius:16px; border:1.5px solid color-mix(in oklab,#0b2e13 12%,#fff 88%); box-shadow:0 8px 18px rgba(0,0,0,.08); transition:transform .12s ease, box-shadow .12s ease; overflow:hidden }
  .bm-card:hover{ transform:translateY(-2px); box-shadow:0 16px 28px rgba(0,0,0,.12) }
  @keyframes cardIn{to{opacity:1; transform:none}}
  .card-appear{opacity:0; transform: translateY(8px); animation: cardIn .45s ease forwards}

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

  /* خيارات السؤال مع تمييز الاختيار */
  .opt-row{
    display:flex; align-items:center; gap:.6rem;
    border:1.5px solid color-mix(in oklab,#0b2e13 12%,#fff 88%);
    background:#fff; border-radius:12px; padding:.6rem .8rem; cursor:pointer;
    transition: border-color .15s ease, box-shadow .15s ease, transform .12s ease, background .15s ease, opacity .15s ease;
  }
  .opt-row:hover{ transform: translateY(-1px); }
  .opt-row.is-selected{
    border-color:#10c48b;
    background: color-mix(in oklab, #10c48b 8%, #fff 92%);
    box-shadow:0 8px 18px rgba(16,196,139,.12);
  }
  .opt-row.disabled{ opacity:.75; cursor:not-allowed; }
  .opt-check{
    margin-inline-start:auto; font-weight:900; font-size:1rem; line-height:1;
    color:#10c48b;
  }
  .chosen-hint{ color:#16a34a; font-weight:600; }

  /* نتائج رسومية */
  .chart{ display:flex; flex-direction:column; gap:.5rem; margin-top:.5rem; }
  .bar{ display:flex; align-items:center; gap:.5rem; }
  .bar-label{ min-width: 120px; font-weight:600; }
  .bar-track{
    position:relative; flex:1 1 auto; height: 14px; border-radius: 999px;
    background: color-mix(in oklab,#0b2e13 12%, #fff 88%); overflow:hidden;
  }
  .bar-fill{
    height:100%; border-radius: 999px;
    background: linear-gradient(90deg,#10c48b,#0ea36b,#0a6f47);
    transform-origin: left center; transform: scaleX(0);
    animation: grow .6s ease forwards;
  }
  @keyframes grow { to { transform: scaleX(1); } }
  .bar-count{ min-width: 60px; text-align:right; font-variant-numeric: tabular-nums; }

  /* Toast عائم للنجاح/الفشل */
  .bm-toast{
    position: fixed; z-index: 1060;
    left: 50%; bottom: 22px; transform: translateX(-50%);
    min-width: 260px; max-width: 94vw;
    background:#fff; border-radius:14px; padding:.75rem 1rem;
    box-shadow: 0 18px 38px rgba(0,0,0,.18);
    border:1px solid color-mix(in oklab,#0b2e13 12%,#fff 88%);
    display:flex; align-items:center; gap:.6rem; font-weight:700;
    animation: toastIn .25s ease;
  }
  .bm-toast.success .dot{ background:#22c55e; }
  .bm-toast.error   .dot{ background:#ef4444; }
  .bm-toast .dot{ width:10px; height:10px; border-radius:50%; box-shadow:0 0 0 2px #fff; }
  @keyframes toastIn { from{ opacity:0; transform: translate(-50%, 8px); } to{ opacity:1; transform: translate(-50%, 0); } }

  /* للطباعة: إخفاء الهيدر/الفوتر والأزرار */
  @media print {
    header, footer, nav, .svd-actions, .bm-toast { display: none !important; }
    .container { max-width: 100% !important; }
    .bm-card { box-shadow: none !important; border: 1px solid #ddd; }
  }
`;

const getRole = () => {
  try {
    const token = localStorage.getItem('access');
    if (token) { const d = jwtDecode(token); if (d?.role) return String(d.role).toLowerCase(); }
  } catch { }
  return (localStorage.getItem('userRole') || 'employee').toLowerCase();
};

export default function SurveyDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const role = useMemo(getRole, []);
  const [survey, setSurvey] = useState(null);
  const [results, setResults] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: optionId }
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  // قفل النموذج إن سبق الإرسال + وقت الإرسال السابق
  const [locked, setLocked] = useState(false);
  const [submittedAt, setSubmittedAt] = useState('');

  // toast {type:'success'|'error', msg:string} | null
  const [toast, setToast] = useState(null);
  const showToast = (type, msg) => {
    setToast({ type, msg });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2600);
  };

  // استخدم توست الشكاوى إن كان متاحًا عالميًا، وإلا fallback للـ toast الداخلي
  const showComplaintStyleToast = (ok, msg) => {
    if (window?.showComplaintToast) return window.showComplaintToast(ok ? 'success' : 'error', msg);
    if (window?.complaintToast) return window.complaintToast(ok ? 'success' : 'error', msg);
    if (window?.showToast) return window.showToast({ type: ok ? 'success' : 'error', message: msg });
    showToast(ok ? 'success' : 'error', msg);
  };

  const isManagerOrHR = role === 'manager' || role === 'hr';

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        // تفاصيل الاستبيان
        const sv = await getSurvey(id);
        setSurvey(sv);

        // إن كان موظفًا: اجلب إرساله السابق (إن وُجد) واقفل النموذج
        if (!isManagerOrHR) {
          try {
            const ms = await getMySubmission(id);
            if (ms?.exists && ms?.submission) {
              const prev = {};
              (ms.submission.answers || []).forEach(a => {
                prev[a.question] = a.selected_option;
              });
              setAnswers(prev);                          // عرض الإجابات السابقة
              setLocked(true);                           // قفل الاختيارات
              setSubmittedAt(ms.submission.created_at || '');
            }
          } catch (e) {
            console.warn('my_submission error', e?.response?.data || e.message);
          }
        }

        // إن كان مدير/HR: اجلب النتائج
        if (isManagerOrHR) {
          try {
            const rs = await getSurveyResults(id);
            setResults(rs);
          } catch (e) {
            console.warn('results error', e?.response?.data || e.message);
          }
        }
      } catch (e) {
        const msg = e?.response?.data?.detail || e.message;
        if (window?.showComplaintToast) {
          window.showComplaintToast('error', msg);
        } else {
          showToast('error', msg);
        }
        navigate('/surveys');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, isManagerOrHR, navigate]);

  const onSelect = (qid, optId) => {
    setAnswers(prev => ({ ...prev, [qid]: optId }));
  };

  const allRequiredAnswered = () => {
    if (!survey) return false;
    const req = (survey.questions || []).filter(q => q.required);
    return req.every(q => answers[q.id]);
  };

  const handleSubmit = async () => {
    if (!allRequiredAnswered()) {
      showComplaintStyleToast(false, t('please_answer_all_required') || 'Please answer all required questions.');
      return;
    }
    try {
      setPosting(true);
      const payload = Object.entries(answers).map(([q, opt]) => ({
        question: Number(q),
        selected_option: Number(opt),
      }));
      await submitSurvey(survey.id, payload);
      showComplaintStyleToast(true, t('submit_success_survey') || t('submitted_successfully') || 'Submitted successfully');
      navigate('/surveys');
    } catch (e) {
      const msg = e?.response?.data?.detail || e.message || (t('submit_failed_survey') || 'Failed to submit the survey');
      showComplaintStyleToast(false, msg);
    } finally {
      setPosting(false);
    }
  };

  const selectedOptionText = (q) => {
    const optId = answers[q.id];
    if (!optId) return '';
    const found = (q.options || []).find(o => o.id === optId);
    return found?.text || '';
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(180deg, #0f5132, #0a6f47)' }}>
      <Header />
      <style>{__LOCAL_UI_CSS__}</style>

      <section className="svd-hero">
        <h1 className="svd-hero-title">{t('survey_details') || 'Survey Details'}</h1>
      </section>

      <div className="container my-4">
        {loading ? (
          <div className="text-center text-white-50 py-5">{t('loading') || 'Loading...'}</div>
        ) : !survey ? (
          <div className="text-center text-white-50 py-5">{t('not_found') || 'Not found'}</div>
        ) : (
          <>
            <Card className="bm-card card-appear mb-4">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h3 className="mb-1">{survey.title}</h3>
                    <div className="text-muted">{survey.description}</div>
                  </div>
                  <div className="svd-actions d-flex gap-2">
                    <Button className="bm-btn bm-btn--primary bm-btn--sm" onClick={() => navigate('/surveys')}>
                      {t('back') || 'Back'}
                    </Button>

                    {isManagerOrHR && (
                      <>
                        <select
                          className="form-select form-select-sm"
                          style={{ width: 150, borderRadius: 12 }}
                          value={survey.status}
                          onChange={async (e) => {
                            try {
                              const newStatus = e.target.value;
                              await changeSurveyStatus(survey.id, newStatus);
                              setSurvey({ ...survey, status: newStatus });
                              showComplaintStyleToast(true, t('status_changed') || 'Status updated');
                            } catch (err) {
                              showComplaintStyleToast(false, err?.response?.data?.detail || err.message);
                            }
                          }}
                        >
                          <option value="draft">{t('draft') || 'Draft'}</option>
                          <option value="published">{t('published') || 'Published'}</option>
                          <option value="archived">{t('archived') || 'Archived'}</option>
                        </select>
                      </>
                    )}

                    {isManagerOrHR && results && (
                      <Button className="bm-btn bm-btn--primary bm-btn--sm" onClick={() => window.print()}>
                        {t('print_results') || 'Print Results'}
                      </Button>
                    )}
                  </div>

                </div>
              </Card.Body>
            </Card>

            {/* وضع الموظف: نموذج الإجابة مع تمييز الاختيارات وسطر "تم اختيار" + قفل إذا سبق الإرسال */}
            {!isManagerOrHR && (
              <Card className="bm-card card-appear mb-4">
                <Card.Body>
                  {(survey.questions || []).map((q, idx) => (
                    <div key={q.id} className="mb-4">
                      <div className="fw-bold mb-2">
                        {t('question') || 'Question'} {idx + 1}: {q.text} {q.required && <span className="text-danger">*</span>}
                      </div>

                      <div className="d-flex flex-column gap-2">
                        {(q.options || []).map(opt => {
                          const selected = answers[q.id] === opt.id;
                          return (
                            <div
                              key={opt.id}
                              className={`opt-row ${selected ? 'is-selected' : ''} ${locked ? 'disabled' : ''}`}
                              onClick={() => !locked && onSelect(q.id, opt.id)}
                              role="button"
                              aria-pressed={selected}
                            >
                              <Form.Check
                                type="radio"
                                name={`q-${q.id}`}
                                id={`q-${q.id}-opt-${opt.id}`}
                                label={opt.text}
                                checked={selected}
                                disabled={locked}
                                onChange={() => !locked && onSelect(q.id, opt.id)}
                              />
                              <span className="opt-check">{selected ? '✔' : ''}</span>
                            </div>
                          );
                        })}
                      </div>

                      {answers[q.id] && (
                        <div className="mt-2 small chosen-hint">
                          {t('you_selected') || 'You selected'}: {selectedOptionText(q)}
                        </div>
                      )}
                    </div>
                  ))}

                  {locked ? (
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="text-success fw-semibold">
                        {t('survey_already_submitted') || 'You already submitted this survey.'}
                        <br />
                        {submittedAt && (
                          <span className="ms-2 text-muted">
                            {t('submitted_at') || 'Submitted at'}:<br /> {new Date(submittedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <Button className="bm-btn bm-btn--primary bm-btn--sm" onClick={() => navigate('/surveys')}>
                        {t('back') || 'Back'}
                      </Button>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-end">
                      <Button
                        className="bm-btn bm-btn--primary bm-btn--sm"
                        disabled={posting || !allRequiredAnswered()}
                        onClick={handleSubmit}
                      >
                        {t('submit') || 'Submit'}
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}

            {/* وضع المدير/HR: النتائج الرسومية */}
            {isManagerOrHR && results && (
              <Card className="bm-card card-appear mb-4">
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h5 className="m-0">{t('results_overview') || 'Results Overview'}</h5>
                    <small className="text-muted">
                      {t('total_submissions') || 'Total submissions'}: {results.total_submissions}
                    </small>
                  </div>

                  {(results.questions || []).map((q, idx) => (
                    <div className="mb-4" key={q.id}>
                      <div className="fw-bold mb-2">
                        {t('question') || 'Question'} {idx + 1}: {q.text}
                      </div>
                      <div className="chart">
                        {q.options.map(opt => (
                          <div className="bar" key={opt.id}>
                            <div className="bar-label">{opt.text}</div>
                            <div className="bar-track">
                              <div
                                className="bar-fill"
                                style={{ width: `${Math.max(0, Math.min(100, opt.percentage || 0))}%` }}
                                title={`${opt.percentage || 0}%`}
                              />
                            </div>
                            <div className="bar-count">
                              {opt.count} ({opt.percentage || 0}%)
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Toast داخلي (fallback) */}
      {toast && (
        <div className={`bm-toast ${toast.type}`}>
          <span className="dot" aria-hidden="true"></span>
          <span>{toast.msg}</span>
        </div>
      )}

      <Footer />
    </div>
  );
}
