// src/pages/OfficialAnnouncements.jsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Footer from '../components/Footer';
import Header from '../components/Header';

export default function OfficialAnnouncements() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'ar';
  const isAR = lang.startsWith('ar');
  const dir = isAR ? 'rtl' : 'ltr';

  // Tabs (exact same style as Policies)
  const TABS = [
    {
      key: 'public_holidays',
      label: isAR ? 'العطل الرسمية (الموظفون المحليون/المكتب)' : 'Public Holidays (Local/Office Staff)',
      icon: '📅',
    },
    {
      key: 'leave_entitlement',
      label: isAR ? 'استحقاق الإجازات (الأجانب/الخط الأمامي)' : 'Leave Entitlement (Foreign/Front-Line)',
      icon: '🗓️',
    },
  ];

  const [active, setActive] = useState(TABS[0].key);

  const data = getAnnouncementsContent(isAR);

  return (
    <>
      <Header />

      <div className="policies-wrapper" dir={dir}>
        {/* Hero (same as Policies) */}
        <section className="pol-hero">
          <div className="pol-hero-inner">
            <h1 className="pol-title">
              {t('official_announcements_title', {
                defaultValue: isAR ? 'الإعلانات الرسمية' : 'Official Announcements',
              })}
            </h1>
            <p className="pol-subtitle">
              {t('official_announcements_subtitle', {
                defaultValue: isAR ? 'العطل الرسمية والاستحقاقات المعتمدة' : 'Approved public holidays and entitlements',
              })}
            </p>
          </div>
        </section>

        {/* Tabs bar */}
        <nav className="pol-tabs" role="tablist" aria-label={isAR ? 'تبويبات الإعلانات الرسمية' : 'Official announcements tabs'}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={active === tab.key}
              aria-controls={`panel-${tab.key}`}
              id={`tab-${tab.key}`}
              className={`pol-tab ${active === tab.key ? 'is-active' : ''}`}
              onClick={() => setActive(tab.key)}
            >
              <span className="pol-tab-ic" aria-hidden>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Panel */}
        <section className="pol-panel" id={`panel-${active}`} role="tabpanel" aria-labelledby={`tab-${active}`}>
          {/* ===== Tab 1: Public Holidays ===== */}
          {active === 'public_holidays' && (
            <div className="pol-panel-inner">
              {/* Intro card */}
              <article className="pol-card" style={{ animationDelay: '0.05s' }}>
                <div className="pol-card-head">
                  <div className="pol-icon">📌</div>
                  <h2 className="pol-card-title">{data.publicHoliday.intro.title}</h2>
                </div>
                <p className="pol-paragraph">{data.publicHoliday.intro.p1}</p>
                <p className="pol-paragraph pol-note">{data.publicHoliday.intro.p2}</p>
              </article>

              {/* Schedule table card */}
              <article className="pol-card" style={{ animationDelay: '0.12s' }}>
                <div className="pol-card-head">
                  <div className="pol-icon">📋</div>
                  <h2 className="pol-card-title">{data.publicHoliday.tableTitle}</h2>
                </div>

                <div className="pol-table">
                  <div className="pol-tr pol-tr--head">
                    <div className="pol-td">{data.publicHoliday.cols.date}</div>
                    <div className="pol-td">{data.publicHoliday.cols.day}</div>
                    <div className="pol-td">{data.publicHoliday.cols.holiday}</div>
                    <div className="pol-td">{data.publicHoliday.cols.days}</div>
                  </div>

                  {data.publicHoliday.rows.map((r, i) => (
                    <div className="pol-tr" key={i}>
                      <div className="pol-td">{r.date}</div>
                      <div className="pol-td">{r.day}</div>
                      <div className="pol-td">{r.holiday}</div>
                      <div className="pol-td">{r.days}</div>
                    </div>
                  ))}

                  <div className="pol-tr">
                    <div className="pol-td" style={{ fontWeight: 800, color: '#0a6f47' }}>
                      {data.publicHoliday.total.label}
                    </div>
                    <div className="pol-td"></div>
                    <div className="pol-td"></div>
                    <div className="pol-td" style={{ fontWeight: 900, color: '#0a6f47' }}>
                      {data.publicHoliday.total.value}
                    </div>
                  </div>
                </div>

                <p className="pol-paragraph" style={{ marginTop: 10 }}>
                  {data.publicHoliday.footerNote}
                </p>
              </article>
            </div>
          )}

          {/* ===== Tab 2: Leave Entitlement ===== */}
          {active === 'leave_entitlement' && (
            <div className="pol-panel-inner">
              {/* Intro */}
              <article className="pol-card" style={{ animationDelay: '0.05s' }}>
                <div className="pol-card-head">
                  <div className="pol-icon">✅</div>
                  <h2 className="pol-card-title">{data.leave.intro.title}</h2>
                </div>
                <p className="pol-paragraph">{data.leave.intro.p1}</p>
                <p className="pol-paragraph pol-note">{data.leave.intro.p2}</p>
              </article>

              {/* Leave days table */}
              <article className="pol-card" style={{ animationDelay: '0.12s' }}>
                <div className="pol-card-head">
                  <div className="pol-icon">🧾</div>
                  <h2 className="pol-card-title">{data.leave.tableTitle}</h2>
                </div>

                <div className="pol-table">
                  <div className="pol-tr pol-tr--head">
                    <div className="pol-td">{data.leave.cols.type}</div>
                    <div className="pol-td">{data.leave.cols.days}</div>
                  </div>

                  {data.leave.rows.map((r, i) => (
                    <div className="pol-tr" key={i}>
                      <div className="pol-td">{r.type}</div>
                      <div className="pol-td">{r.days}</div>
                    </div>
                  ))}

                  <div className="pol-tr">
                    <div className="pol-td" style={{ fontWeight: 800, color: '#0a6f47' }}>
                      {data.leave.total.label}
                    </div>
                    <div className="pol-td" style={{ fontWeight: 900, color: '#0a6f47' }}>
                      {data.leave.total.value}
                    </div>
                  </div>
                </div>

                <p className="pol-paragraph" style={{ marginTop: 10 }}>
                  {data.leave.afterTable}
                </p>
              </article>

              {/* Eligibility + Quarterly entitlement */}
              <article className="pol-card" style={{ animationDelay: '0.20s' }}>
                <div className="pol-card-head">
                  <div className="pol-icon">📎</div>
                  <h2 className="pol-card-title">{data.leave.entitlement.title}</h2>
                </div>

                <p className="pol-paragraph">{data.leave.entitlement.p1}</p>

                <h3 className="pol-subhead">{data.leave.entitlement.qTitle}</h3>
                <ul className="pol-list">
                  {data.leave.entitlement.quarters.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>

                <p className="pol-paragraph pol-note" style={{ marginTop: 10 }}>
                  {data.leave.entitlement.note}
                </p>
              </article>
            </div>
          )}
        </section>
      </div>

      <Footer />

      {/* ===== Styles: EXACT SAME as Policies (copied) ===== */}
      <style>{`
        .policies-wrapper{
          padding-bottom:24px;
          background:#f8faf9;
          min-height:60vh;
        }
        .pol-hero{
          background:
            radial-gradient(1200px 200px at 20% -60%, rgba(255,255,255,.22), transparent 60%),
            linear-gradient(135deg, #10c48b, #0ea36b, #0a6f47);
          color:#fff;
          padding: 16px 16px;
          box-shadow: 0 8px 18px rgba(0,0,0,.12);
          animation: polHeroIn .7s ease both;
        }
        .pol-hero-inner{ max-width:980px; margin:0 auto; min-height:110px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
        .pol-title{ margin:0; font-size:1.9rem; font-weight:900; text-shadow:0 1px 0 rgba(0,0,0,.12); }
        .pol-subtitle{ margin:6px 0 0; opacity:.96; font-size:1rem; max-width:900px; }

        /* Tabs */
        .pol-tabs{ max-width:980px; margin:16px auto 0; padding:0 16px; display:flex; gap:10px; overflow:auto; }
        .pol-tab{ position:relative; display:inline-flex; align-items:center; gap:8px; border:1px solid rgba(10,111,71,.18); background:#fff; color:#0a6f47; padding:10px 14px; border-radius:999px; box-shadow:0 4px 12px rgba(0,0,0,.06); font-weight:700; cursor:pointer; transition:.25s transform, .25s box-shadow; }
        .pol-tab:hover{ transform:translateY(-1px); box-shadow:0 8px 18px rgba(0,0,0,.08); }
        .pol-tab.is-active{ background:#e8fff6; box-shadow:0 8px 20px rgba(0,0,0,.1); }
        .pol-tab-ic{ width:22px; height:22px; display:grid; place-items:center; }

        /* Panel */
        .pol-panel{ max-width:980px; margin:14px auto 0; padding:0 16px; }
        .pol-panel-inner{ display:flex; flex-direction:column; gap:16px; }

        .pol-card{ background:#fff; border-radius:14px; padding:18px 16px; box-shadow:0 6px 18px rgba(0,0,0,.08); border:1px solid rgba(0,0,0,.05); animation: polFadeInUp .7s ease both; }
        .pol-card-head{ display:flex; align-items:center; gap:10px; margin-bottom:10px; }
        .pol-icon{ width:36px; height:36px; border-radius:10px; display:grid; place-items:center; font-size:18px; color:#0a6f47; background:#e8fff6; box-shadow: inset 0 0 0 1px rgba(10,111,71,.12); }
        .pol-card-title{ margin:0; font-size:1.05rem; font-weight:800; color:#0a6f47; }
        .pol-list{ margin:0; padding-inline-start:18px; display:flex; flex-direction:column; gap:6px; }
        .pol-paragraph{ margin:0 0 8px; line-height:1.7; }
        .pol-subhead{ margin:10px 0 6px; font-size:1rem; color:#0a6f47; }
        .pol-note{ opacity:.9; }

        /* Simple table styling */
        .pol-table{ margin-top:8px; border:1px solid rgba(0,0,0,.08); border-radius:10px; overflow:hidden; }
        .pol-tr{ display:flex; }
        .pol-tr--head{ background:#f4fbf7; font-weight:800; color:#0a6f47; }
        .pol-td{ flex:1; padding:10px 12px; border-right:1px solid rgba(0,0,0,.06); }
        .pol-td:last-child{ border-right:none; }
        .pol-tr:not(.pol-tr--head) .pol-td{ border-top:1px solid rgba(0,0,0,.06); }

        @keyframes polFadeInUp{ from{opacity:0; transform:translateY(12px) scale(.985)} to{opacity:1; transform:translateY(0) scale(1)} }
        @keyframes polHeroIn{ from{opacity:0; transform:translateY(-8px)} to{opacity:1; transform:translateY(0)} }

        @media (max-width:560px){ .pol-hero{ padding:14px; } .pol-title{ font-size:1.6rem; } }
      `}</style>
    </>
  );
}

/* ===== Content extracted & structured from the two PDFs (displayed as final page content) ===== */
function getAnnouncementsContent(isAR) {
  if (!isAR) {
    return {
      publicHoliday: {
        intro: {
          title: 'Public Holiday Announcement for 2026',
          p1:
            'This schedule is specifically applicable to Berkat Madinah Local Staff and Office Staff. It reflects our commitment to supporting employees’ rights in alignment with the Employment Act 1955.',
          p2: 'Document date: 12/12/2025',
        },
        tableTitle: 'Public Holiday Schedule (2026)',
        cols: { date: 'Date', day: 'Day', holiday: 'Public Holiday', days: 'Days' },
        rows: [
          { date: '21 Mar – 22 Mar', day: 'Sat – Sun', holiday: 'Hari Raya Aidilfitri Holiday', days: '2' },
          { date: '1 May', day: 'Fri', holiday: 'Labour Day', days: '1' },
          { date: '27 May – 28 May', day: 'Wed – Thu', holiday: "Hari Raya Haji", days: '2' },
          { date: '1 June', day: 'Mon', holiday: "Agong’s Birthday", days: '2' },
          { date: '27 Jun', day: 'Wed', holiday: 'Awal Muharram', days: '1' },
          { date: '25 Aug', day: 'Tue', holiday: "Prophet Muhammad’s Birthday", days: '1' },
          { date: '31 Aug', day: 'Mon', holiday: 'Merdeka Day', days: '1' },
          { date: '16 Sep', day: 'Wed', holiday: 'Malaysia Day', days: '1' },
          { date: '11 Dec', day: 'Fri', holiday: "Sultan of Selangor’s Birthday", days: '1' },
        ],
        total: { label: 'TOTAL', value: '11' },
        footerNote:
          'We wish you and your family all the best in these joyful events. Prepared by HR Department; approved by General Manager.',
      },

      leave: {
        intro: {
          title: 'Leave Days Announcement for 2026',
          p1:
            'We announce 11 days of leave approved for non-local/front-line staff, including employees working in branches and warehouses.',
          p2: 'Document date: 12/12/2025',
        },
        tableTitle: 'Approved Leave Days (2026)',
        cols: { type: 'Leave Day', days: 'Days' },
        rows: [
          { type: 'Hari Raya Aidilfitri Holiday', days: '3' },
          { type: 'Hari Raya Haji', days: '3' },
          { type: 'Leave days allowance', days: '5' },
        ],
        total: { label: 'TOTAL', value: '11' },
        afterTable:
          'Based on this allowance, the leave days are accumulated gradually across the year according to the quarter entitlement.',
        entitlement: {
          title: 'Entitlement to Official Leave Allowance',
          p1: 'Eligibility: employee must complete 6 consecutive months of employment with the company.',
          qTitle: 'Quarter entitlement (as distributed):',
          quarters: [
            'First Quarter (Month 1 to 3): Entitled to 5 days',
            'Second Quarter (Month 4 to 6): Entitled to 4 days',
            'Third Quarter (Month 7 to 9): Entitled to 3 days',
            'Fourth Quarter (Month 10 to 12): Entitled to 2 days',
          ],
          note: 'This policy applies to front-line foreign employees as described in the official HR announcement.',
        },
      },
    };
  }

  // Arabic version (accurate + corporate tone)
  return {
    publicHoliday: {
      intro: {
        title: 'إعلان العطل الرسمية لسنة 2026 (الموظفون المحليون/المكتب)',
        p1:
          'يسري هذا الجدول على الموظفين المحليين وموظفي المكاتب لدى شركة بركة المدينة، ويعكس التزام الشركة بدعم حقوق الموظفين وفقًا للتشريعات ذات الصلة.',
        p2: 'تاريخ التعميم: 12/12/2025',
      },
      tableTitle: 'جدول العطل الرسمية المعتمدة لسنة 2026',
      cols: { date: 'التاريخ', day: 'اليوم', holiday: 'العطلة الرسمية', days: 'عدد الأيام' },
      rows: [
        { date: '21 Mar – 22 Mar', day: 'Sat – Sun', holiday: 'Hari Raya Aidilfitri Holiday', days: '2' },
        { date: '1 May', day: 'Fri', holiday: 'Labour Day', days: '1' },
        { date: '27 May – 28 May', day: 'Wed – Thu', holiday: 'Hari Raya Haji', days: '2' },
        { date: '1 June', day: 'Mon', holiday: "Agong’s Birthday", days: '2' },
        { date: '27 Jun', day: 'Wed', holiday: 'Awal Muharram', days: '1' },
        { date: '25 Aug', day: 'Tue', holiday: "Prophet Muhammad’s Birthday", days: '1' },
        { date: '31 Aug', day: 'Mon', holiday: 'Merdeka Day', days: '1' },
        { date: '16 Sep', day: 'Wed', holiday: 'Malaysia Day', days: '1' },
        { date: '11 Dec', day: 'Fri', holiday: "Sultan of Selangor’s Birthday", days: '1' },
      ],
      total: { label: 'الإجمالي', value: '11' },
      footerNote:
        'ملاحظة: هذه القائمة تم اعتمادها ضمن التعميم الرسمي لقسم الموارد البشرية، وتعتمدها الشركة للموظفين المحليين وموظفي المكاتب.',
    },

    leave: {
      intro: {
        title: 'إعلان استحقاق الإجازات لسنة 2026 (الأجانب/الخط الأمامي)',
        p1:
          'تم اعتماد 11 يوم إجازة للموظفين الأجانب/الخط الأمامي (بما يشمل العاملين ضمن الفروع والمستودعات) وفق التعميم الرسمي.',
        p2: 'تاريخ التعميم: 12/12/2025',
      },
      tableTitle: 'تفاصيل أيام الإجازات المعتمدة لسنة 2026',
      cols: { type: 'البند', days: 'عدد الأيام' },
      rows: [
        { type: 'إجازة عيد الفطر (Hari Raya Aidilfitri Holiday)', days: '3' },
        { type: 'إجازة عيد الأضحى (Hari Raya Haji)', days: '3' },
        { type: 'رصيد إجازات سنوي إضافي (Leave days allowance)', days: '5' },
      ],
      total: { label: 'الإجمالي', value: '11' },
      afterTable:
        'يتم احتساب الإجازات بشكل تراكمي تدريجي خلال السنة وفق استحقاق كل ربع سنوي كما هو موضح أدناه.',
      entitlement: {
        title: 'شروط وآلية استحقاق الإجازات',
        p1: 'شرط الاستحقاق: إكمال 6 أشهر متواصلة من العمل مع الشركة.',
        qTitle: 'توزيع الاستحقاق حسب الربع السنوي:',
        quarters: [
          'الربع الأول (الشهر 1 إلى 3): 5 أيام',
          'الربع الثاني (الشهر 4 إلى 6): 4 أيام',
          'الربع الثالث (الشهر 7 إلى 9): 3 أيام',
          'الربع الرابع (الشهر 10 إلى 12): يومان',
        ],
        note:
          'هذا القسم خاص بالموظفين الأجانب وموظفي الخط الأمامي كما ورد ضمن التعميم الرسمي للموارد البشرية.',
      },
    },
  };
}
