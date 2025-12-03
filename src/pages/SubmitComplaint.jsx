// src/pages/SubmitComplaint.jsx
// ✅ تحسين تصميمي فقط + استبدال Alerts بـ "توست" منبثق مطابق لطريقة الإشعارات.
// ✅ لا تغيير وظيفي على الاستدعاء (/api/complaints/submit/) أو الحقول أو التنقّل.

import React, { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

function SubmitComplaint() {
  const { i18n } = useTranslation();
  const isAR = (i18n?.language || 'ar').startsWith('ar');

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState('hr');

  // 🔔 Toast منبثق (نفس أسلوب صفحة الإشعارات)
  const [toast, setToast] = useState({ show: false, type: 'success', text: '' });
  const showToast = (type, text, ttl = 1800) => {
    setToast({ show: true, type, text });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(s => ({ ...s, show: false })), ttl);
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('access');
    try {
      await axios.post(
        '/api/complaints/submit/',
        { title, message, recipient_type: recipientType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ رسالة نجاح منبثقة (نفس النص الذي طلبته)
      showToast('success', isAR ? 'تمت العملية بنجاح' : 'Operation completed successfully');

      // إعادة التوجيه بعد لحظة قصيرة
      setTimeout(() => navigate('/complaints'), 1300);
    } catch (err) {
      // ✅ رسالة فشل منبثقة
      showToast('error', isAR ? 'حدث خطأ، الرجاء المحاولة لاحقًا' : 'Something went wrong, please try again');
    }
  };

  return (
    <div className="sc-wrap">
      <div className="container sc-container">
        {/* رجوع للداشبورد */}
        <Button
          variant="outline-secondary"
          className="mb-4 btn-glass"
          onClick={() => navigate('/dashboard')}
        >
          ← {isAR ? 'لوحة التحكم' : 'Back to Dashboard'}
        </Button>

        {/* بطاقة الفورم — تصميم زجاجي */}
        <Card className="shadow sc-card">
          {/* ترويسة البطاقة */}
          <div className="sc-card-head">
            <div className="sc-head-icon">
              <i className="bi bi-exclamation-circle" />
            </div>
            <div className="sc-head-text">
              <h3 className="m-0">{isAR ? 'إرسال شكوى' : 'Submit a Complaint'}</h3>
              <p className="m-0">
                {isAR
                  ? 'يرجى وصف الشكوى بدقة واختيار الجهة المناسبة'
                  : 'Describe your complaint clearly and select the proper recipient.'}
              </p>
            </div>
          </div>

          <Card.Body className="p-4">
            {/* النموذج (نفس الحقول والمنطق) */}
            <Form onSubmit={handleSubmit} className="sc-form" dir={isAR ? 'rtl' : 'ltr'}>
              <Form.Group className="mb-3 sc-field" controlId="formTitle">
                <Form.Label><strong>{isAR ? 'العنوان' : 'Title'}</strong></Form.Label>
                <Form.Control
                  type="text"
                  placeholder={isAR ? 'اكتب عنوانًا مختصرًا' : 'Enter a short title'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3 sc-field" controlId="formMessage">
                <Form.Label><strong>{isAR ? 'التفاصيل' : 'Message'}</strong></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  placeholder={isAR ? 'اشرح شكواك بالتفصيل' : 'Describe your complaint in detail'}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4 sc-field" controlId="formRecipient">
                <Form.Label><strong>{isAR ? 'الجهة المستلمة' : 'Recipient'}</strong></Form.Label>
                <Form.Select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                >
                  <option value="hr">{isAR ? 'الموارد البشرية' : 'Human Resources'}</option>
                  <option value="manager">{isAR ? 'الإدارة' : 'Management'}</option>
                </Form.Select>
              </Form.Group>

              <div className="d-grid">
                <Button variant="success" type="submit" className="btn-grad btn-elev sc-submit">
                  <i className="bi bi-send me-2"></i>{isAR ? 'إرسال الشكوى' : 'Submit Complaint'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>

      {/* 🔔 Toast المنبثق (نفس الأسلوب المستخدم للإشعارات) */}
      <div
        className={`toastify ${toast.show ? 'show' : ''} ${toast.type}`}
        role="status"
        aria-live="polite"
      >
        <div className="toastify-inner">
          <span className="ico" aria-hidden>
            {toast.type === 'success' ? '✓' : '⚠'}
          </span>
          <div className="txt">{toast.text}</div>
        </div>
        <div className="bar" />
      </div>

      {/* ===== Styles (التصميم + التوست) ===== */}
      <style>{`
        :root{
          --g1:#10c48b; --g2:#0ea36b; --g3:#0a6f47;
          --ink:#063b28; --ink2:#1b4d3a;
          --white:#fff;
          --danger:#e75162;
        }

        /* خلفية بتدرّج + دخول ناعم */
        .sc-wrap{
          min-height: 100vh;
          display: flex; align-items: center;
          background:
            radial-gradient(1200px 240px at 20% -60%, rgba(255,255,255,.20), transparent 60%),
            linear-gradient(135deg, var(--g1), var(--g2), var(--g3));
          padding: 28px 0;
          animation: scPageIn .5s ease both;
        }
        .sc-container{
          width: 100%;
          max-width: 720px;
        }

        /* زر رجوع زجاجي */
        .btn-glass{
          background: rgba(255,255,255,.16) !important;
          border: 1px solid rgba(255,255,255,.32) !important;
          color: #fff !important;
          font-weight: 700;
          backdrop-filter: blur(6px);
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.10);
          transition: transform .12s ease, background .12s ease, box-shadow .12s ease;
        }
        .btn-glass:hover{ transform: translateY(-1px); background: rgba(255,255,255,.22) !important; box-shadow: 0 12px 24px rgba(0,0,0,.18); }

        /* البطاقة الزجاجية */
        .sc-card{
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.26);
          overflow: hidden;
          background: rgba(255,255,255,.92);
          backdrop-filter: blur(6px);
          box-shadow: 0 24px 48px rgba(0,0,0,.24);
          animation: scCardIn .6s ease both;
        }

        /* ترويسة البطاقة */
        .sc-card-head{
          display: grid;
          grid-template-columns: 52px 1fr;
          gap: 12px;
          align-items: center;
          padding: 16px 18px;
          color:#fff;
          background:
            radial-gradient(700px 160px at 20% -90%, rgba(255,255,255,.24), transparent 60%),
            linear-gradient(135deg, var(--g1), var(--g2), var(--g3));
        }
        .sc-head-icon{
          width: 52px; height: 52px; border-radius: 14px;
          background: rgba(255,255,255,.22);
          display:flex; align-items:center; justify-content:center;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,.28);
        }
        .sc-head-icon .bi{ font-size: 1.4rem; }
        .sc-head-text h3{
          font-weight: 900; margin: 0 0 4px 0;
          text-shadow: 0 1px 0 rgba(0,0,0,.12);
        }
        .sc-head-text p{ margin: 0; opacity: .95; }

        /* الحقول */
        .sc-form .form-control, .sc-form .form-select{
          border-radius: 12px;
          border: 1px solid rgba(10,111,71,.28);
          transition: box-shadow .15s ease, border-color .15s ease;
          font-weight: 600;
        }
        .sc-form .form-control:focus, .sc-form .form-select:focus{
          border-color: var(--g1);
          box-shadow: 0 0 0 4px rgba(16,196,139,.18);
        }
        .sc-field label{ color: var(--ink); }

        /* زر الإرسال */
        .btn-grad{
          background-image: linear-gradient(135deg, var(--g1), var(--g2)) !important;
          border: none !important;
          font-weight: 900;
        }
        .btn-elev{
          box-shadow: 0 12px 26px rgba(0,0,0,.18);
          transition: transform .12s ease, box-shadow .12s ease, filter .12s ease;
        }
        .btn-elev:hover{
          transform: translateY(-1px);
          box-shadow: 0 16px 32px rgba(0,0,0,.22);
          filter: saturate(112%);
        }
        .sc-submit{ border-radius: 14px; padding: 12px 16px; }

        /* 🔔 Toast — نفس روح التوست في الإشعارات */
        .toastify{
          position: fixed;
          right: 22px; bottom: 22px;
          z-index: 1055;
          opacity: 0; transform: translateY(8px) scale(.98);
          pointer-events: none;
          transition: opacity .18s ease, transform .18s ease;
        }
        .toastify.show{
          opacity: 1; transform: translateY(0) scale(1);
          pointer-events: auto;
        }
        .toastify .toastify-inner{
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 14px 34px rgba(0,0,0,.16);
          border: 1px solid rgba(0,0,0,.06);
          min-width: 280px;
          font-weight: 800;
          color: #063b28;
        }
        .toastify.success .toastify-inner{
          box-shadow: 0 14px 34px rgba(16,196,139,.22);
        }
        .toastify.error .toastify-inner{
          box-shadow: 0 14px 34px rgba(231,81,98,.22);
        }
        .toastify .ico{
          width: 26px; height: 26px; border-radius: 999px;
          display: inline-grid; place-items: center;
          font-size: 15px;
          color: #fff;
          background: linear-gradient(135deg, var(--g1), var(--g2));
        }
        .toastify.error .ico{ background: linear-gradient(135deg, #e75162, #d64555); }
        .toastify .txt{ line-height: 1.35; }

        /* شريط تقدم بسيط أسفل التوست */
        .toastify .bar{
          height: 3px; margin-top: 6px; border-radius: 999px;
          background: rgba(0,0,0,.08);
          overflow: hidden;
        }
        .toastify.show .bar::after{
          content: '';
          display: block;
          height: 100%;
          background: linear-gradient(135deg, var(--g1), var(--g2));
          animation: toastBar 1.7s linear forwards;
        }
        .toastify.error.show .bar::after{
          background: linear-gradient(135deg, #e75162, #d64555);
        }

        /* حركات */
        @keyframes scPageIn{
          from{ opacity: 0; transform: translateY(6px) }
          to  { opacity: 1; transform: translateY(0) }
        }
        @keyframes scCardIn{
          from{ opacity: 0; transform: translateY(10px) scale(.985) }
          to  { opacity: 1; transform: translateY(0) scale(1) }
        }
        @keyframes toastBar{
          from{ transform: translateX(-100%); }
          to  { transform: translateX(0%); }
        }
      `}</style>
    </div>
  );
}

export default SubmitComplaint;
