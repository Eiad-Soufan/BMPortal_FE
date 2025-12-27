// src/components/Footer.jsx
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { t } = useTranslation();

  const devName = 'Eiad Soufan';
  const brandName = t('system_title', { defaultValue: 'Berkat Madinah Portal' });

  return (
    <>
      {/* mt-auto يضمن Sticky Footer عبر flex في الصفحات */}
      <footer className="bm-footer mt-auto">
        <div className="bm-footer-inner">
          {/* العمود 1: عن البوابة */}
          <div className="bm-col">
            <div className="bm-brand">{brandName}</div>
            <p className="bm-desc">
              {t('footer_about', {
                defaultValue:
                  'بوابة داخلية لتبسيط العمليات داخل الشركة'
              })}
            </p>       
                {/* سياسات الشركة: تبقى موجودة كرابط أساسي (يمكن تغيير شكله فقط) */}
                <Link to="/policies" className="bm-link bm-link-pill">
                  {t('policies', { defaultValue: 'سياسات الشركة' })}
                </Link>

                <br/><br/>
            <div className="bm-copy">© {new Date().getFullYear()}</div>
          </div>

          {/* العمود 2: روابط سريعة */}
          <div className="bm-col">
            <div className="bm-head">{t('quick_links', { defaultValue: 'روابط سريعة' })}</div>
            <ul className="bm-list">
              <li>
                <Link to="/dashboard" className="bm-link">
                  {t('home', { defaultValue: 'الصفحة الرئيسية' })}
                </Link>
              </li>
              <li>
                <Link to="/tasks" className="bm-link">
                  {t('tasks', { defaultValue: 'المهام' })}
                </Link>
              </li>
              <li>
                <Link to="/surveys" className="bm-link">
                  {t('surveys', { defaultValue: 'الاستبيانات' })}
                </Link>
              </li>
              <li>
                <Link to="/complaints" className="bm-link">
                  {t('complaints', { defaultValue: 'الشكاوى' })}
                </Link>
              </li>

            </ul>
          </div>

          {/* العمود 3: تواصل معنا + وسام المطوّر */}
          <div className="bm-col">
            <div className="bm-head">{t('contact_us', { defaultValue: 'تواصل معنا' })}</div>
            <ul className="bm-list">
              <li>
                <a href="mailto:admin@madinah.com.my.com" className="bm-link">
                  admin@madinah.com.my.com
                </a>
              </li>

              <li>
                <a href="mailto:eiad.soufan.2@gmail.com" className="bm-link">
                   eiad.soufan.2@gmail.com
                </a>
              </li>
            </ul>

            {/* وسام المطوّر — يبقى كما هو مع اسم ملون */}
            <div className="bm-dev-wrap">
              <span className="bm-dev-label">
                {t('developed_by', { defaultValue: 'Developed by' })}
              </span>{' '}
              <strong className="bm-dev-name" title={`Developed by ${devName}`}>
                {devName}
              </strong>
            </div>
          </div>
        </div>
      </footer>

      {/* ============ Inline Styles ============ */}
      <style>{`
        :root{
          --bm-white:#fff;
          --bm-green-1:#10c48b; /* لا نغيّر الألوان */
          --bm-green-2:#0ea36b;
          --bm-green-3:#0a6f47;
          --bm-divider:rgba(255,255,255,.18);
          --bm-link:rgba(255,255,255,.95);
          --bm-linkHover:#ffffff;
        }

        .bm-footer{
          direction:ltr; /* نبقيها LTR كما كانت */
          background:
            radial-gradient(900px 160px at 20% -40%, rgba(255,255,255,.10), transparent 60%),
            linear-gradient(135deg, var(--bm-green-1), var(--bm-green-2), var(--bm-green-3));
          color:var(--bm-white);
          padding:28px 18px;
          box-shadow: 0 -8px 18px rgba(0,0,0,.08);
          border-top: 1px solid var(--bm-divider);
        }

        .bm-footer-inner{
          max-width:1200px; margin:0 auto;
          display:grid; grid-template-columns: 1.2fr 1fr 1fr;
          gap:24px; align-items:flex-start;
        }

        .bm-col{ min-width:0; }
        .bm-brand{ font-weight:900; font-size:1.05rem; text-shadow:0 1px 0 rgba(0,0,0,.08); }
        .bm-desc{ margin:.35rem 0 .65rem; opacity:.95; line-height:1.6; }
        .bm-copy{ opacity:.9; font-weight:600; }

        .bm-head{
          font-weight:900; margin-bottom:.6rem;
          border-bottom:1px solid var(--bm-divider); padding-bottom:.30rem;
        }

        .bm-list{ list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:.30rem; }
        .bm-text{ opacity:.9; }

        .bm-link{
          color:var(--bm-link); text-decoration:none; font-weight:500; letter-spacing:.2px;
          border-bottom:1px solid transparent;
          transition: border-color .15s ease, color .15s ease, opacity .15s ease, transform .12s ease;
        }
        .bm-link:hover{ color:var(--bm-linkHover); border-bottom-color: var(--bm-linkHover); }
        .bm-link-pill{
          display:inline-block; padding:.25rem .55rem; border-radius:999px;
          background: rgba(255,255,255,.08); border:1px solid var(--bm-divider);
        }

        .bm-dev-wrap{ margin-top:.75rem; font-weight:600; white-space:nowrap; }
        .bm-dev-label{ opacity:.95; }
        .bm-dev-name{
          position:relative; font-weight:900;
          background: linear-gradient(90deg,
            #ff7a59, #ff4ecd, #7b61ff, #1e90ff, #00d1b2, #ffd36e, #ff7a59
          );
          background-size: 220% 220%;
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: bmGradientShift 7s linear infinite;
        }
        .bm-dev-name::after{
          content:""; position:absolute; left:0; right:0; bottom:-2px; height:2px;
          background: linear-gradient(90deg,
            #ff7a59, #ff4ecd, #7b61ff, #1e90ff, #00d1b2, #ffd36e, #ff7a59
          );
          background-size: 220% 220%;
          animation: bmGradientShift 7s linear infinite;
          border-radius:2px; opacity:.9;
        }
        @keyframes bmGradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* تجاوبية */
        @media (max-width: 992px){
          .bm-footer-inner{ grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px){
          .bm-footer-inner{ grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}



