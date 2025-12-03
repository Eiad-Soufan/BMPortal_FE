// src/pages/SurveyForm.jsx
import { useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { createSurvey } from '../api/surveys';
import Footer from '../components/Footer';
import Header from '../components/Header';

const __LOCAL_UI_CSS__ = `
  .sf-hero{ background: linear-gradient(135deg,#0ea36b,#0a6f47); color:#fff; padding:22px 16px; text-align:center; }
  .sf-hero-title{ font-weight:900; font-size: clamp(1.6rem,1.2rem + 1vw,2.2rem); }
  .bm-card{border-radius:16px;box-shadow:0 6px 18px rgba(0,0,0,.08);transition:transform .12s ease; }
  .bm-card:hover{ transform:translateY(-2px); }
  .option-input{ margin-left:1rem; }
`;

export default function SurveyForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [posting, setPosting] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', required: true, options: [{ text: '' }] }]);
  };

  const removeQuestion = (qi) => {
    setQuestions(prev => prev.filter((_, idx) => idx !== qi));
  };

  const updateQuestion = (i, field, value) => {
    const copy = [...questions];
    copy[i][field] = value;
    setQuestions(copy);
  };

  const addOption = (qi) => {
    const copy = [...questions];
    copy[qi].options.push({ text: '' });
    setQuestions(copy);
  };

  const updateOption = (qi, oi, value) => {
    const copy = [...questions];
    copy[qi].options[oi].text = value;
    setQuestions(copy);
  };

  const handleSubmit = async () => {
    if (!title.trim() || questions.length === 0) {
      alert(t('fill_required_fields') || 'Please fill required fields');
      return;
    }
    try {
      setPosting(true);
      const payload = {
        title,
        description,
        status: 'published',
        questions: questions.map((q, qi) => ({
          text: q.text,
          required: q.required,
          order: qi,
          options: q.options.map((o, oi) => ({ text: o.text, order: oi })),
        })),
      };
      await createSurvey(payload);
      navigate('/surveys');
    } catch (e) {
      alert(e?.response?.data?.detail || e.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(180deg, #0f5132, #0a6f47)' }}>
      <Header />
      <style>{__LOCAL_UI_CSS__}</style>

      <section className="sf-hero">
        <h1 className="sf-hero-title">{t('create_survey') || 'Create Survey'}</h1>
      </section>

      <div className="container my-4">
        <Card className="bm-card mb-4">
          <Card.Body>

            <Form.Group className="mb-3">
              <Form.Label>{t('title') || 'Title'}</Form.Label>
              <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('description') || 'Description'}</Form.Label>
              <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Form.Group>
          </Card.Body>
        </Card>

        {questions.map((q, qi) => (
          <Card className="bm-card mb-3" key={qi}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div></div>
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeQuestion(qi)} aria-label="Delete question" title={t('delete') || 'Delete'}>
                  &times;
                </button>
              </div>

              <Form.Group className="mb-2">
                <Form.Label>{t('question')} {qi + 1}</Form.Label>
                <Form.Control value={q.text} onChange={(e) => updateQuestion(qi, 'text', e.target.value)} />
              </Form.Group>
              <Form.Check
                type="checkbox"
                checked={q.required}
                onChange={(e) => updateQuestion(qi, 'required', e.target.checked)}
                label={t('required') || 'Required'}
              />
              <div className="mt-2">
                {q.options.map((o, oi) => (
                  <Form.Control
                    key={oi}
                    className="mb-2 option-input"
                    value={o.text}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`${t('option')} ${oi + 1}`}
                  />
                ))}
                <Button variant="outline-success" size="sm" onClick={() => addOption(qi)}>
                  + {t('add_option') || 'Add option'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))}

        <div className="d-flex gap-2">
          <Button className="bm-btn bm-btn--primary bm-btn--sm" onClick={addQuestion}>
            + {t('add_question') || 'Add question'}
          </Button>
          <Button className="bm-btn bm-btn--primary bm-btn--sm" disabled={posting} onClick={handleSubmit}>
            {t('save_publish') || 'Save & Publish'}
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
