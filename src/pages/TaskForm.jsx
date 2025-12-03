// src/pages/TaskForm.jsx
import { jwtDecode } from 'jwt-decode';
import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axios';
import { createTask, getTask, updateTask } from '../api/tasks';
import Footer from '../components/Footer';
import Header from '../components/Header';

export default function TaskForm() {
  const { id } = useParams(); // إذا موجود → تعديل
  const isEdit = !!id;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [phases, setPhases] = useState(['']);
  const [userIds, setUserIds] = useState([]);
  const [toHR, setToHR] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const role = useMemo(() => {
    const token = localStorage.getItem('access');
    try { if (token) { const d = jwtDecode(token); return (d.role || localStorage.getItem('userRole') || 'employee').toLowerCase(); } } catch { }
    return (localStorage.getItem('userRole') || 'employee').toLowerCase();
  }, []);
  const canCreate = role === 'hr' || role === 'manager' || role === 'general_manager' || localStorage.getItem('is_staff') === 'true';

  // ترتيب المستخدمين أبجديًا
  const usersSorted = useMemo(() => {
    return [...(users || [])].sort((a, b) =>
      String(a?.username || '').localeCompare(String(b?.username || ''), 'en', { sensitivity: 'base' })
    );
  }, [users]);

  useEffect(() => {
    if (!canCreate) { navigate('/tasks'); return; }
    const load = async () => {
      try {
        const tok = localStorage.getItem('access');
        const ures = await axios.get('/api/users/', { headers: { Authorization: `Bearer ${tok}` } });
        setUsers(ures.data || []);
        if (isEdit) {
          const tsk = await getTask(id);
          setTitle(tsk.title || '');
          setDescription(tsk.description || '');
          setPhases((tsk.phases || []).sort((a, b) => a.order - b.order).map(p => p.text));
          const ids = (tsk.recipients || []).filter(r => r.user).map(r => r.user);
          setUserIds(ids);
          setToHR((tsk.recipients || []).some(r => r.is_hr_team));
        }
      } catch (e) {
        console.error('TaskForm load error', e?.response?.data || e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit, canCreate, navigate]);

  const addPhase = () => setPhases(prev => [...prev, '']);
  const removePhase = (idx) => setPhases(prev => prev.filter((_, i) => i !== idx));
  const setPhaseText = (idx, val) => setPhases(prev => prev.map((p, i) => i === idx ? val : p));

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      description: description.trim(),
      phase_texts: phases.filter(p => p.trim()).map(p => p.trim()),
      recipient_user_ids: userIds,
      to_hr_team: toHR
    };
    try {
      setSaving(true);
      if (isEdit) await updateTask(id, payload);
      else await createTask(payload);
      navigate('/tasks');
    } catch (e) {
      alert(e?.response?.data?.detail || e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{
        background:
          'radial-gradient(1200px 500px at 10% -10%, rgba(231,195,108,0.18) 0%, rgba(11,46,19,0) 60%), linear-gradient(180deg,#0f5132 0%, #0b3a1d 50%, #0b2e13 100%)',
      }}
    >
      {/* أنماط وأنيميشن خفيف يحافظ على الهوية */}
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .fx-fade-up { animation: fadeUp .45s ease-out both; }
        .fx-delay-1 { animation-delay: .06s; }
        .fx-delay-2 { animation-delay: .12s; }
        .fx-delay-3 { animation-delay: .18s; }
        .tf-hero {
          border-radius: 1.25rem;
          padding: 16px 18px;
          background:
            linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.02)),
            linear-gradient(90deg, rgba(231,195,108,.18), rgba(231,195,108,0));
          color: #fff;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 10px 30px rgba(0,0,0,.25);
        }
        .tf-hero h3 { margin: 0; text-shadow: 0 1px 0 rgba(0,0,0,.35); }
        .tf-card {
          border: 0 !important;
          border-radius: 1.25rem !important;
          box-shadow: 0 14px 34px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.06);
          backdrop-filter: blur(6px);
        }
        .tf-hr {
          height: 1px; border:0;
          background: linear-gradient(90deg, rgba(231,195,108,0), rgba(231,195,108,.75), rgba(231,195,108,0));
          margin: 1rem 0 1.25rem;
        }
        .tf-form-label { font-weight: 600; color: #274b37; }
        .tf-form-control, .form-select {
          border-radius: .9rem !important;
          border: 1px solid rgba(15,81,50,.25) !important;
        }
        .tf-form-control:focus, .form-select:focus {
          border-color: #E7C36C !important;
          box-shadow: 0 0 0 .25rem rgba(231,195,108,.25) !important;
        }
        .phase-badge {
          background: linear-gradient(180deg,#637a6f,#44564e);
          border: 1px solid rgba(255,255,255,.2);
        }
        .tf-actionbar {
          position: sticky;
          bottom: -1px;
          background: linear-gradient(180deg, rgba(255,255,255,.65), rgba(255,255,255,.92));
          border-top: 1px solid rgba(15,81,50,.1);
          padding: .75rem;
          display: flex;
          justify-content: flex-end;
          gap: .5rem;
          border-bottom-left-radius: 1.25rem;
          border-bottom-right-radius: 1.25rem;
          backdrop-filter: blur(6px);
        }
      `}</style>

      <Header />

      <div className="container my-4">
        {/* شريط علوي */}
        <div className="tf-hero fx-fade-up">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <Link to="/tasks" className="btn btn-outline-light btn-sm">← {t('back')}</Link>
              <h3>{isEdit ? t('edit_task') : t('create_task')}</h3>
            </div>
          </div>
        </div>

        {/* شبكية: المحتوى الرئيسي يسار + لوحة التعيين يمين */}
        <Row className="g-4 mt-3">
          {/* يسار: تفاصيل المهمة + المراحل */}
          <Col lg={8} className="fx-fade-up fx-delay-1">
            <Card className="tf-card overflow-hidden">
              <Card.Body className="p-4 p-md-5">
                <Form onSubmit={submit}>
                  {/* تفاصيل المهمة */}
                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="tf-form-label">{t('task_title')}</Form.Label>
                        <Form.Control
                          className="tf-form-control"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder={t('task_title')}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label className="tf-form-label">{t('task_description')}</Form.Label>
                        <Form.Control
                          className="tf-form-control"
                          as="textarea" rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder={t('task_description')}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <hr className="tf-hr" />

                  {/* المراحل */}
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="fw-bold">{t('phases')}</div>
                    <Button variant="outline-primary" onClick={addPhase}>
                      ＋ {t('add_phase')}
                    </Button>
                  </div>
                  <div className="mt-2">
                    {phases.map((p, idx) => (
                      <div key={idx} className="d-flex align-items-center gap-2 mb-2 fx-fade-up">
                        <span className="badge phase-badge">{idx + 1}</span>
                        <InputGroup>
                          <Form.Control
                            className="tf-form-control"
                            value={p}
                            onChange={(e) => setPhaseText(idx, e.target.value)}
                            placeholder={t('phase_placeholder')}
                          />
                          <Button
                            variant="outline-danger"
                            onClick={() => removePhase(idx)}
                            disabled={phases.length <= 1}
                            title={t('remove')}
                          >
                            ✕
                          </Button>
                        </InputGroup>
                      </div>
                    ))}
                  </div>

                  {/* إجراءات */}
                  <div className="tf-actionbar mt-3">
                    <Button type="button" variant="secondary" onClick={() => navigate('/tasks')}>
                      {t('cancel')}
                    </Button>
                    <Button type="submit" variant="success" disabled={saving}>
                      {isEdit ? t('save_changes') : t('create')}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* يمين: التعيين */}
          <Col lg={4} className="fx-fade-up fx-delay-2">
            <Card className="tf-card">
              <Card.Body className="p-4">
                <Form.Group className="mb-3">
                  <Form.Label className="tf-form-label">{t('task_recipients')}</Form.Label>
                  <Form.Select
                    multiple
                    value={userIds}
                    onChange={(e) => {
                      const opts = Array.from(e.target.selectedOptions).map(o => Number(o.value));
                      setUserIds(opts);
                    }}
                  >
                    {(usersSorted || []).map(u => (
                      <option key={u.id} value={u.id}>
                        {u.username} {u.role ? `(${u.role})` : ''}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>



                {loading && (
                  <div className="text-muted mt-3" role="status" aria-live="polite">
                    {t('loading')}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      <Footer />
    </div>
  );
}
