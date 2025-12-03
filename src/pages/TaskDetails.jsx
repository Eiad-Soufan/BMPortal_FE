// src/pages/TaskDetails.jsx
import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getTask,
  listComments,
  addComment,
  completeNextPhase,
  markTaskFailed,
  markTaskSuccess,
  cancelTask,
} from '../api/tasks';
import { Button, Badge, Card, Form } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';

const statusColor = (s) =>
  ({
    open: 'warning',
    success: 'success',
    failed: 'danger',
    cancelled: 'secondary',
  }[s] || 'secondary');

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const __LOCAL_UI_CSS__ = `
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

  .bm-btn--success{ color:#fff; background:linear-gradient(135deg,#22c55e,#16a34a,#15803d); }
  .bm-btn--success:hover{ filter:brightness(1.05); }

  .bm-btn--danger{ color:#fff; background:linear-gradient(135deg,#ef4444,#dc2626,#b91c1c); }
  .bm-btn--danger:hover{ filter:brightness(1.05); }

  .bm-btn--secondary{ color:#fff; background:linear-gradient(135deg,#9ca3af,#6b7280,#4b5563); }
  .bm-btn--secondary:hover{ filter:brightness(1.05); }

  /* ✅ هيدر تفاصيل المهمة - رسبونسيف */
  .td-header{
    display:flex;
    flex-wrap:wrap;
    gap:0.75rem;
    align-items:flex-start;
    justify-content:space-between;
  }
  .td-header-main{
    display:flex;
    flex-wrap:wrap;
    gap:0.5rem;
    align-items:center;
    min-width:0;
  }
  .td-header-main h3{
    margin:0;
    color:#fff;
    word-break:break-word;
  }
  .td-header-actions{
    display:flex;
    flex-wrap:wrap;
    gap:0.5rem;
    justify-content:flex-end;
  }

  /* progress + أزرار complete next */
  .td-progress-row{
    flex-wrap:wrap;
    gap:0.75rem;
  }
  .td-progress-main{
    flex:1 1 200px;
    min-width:0;
  }
  .td-progress-actions{
    display:flex;
    flex-wrap:wrap;
    gap:0.5rem;
    justify-content:flex-end;
  }

  @media (max-width: 768px){
    .td-header{
      flex-direction:column;
      align-items:stretch;
    }
    .td-header-actions{
      justify-content:flex-start;
    }
    .td-progress-row{
      flex-direction:column;
      align-items:flex-start;
    }
    .td-progress-actions{
      width:100%;
      justify-content:flex-start;
    }
  }
`;

  const userId = useMemo(
    () => (localStorage.getItem('userId') || '').toString(),
    []
  );

  const role = useMemo(() => {
    const token = localStorage.getItem('access');
    try {
      if (token) {
        const d = jwtDecode(token);
        return (
          (d.role || localStorage.getItem('userRole') || 'employee')?.toLowerCase() ||
          'employee'
        );
      }
    } catch {}
    return (localStorage.getItem('userRole') || 'employee').toLowerCase();
  }, []);

  const canManage =
    role === 'hr' ||
    role === 'manager' ||
    role === 'general_manager' ||
    localStorage.getItem('is_staff') === 'true';

  const fetchAll = async () => {
    setLoading(true);
    try {
      const tsk = await getTask(id);
      setTask(tsk);
      const cmts = await listComments(id);
      setComments(cmts);
    } catch (e) {
      console.error('TaskDetails fetch error', e?.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  const isAssigned = useMemo(() => {
    if (!task) return false;
    const hasUser = (task.recipients || []).some(
      (r) => String(r.user) === userId
    );
    const forHR = (task.recipients || []).some((r) => r.is_hr_team);
    return hasUser || (role === 'hr' && forHR);
  }, [task, userId, role]);

  const completePhase = async (result) => {
    try {
      setPosting(true);
      await completeNextPhase(id, result);
      await fetchAll();
    } catch (e) {
      alert(e?.response?.data?.detail || e.message);
    } finally {
      setPosting(false);
    }
  };

  const addCmt = async () => {
    if (!text.trim()) return;
    try {
      setPosting(true);
      await addComment(id, text.trim());
      setText('');
      await fetchAll();
    } catch (e) {
      alert(e?.response?.data?.detail || e.message);
    } finally {
      setPosting(false);
    }
  };

  const manageState = async (fn) => {
    try {
      setPosting(true);
      await fn(id);
      await fetchAll();
    } catch (e) {
      alert(e?.response?.data?.detail || e.message);
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-vh-100 d-flex flex-column"
        style={{ background: 'linear-gradient(180deg,#0f5132,#0b2e13)' }}
      >
        <Header />
        <div className="container text-white-50 py-5">
          {t('loading') || 'Loading...'}
        </div>
        <Footer />
      </div>
    );
  }

  if (!task) {
    return (
      <div
        className="min-vh-100 d-flex flex-column"
        style={{ background: 'linear-gradient(180deg,#0f5132,#0b2e13)' }}
      >
        <Header />
        <div className="container text-white-50 py-5">Not found</div>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{ background: 'linear-gradient(180deg,#0f5132,#0b2e13)' }}
    >
      <Header />

      <div className="container my-4">
        {/* ✅ هيدر المهمة (رسبونسيف) */}
        <div className="td-header mb-3">
          <div className="td-header-main">
            <Link
              to="/tasks"
              className="btn btn-outline-light btn-sm"
            >
              ← {t('back') || 'Back'}
            </Link>
            <h3 className="m-0">{task.title}</h3>
            <Badge
              bg={statusColor(task.status)}
              className="text-uppercase"
            >
              {task.status}
            </Badge>
          </div>

          <div className="td-header-actions">
            {canManage && task.status === 'open' && (
              <>
                <Button
                  className="bm-btn bm-btn--sm bm-btn--success"
                  variant="light"
                  disabled={posting}
                  onClick={() => manageState(markTaskSuccess)}
                >
                  {t('mark_success') || 'Mark Success'}
                </Button>

                <Button
                  className="bm-btn bm-btn--sm bm-btn--danger"
                  variant="light"
                  disabled={posting}
                  onClick={() => manageState(markTaskFailed)}
                >
                  {t('mark_failed') || 'Mark Failed'}
                </Button>

                <Button
                  className="bm-btn bm-btn--sm bm-btn--secondary"
                  variant="light"
                  disabled={posting}
                  onClick={() => manageState(cancelTask)}
                >
                  {t('cancel_task') || 'Cancel Task'}
                </Button>

                <Button
                  className="bm-btn bm-btn--sm bm-btn--primary"
                  variant="light"
                  onClick={() => navigate(`/tasks/${task.id}/edit`)}
                >
                  {t('edit_task') || 'Edit'}
                </Button>
              </>
            )}
          </div>
        </div>

        {task.description && (
          <p className="text-white-50">{task.description}</p>
        )}

        {/* ✅ كارت التقدم + أزرار complete next رسبونسيف */}
        <Card className="mb-4">
          <Card.Body>
            <div className="td-progress-row d-flex align-items-center justify-content-between">
              <div className="td-progress-main me-3">
                <div className="progress" style={{ height: 10 }}>
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

              {isAssigned && task.status === 'open' && (
                <div className="td-progress-actions d-flex gap-2">
                  <Button
                    variant="success"
                    disabled={posting}
                    onClick={() => completePhase('success')}
                  >
                    {t('complete_next_success') ||
                      'Complete next: Success'}
                  </Button>
                  <Button
                    variant="outline-danger"
                    disabled={posting}
                    onClick={() => completePhase('failed')}
                  >
                    {t('complete_next_failed') ||
                      'Complete next: Failed'}
                  </Button>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>

        <div className="row g-4">
          <div className="col-12 col-lg-7">
            <Card className="h-100">
              <Card.Body>
                <h5 className="mb-3">
                  {t('phases') || 'Phases'}
                </h5>
                <ol className="list-group list-group-numbered">
                  {(task.phases || []).map((ph) => (
                    <li
                      className="list-group-item d-flex align-items-center justify-content-between"
                      key={ph.id}
                    >
                      <div>
                        <div className="fw-semibold">{ph.text}</div>
                        <small className="text-muted">
                          {t('status') || 'Status'}: {ph.status}
                        </small>
                      </div>
                      <div style={{ fontSize: 20 }}>
                        {ph.status === 'success'
                          ? '✅'
                          : ph.status === 'failed'
                          ? '❌'
                          : '⏳'}
                      </div>
                    </li>
                  ))}
                </ol>
              </Card.Body>
            </Card>
          </div>

          <div className="col-12 col-lg-5">
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <h5 className="mb-3">
                  {t('comments') || 'Comments'}
                </h5>
                <div
                  className="flex-grow-1 overflow-auto"
                  style={{ maxHeight: 320 }}
                >
                  {(comments || []).map((c) => (
                    <div key={c.id} className="mb-3">
                      <div className="fw-semibold">
                        {c.author_name || c.author}
                      </div>
                      <div>{c.text}</div>
                      <small className="text-muted">
                        {new Date(
                          c.created_at
                        ).toLocaleString()}
                      </small>
                      <hr />
                    </div>
                  ))}
                  {(comments || []).length === 0 && (
                    <div className="text-muted">
                      {t('no_comments') ||
                        'No comments yet'}
                    </div>
                  )}
                </div>

                {task.status === 'open' && (
                  <div className="mt-3">
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder={
                        t('write_comment') ||
                        'Write a comment...'
                      }
                      value={text}
                      onChange={(e) =>
                        setText(e.target.value)
                      }
                    />
                    <div className="d-flex justify-content-end mt-2">
                      <Button
                        onClick={addCmt}
                        disabled={posting || !text.trim()}
                      >
                        {t('add_comment') ||
                          'Add comment'}
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      <style>{__LOCAL_UI_CSS__}</style>
    </div>
  );
}
