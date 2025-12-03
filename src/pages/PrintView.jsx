// src/pages/PrintView.jsx
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function PrintView() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');

  const [pdfUrl, setPdfUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);

  // جهّز رابط الـPDF كما كان سابقًا
  useEffect(() => {
    const ts = Math.floor(Date.now() / 1000);
    const base = (api?.defaults?.baseURL || '').replace(/\/+$/, '');
    if (id) setPdfUrl(`${base}/api/preview-form/${id}/?ts=${ts}#toolbar=1&navpanes=0&zoom=page-fit`);
  }, [id]);

  const handlePrint = () => {
    if (!pdfUrl) return;
    // نحاول طباعة محتوى الـiframe مباشرة (أفضل تجربة)
    const frame = iframeRef.current;
    try {
      if (frame && frame.contentWindow) {
        frame.contentWindow.focus();
        frame.contentWindow.print();
        return;
      }
    } catch (_) {
      // بعض المتصفحات/الإضافات تمنع الوصول للـcontentWindow
    }
    // fallback: افتح في تبويب جديد والـViewer يوفّر زر الطباعة
    window.open(pdfUrl.replace(/#.*$/, ''), '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async () => {
    if (!pdfUrl) return;
    setBusy(true);
    try {
      // تنزيل مضمون حتى لو السيرفر يعرض inline
      const cleanUrl = pdfUrl.replace(/#.*$/, '');
      const res = await fetch(cleanUrl, { credentials: 'include' });
      if (!res.ok) throw new Error('Fetch failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form_${id || 'file'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // fallback بسيط: افتح الرابط مباشرة
      window.location.href = pdfUrl.replace(/#.*$/, '');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container py-4">
      {/* شريط علوي أنيق */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
          <h5 className="m-0">النموذج</h5>
          {id && <span className="badge text-bg-light">ID: {id}</span>}
        </div>

      </div>

      {/* عارض PDF داخل الصفحة */}
      <div className="card shadow-sm">
        <div className="card-body p-2">
          {!pdfUrl ? (
            <div className="text-muted p-3">جاري تجهيز الرابط…</div>
          ) : (
            <div style={{ position: 'relative' }}>
              {loading && (
                <div
                  className="d-flex align-items-center justify-content-center text-muted"
                  style={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0))'
                  }}
                >
                  جاري التحميل…
                </div>
              )}
              <iframe
                ref={iframeRef}
                title="preview"
                src={pdfUrl}
                onLoad={() => setLoading(false)}
                style={{
                  width: '100%',
                  height: '80vh',
                  border: '0',
                  borderRadius: '10px'
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
