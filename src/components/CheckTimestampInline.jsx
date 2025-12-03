/* global BigInt */
import { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
// ========== زر "تحقق" + نافذة التحويل ==========
export default function CheckTimestampInline() {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  // يحوّل ns (19 رقم) إلى تاريخ دقيق: YYYY-MM-DD HH:MM:SS.mmmuuu
  const convertNsToDate = (nsStr) => {
    const clean = (nsStr || '').trim();
    if (!/^\d{16,20}$/.test(clean)) {
      throw new Error(t('invalid_timestamp') || 'رقم التايم ستامب غير صالح (يجب أن يكون 19 رقم تقريبًا).');
    }
    /* global BigInt */

    const ns = BigInt(clean);
    const sec = ns / 1_000_000_000n;
    const remNs = ns % 1_000_000_000n;

    // ميللي ثانية لتشييد Date (آمن كرقم)
    const ms = Number(sec * 1000n + remNs / 1_000_000n);
    const date = new Date(ms);

    const pad = (n, w = 2) => String(n).padStart(w, '0');
    const yyyy = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const HH = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    const mmm = pad(date.getMilliseconds(), 3);
    // جزء الميكروثانية من الباقي بعد الملي: (remNs % 1_000_000) / 1000
    const micro = Number((remNs % 1_000_000n) / 1_000n);
    const uuu = String(micro).padStart(3, '0'); // لإظهار 6 خانات: mmm + uuu

    return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}.${mmm}${uuu}`;
  };

  const onConvert = () => {
    try {
      setError('');
      const out = convertNsToDate(input);
      setResult(out);
    } catch (e) {
      setResult('');
      setError(e.message || 'خطأ في التحويل');
    }
  };

  const close = () => {
    setShow(false);
    setTimeout(() => { setInput(''); setResult(''); setError(''); }, 150);
  };

  return (
    <>
      {/* زر التحقق: ضع هذا الزر بجانب "إضافة إشعار" */}
      <Button
        className="bm-btn bm-btn--primary bm-btn--sm"
        variant="light"
        onClick={() => setShow(true)}
      >
        {t('check') || 'تحقق'}
      </Button>

      {/* نافذة التحويل */}
      <Modal show={show} onHide={close} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('check_timestamp') || 'تحقق من Timestamp'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>{t('enter_timestamp_ns') || 'أدخل رقم الـ timestamp (ns)'}</Form.Label>
            <Form.Control
              type="text"
              value={input}
              placeholder="مثال: 1725364041559482371"
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
            <Form.Text className="text-muted">
              {t('ns_hint') || 'الرقم المطبوع أسفل النموذج (19 رقم تقريبًا).'}
            </Form.Text>
          </Form.Group>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          {result && (
            <div className="alert alert-success py-2">
              <div className="fw-bold mb-1">{t('converted_datetime') || 'التاريخ المحوّل'}:</div>
              <code dir="ltr" style={{ userSelect: 'all' }}>{result}</code>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button className="bm-btn bm-btn--secondary bm-btn--sm" variant="light" onClick={close}>
            {t('close') || 'إغلاق'}
          </Button>
          <Button className="bm-btn bm-btn--primary bm-btn--sm" variant="light" onClick={onConvert}>
            {t('convert') || 'تحويل'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
// ========== نهاية كتلة التحقق ==========
