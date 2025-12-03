// src/pages/Profile.jsx
import { jwtDecode } from 'jwt-decode';
import { useEffect, useMemo, useState } from 'react';
import { Badge, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import axios, { API_BASE_URL } from '../api/axios';
import Footer from '../components/Footer';
import Header from '../components/Header';

/** استخرج origin للباك لتكوين رابط /media */
function getApiOrigin() {
  try {
    // نستخدم نفس عنوان الباك إند المستخدم في axios
    return API_BASE_URL.replace(/\/+$/, '');
  } catch {
    return '';
  }
}

/** حوّل مسار avatar النسبي إلى مطلق */
function resolveAvatar(u) {
  const a = u?.avatar;
  if (!a) return '/avatar.png';
  if (/^(https?:)?\/\//i.test(a) || /^data:/i.test(a)) return a;
  const origin = getApiOrigin().replace(/\/$/, '');
  return origin ? `${origin}${a.startsWith('/') ? '' : '/'}${a}` : a;
}

/** اسم كامل من first/last مع fallback للـusername */
function makeDisplayName(user) {
  if (!user) return '';
  const fn = user.first_name ?? user.firstName ?? '';
  const ln = user.last_name ?? user.lastName ?? '';
  const full = `${fn} ${ln}`.trim();
  return full || user.username || '';
}

export default function Profile() {
  const { t } = useTranslation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const token = localStorage.getItem('access') || '';
        // ✅ نمرر الـAuthorization صراحةً لضمان نجاح /me/ حتى لو الinterceptor مش شغّال
        const res = await axios.get('/api/me/', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!alive) return;
        setData(res.data || null);
        console.log(res.data)
      } catch (e) {
        // ✅ fallback: اقرأ من الـJWT (الذي لا يحتوي first/last عندك)
        const token = localStorage.getItem('access');
        let decoded = null;
        try { decoded = token ? jwtDecode(token) : null; } catch { }
        if (decoded && alive) {
          console.log(decoded)
          setData({
            id: decoded.user_id || decoded.id,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role || 'employee',
            points: decoded.points ?? 0,
            avatar: decoded.avatar || null,
            // ملاحظة: الـJWT عندك لا يحوي first/last، لذلك سيُستخدم username كـfallback
            first_name: decoded.first_name || decoded.firstName || '',
            last_name: decoded.last_name || decoded.lastName || '',
          });
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const displayName = useMemo(() => makeDisplayName(data), [data]);
  const avatarUrl = useMemo(() => resolveAvatar(data), [data]);

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(180deg,#0f5132,#0b2e13)' }}>
      <Header />

      <div className="container" style={{ maxWidth: 1000, marginTop: 24, marginBottom: 24 }}>
        {loading ? (
          <div className="text-white-50 py-5">{t('loading') || 'Loading...'}</div>
        ) : (
          <>
            {/* صورة + نقاط */}
            <Card className="shadow-sm border-0 mb-3">
              <Card.Body className="d-flex align-items-center gap-3 py-2">
                <div className="rounded-circle overflow-hidden flex-shrink-0" style={{ width: 56, height: 56 }}>
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>

                <div className="flex-grow-1">
                  <div className="fw-semibold">{displayName}</div>
                  <div className="text-muted small d-flex align-items-center gap-2">
                    <span>{t('points') || 'النقاط'}:</span>
                    <Badge bg="success">{(data?.points ?? 0)} pts</Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* معلومات الحساب — استخدم displayName دائمًا */}
            <Card className="shadow-sm mb-3">
              <Card.Body>
                <h5 className="mb-3">{t('account_information') || 'معلومات الحساب'}</h5>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <div className="text-muted">{t('full_name') || 'الاسم الكامل'}</div>
                      <div className="fw-bold">{displayName || '-'}</div>
                    </div>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <div className="text-muted">{t('username') || 'اسم المستخدم'}</div>
                      <div className="fw-bold">{data?.username || '-'}</div>
                    </div>
                    <div className="d-flex justify-content-between py-2">
                      <div className="text-muted">{t('email') || 'البريد الإلكتروني'}</div>
                      <div className="fw-bold">{data?.email || '-'}</div>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <div className="text-muted">{t('role') || 'الدور'}</div>
                      <div className="fw-bold">{data?.role || '-'}</div>
                    </div>
                    <div className="d-flex justify-content-between py-2 border-bottom">
                      <div className="text-muted">{t('user_id') || 'المعرّف'}</div>
                      <div className="fw-bold">{data?.id || '-'}</div>
                    </div>
                    <div className="d-flex justify-content-between py-2">
                      <div className="text-muted">{t('password') || 'كلمة السر'}</div>
                      <div className="fw-bold">••••••••••</div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="shadow-sm">
              <Card.Body>
                <h6 className="mb-2">{t('security_hint') || 'الأمان'}</h6>
                <div className="text-muted">
                  {t('password_hidden_hint') || 'لحمايتك، كلمة السر مخفية، يمكنك تحديثها من الزر أعلاه.'}
                </div>
              </Card.Body>
            </Card>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
