// src/pages/Policies.jsx (tabs version with Tab 2 content)
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Footer from '../components/Footer';
import Header from '../components/Header';

export default function Policies() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'ar';
  const isAR = lang.startsWith('ar');
  const dir = isAR ? 'rtl' : 'ltr';

  // --- Tabs ---
  const TABS = [
    {
      key: 'workplace',
      label: isAR ? 'سياسة وإجراءات بيئة العمل' : 'Workplace Policy & Procedure',
      icon: '🏢',
    },
    {
      key: 'attendance',
      label: isAR
        ? 'احتساب الدوام (الطريقة والضوابط)'
        : 'Attendance Calculation (Method & Rules)',
      icon: '⏱️',
    },
    {
      key: 'points',
      label: isAR ? 'سياسة احتساب النقاط' : 'Points Calculation Policy',
      icon: '🎯',
    },
  ];

  const [active, setActive] = useState(TABS[0].key);

  // ====== Tab 1 content (Workplace) ======
  const tab1 = getTab1Content(isAR);
  // ====== Tab 2 content (Attendance calc) ======
  const tab2 = getTab2Content(isAR);

  return (
    <>
      <Header />

      <div className="policies-wrapper" dir={dir}>
        {/* Hero */}
        <section className="pol-hero">
          <div className="pol-hero-inner">
            <h1 className="pol-title">
              {t('policies.title', { defaultValue: isAR ? 'سياسات الشركة' : 'Company Policies' })}
            </h1>
          </div>
        </section>

        {/* Tabs bar */}
        <nav className="pol-tabs" role="tablist" aria-label={isAR ? 'التبويبات' : 'Policies tabs'}>
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
              <span className="pol-tab-ic" aria-hidden>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Panels */}
        <section className="pol-panel" id={`panel-${active}`} role="tabpanel" aria-labelledby={`tab-${active}`}>
          {/* ===== Tab 1 ===== */}
          {active === 'workplace' && (
            <div className="pol-panel-inner">
              <article className="pol-card" style={{ animationDelay: '0.05s' }}>
                <div className="pol-card-head">
                  <div className="pol-icon">📱</div>
                  <h2 className="pol-card-title">{tab1.phone.title}</h2>
                </div>
                <p className="pol-paragraph">{tab1.phone.body}</p>
              </article>

              <article className="pol-card" style={{ animationDelay: '0.12s' }}>
                <div className="pol-card-head">
                  <div className="pol-icon">🍽️</div>
                  <h2 className="pol-card-title">{tab1.eating.title}</h2>
                </div>
                <p className="pol-paragraph">{tab1.eating.body}</p>
              </article>

              <article className="pol-card" style={{ animationDelay: '0.18s' }}>
                <div className="pol-card-head">
                  <div className="pol-icon">🕒</div>
                  <h2 className="pol-card-title">{tab1.attendance.title}</h2>
                </div>
                <ul className="pol-list">
                  {tab1.attendance.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </article>

              <article className="pol-card" style={{ animationDelay: '0.24s' }}>
                <div className="pol-card-head">
                  <div className="pol-icon">🚭</div>
                  <h2 className="pol-card-title">{tab1.smoking.title}</h2>
                </div>
                <p className="pol-paragraph">{tab1.smoking.body1}</p>
                <p className="pol-paragraph">{tab1.smoking.body2}</p>
              </article>

              <article className="pol-card" style={{ animationDelay: '0.30s' }}>
                <div className="pol-card-head">
                  <div className="pol-icon">👔</div>
                  <h2 className="pol-card-title">{tab1.uniform.title}</h2>
                </div>
                <ul className="pol-list">
                  {tab1.uniform.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </article>

              <article className="pol-card" style={{ animationDelay: '0.36s' }}>
                <div className="pol-card-head">
                  <div className="pol-icon">🤝</div>
                  <h2 className="pol-card-title">{tab1.customer.title}</h2>
                </div>
                <p className="pol-paragraph">{tab1.customer.body}</p>

                <h3 className="pol-subhead">{tab1.discipline.title}</h3>
                <ul className="pol-list">
                  {tab1.discipline.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
                <p className="pol-paragraph pol-note">{tab1.discipline.note}</p>
              </article>
            </div>
          )}

          {/* ===== Tab 2 ===== */}
          {active === 'attendance' && (
            <div className="pol-panel-inner">
              {/* Section 1: Attendance & Deductions */}
              <article className="pol-card" style={{ animationDelay: '0.05s' }}>
                <div className="pol-card-head">
                  <div className="pol-icon">🧮</div>
                  <h2 className="pol-card-title">{tab2.section1.title}</h2>
                </div>

                <h3 className="pol-subhead">{tab2.section1.missing.title}</h3>
                <ul className="pol-list">
                  {tab2.section1.missing.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>

                <h4 className="pol-subhead" style={{ marginTop: 10 }}>{tab2.section1.review.title}</h4>
                <ul className="pol-list">
                  {tab2.section1.review.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>

                <h3 className="pol-subhead" style={{ marginTop: 10 }}>{tab2.section1.offday.title}</h3>
                <p className="pol-paragraph">{tab2.section1.offday.body}</p>
              </article>

              {/* Section 2: Lateness Deduction */}
              <article className="pol-card" style={{ animationDelay: '0.12s' }}>
                <div className="pol-card-head">
                  <div className="pol-icon">⏰</div>
                  <h2 className="pol-card-title">{tab2.section2.title}</h2>
                </div>
                <p className="pol-paragraph">{tab2.section2.desc}</p>

                {/* Simple table look using flex */}
                <div className="pol-table">
                  <div className="pol-tr pol-tr--head">
                    <div className="pol-td">{tab2.section2.table.col1}</div>
                    <div className="pol-td">{tab2.section2.table.col2}</div>
                  </div>
                  {tab2.section2.table.rows.map((r, i) => (
                    <div className="pol-tr" key={i}>
                      <div className="pol-td">{r.range}</div>
                      <div className="pol-td">{r.rule}</div>
                    </div>
                  ))}
                </div>
              </article>

              {/* Section 3: Overtime */}
              <article className="pol-card" style={{ animationDelay: '0.20s' }}>
                <div className="pol-card-head">
                  <div className="pol-icon">🧾</div>
                  <h2 className="pol-card-title">{tab2.section3.title}</h2>
                </div>
                <ul className="pol-list">
                  {tab2.section3.points.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </article>
            </div>
          )}

          {/* ===== Tab 3 (Points Calculation Policy) ===== */}
          {active === 'points' && (
            <div className="pol-panel-inner">
              {/* Rewards Section */}
              <article className="pol-card" style={{ animationDelay: '0.05s' }}>
                <div className="pol-card-head">
                  <div className="pol-icon">🏆</div>
                  <h2 className="pol-card-title">
                    {isAR ? 'المكافآت' : 'Rewards'}
                  </h2>
                </div>

                <div className="pol-table">
                  <div className="pol-tr pol-tr--head">
                    <div className="pol-td">{isAR ? 'البند' : 'Item'}</div>
                    <div className="pol-td">{isAR ? 'حجم التقييم' : 'Evaluation Size'}</div>
                    <div className="pol-td">{isAR ? 'النقاط المضافة' : 'Points Added'}</div>
                  </div>
                  {[
                    { item: isAR ? 'الابتكار' : 'Innovation', size: isAR ? 'كبير' : 'Large', points: 100 },
                    { item: isAR ? 'الشهادات والتدريب' : 'Certifications & Training', size: isAR ? 'متوسط' : 'Medium', points: 50 },
                    { item: isAR ? 'المبادرة' : 'Initiative', size: isAR ? 'متوسط' : 'Medium', points: 50 },
                    { item: isAR ? 'جودة العمل' : 'Quality of Work', size: isAR ? 'متوسط' : 'Medium', points: 50 },
                    { item: isAR ? 'ملاحظات العملاء الإيجابية' : 'Positive Customer Feedback', size: isAR ? 'متوسط' : 'Medium', points: 50 },
                    { item: isAR ? 'الحضور الكامل' : 'Perfect Attendance', size: isAR ? 'صغير' : 'Small', points: 25 },
                    { item: isAR ? 'تحقيق الأهداف' : 'Meeting Targets', size: isAR ? 'صغير' : 'Small', points: 25 },
                    { item: isAR ? 'الموقف الإيجابي' : 'Positive Attitude', size: isAR ? 'صغير' : 'Small', points: 25 },
                  ].map((r, i) => (
                    <div className="pol-tr" key={i}>
                      <div className="pol-td">{r.item}</div>
                      <div className="pol-td">{r.size}</div>
                      <div className="pol-td">+{r.points}</div>
                    </div>
                  ))}
                </div>
              </article>

              {/* Penalties Section */}
              <article className="pol-card" style={{ animationDelay: '0.12s' }}>
                <div className="pol-card-head">
                  <div className="pol-icon">⚠️</div>
                  <h2 className="pol-card-title">
                    {isAR ? 'العقوبات' : 'Penalties'}
                  </h2>
                </div>

                <div className="pol-table">
                  <div className="pol-tr pol-tr--head">
                    <div className="pol-td">{isAR ? 'البند' : 'Item'}</div>
                    <div className="pol-td">{isAR ? 'حجم التقييم' : 'Evaluation Size'}</div>
                    <div className="pol-td">{isAR ? 'النقاط المخصومة' : 'Points Deducted'}</div>
                  </div>
                  {[
                    { item: isAR ? 'مخالفات السياسات' : 'Policy Violations', size: isAR ? 'كبير' : 'Large', points: -100 },
                    { item: isAR ? 'ملاحظات العملاء السلبية' : 'Negative Customer Feedback', size: isAR ? 'كبير' : 'Large', points: -100 },
                    { item: isAR ? 'مخالفات السلامة' : 'Safety Breaches', size: isAR ? 'متوسط' : 'Medium', points: -50 },
                    { item: isAR ? 'ضعف جودة العمل' : 'Poor Quality of Work', size: isAR ? 'متوسط' : 'Medium', points: -50 },
                    { item: isAR ? 'خلاف مع الزملاء' : 'Conflict with Colleagues', size: isAR ? 'متوسط' : 'Medium', points: -50 },
                    { item: isAR ? 'التأخر عن الدوام' : 'Late Arrivals', size: isAR ? 'صغير' : 'Small', points: -25 },
                    { item: isAR ? 'الموقف السلبي' : 'Negative Attitude', size: isAR ? 'صغير' : 'Small', points: -25 },
                    { item: isAR ? 'عدم تحقيق الأهداف' : 'Missing Targets', size: isAR ? 'صغير' : 'Small', points: -25 },
                    { item: isAR ? 'غياب غير مبرر' : 'Unexcused Absences', size: isAR ? 'صغير' : 'Small', points: -25 },
                  ].map((r, i) => (
                    <div className="pol-tr" key={i}>
                      <div className="pol-td">{r.item}</div>
                      <div className="pol-td">{r.size}</div>
                      <div className="pol-td">{r.points}</div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          )}

        </section>
      </div>

      <Footer />

      {/* ==== Styles (preserve look & animations, add tabs) ==== */}
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

/* ===== Tab 1 (static from earlier) ===== */
function getTab1Content(isAR) {
  if (!isAR) {
    return {
      phone: {
        title: 'Using phone during the working time',
        body:
          'Using mobile phones in the workplace for personal purposes or without permission of the direct manager is strictly prohibited. Any violation will be subject to strict disciplinary action.',
      },
      eating: {
        title: 'Eating in workplace during the working time',
        body:
          'Eating or having lunch in the workplace is not allowed during working time. Hiding behind tables or trying to find a place to eat in the supermarket is prohibited. A table is arranged in Madinah Café for this purpose. Staff without a break have 15 minutes only and must return directly to duty.',
      },
      attendance: {
        title: 'Attendance policy',
        points: [
          'Employees are expected to be present for work, on time, every day.',
          'If you cannot come to work or be on time, notify your manager as soon as possible and then submit a leave/delay form to cover the absence.',
          'If you fail to inform your manager or fail to submit a form, disciplinary action may be taken.',
        ],
      },
      smoking: {
        title: 'Smoking and vaping policy',
        body1:
          'Smoking or vaping is prohibited on all company premises and workplaces to provide a safe and healthy environment for employees and customers.',
        body2:
          'Smoking is defined as lighting, smoking, or carrying a lighted/smoldering cigar, cigarette, or pipe of any kind. Vaping is included under this policy.',
      },
      uniform: {
        title: 'Uniform policy',
        points: [
          'Employees dealing with customers and partners must wear company-designated uniforms while working and representing Berkat Madinah Sdn Bhd.',
          'Each new employee receives two uniforms on hire and signs for them. Uniforms are company property and must be returned upon termination or upon demand.',
        ],
      },
      customer: {
        title: 'Customer care',
        body:
          'Customer service at Berkat Madinah is priority #1. All branch staff and any employees dealing with customers or partners share this responsibility. Any complaint received about an employee may result in serious action.',
      },
      discipline: {
        title: 'Disciplinary action for violating policies',
        points: [
          '1st time: Warning letter.',
          '2nd time: RM 50 penalty deducted from monthly salary.',
          '3rd time: RM 100 penalty deducted from monthly salary.',
          '4th time: Employment termination.',
        ],
        note:
          'Immediate dismissal without warnings may occur if a violation against these policies is proven in front of a customer by any proof (manager report, customer message, or CCTV).',
      },
    };
  }

  // Arabic
  return {
    phone: {
      title: 'استخدام الهاتف خلال وقت العمل',
      body:
        'يُحظر منعًا باتًا استخدام الهواتف المحمولة لأغراض شخصية في مكان العمل أو دون إذن المدير المباشر. أي مخالفة تُعرّض صاحبها لإجراءات تأديبية صارمة.',
    },
    eating: {
      title: 'الأكل في مكان العمل خلال وقت الدوام',
      body:
        'يُمنع الأكل أو تناول الغداء داخل أماكن العمل أثناء الدوام. كما يُحظر الاختباء خلف الطاولات أو البحث عن أماكن داخل السوبرماركت لتناول الطعام. تم تخصيص طاولة لهذا الغرض في مقهى المدينة. للموظفين الذين لا يملكون وقت استراحة، يُسمح بـ 15 دقيقة فقط ثم يجب العودة مباشرة إلى العمل.',
    },
    attendance: {
      title: 'سياسة الحضور',
      points: [
        'يُتوقع من الموظفين الحضور للعمل في الوقت المحدد كل يوم.',
        'إذا تعذر عليك الحضور أو الالتزام بالوقت، أبلغ مديرك بأسرع ما يمكن ثم قدّم نموذج إجازة/تأخير لتغطية الغياب.',
        'في حال عدم إبلاغ المدير أو عدم تقديم نموذج، قد تتخذ الشركة إجراءً تأديبيًا.',
      ],
    },
    smoking: {
      title: 'سياسة التدخين والفيب',
      body1:
        'يُحظر التدخين أو استخدام الفيب في جميع مرافق وأماكن عمل الشركة حفاظًا على بيئة آمنة وصحية للموظفين والعملاء.',
      body2:
        'يُقصد بالتدخين إشعال أو تدخين أو حمل سيجار أو سيجارة أو غليون مشتعل من أي نوع. ويُعد استخدام الفيب (السجائر الإلكترونية) مشمولًا بهذه السياسة.',
    },
    uniform: {
      title: 'سياسة الزيّ الرسمي',
      points: [
        'يتعين على الموظفين الذين يتعاملون مع العملاء أو الشركاء ارتداء الزيّ المعتمد أثناء العمل وتمثيل شركة بركة المدينة سdn بهد.',
        'يتسلم كل موظف جديد زيّين عند التعيين ويوقّع عليها. تعد الأزياء ملكًا للشركة ويجب إعادتها عند انتهاء الخدمة أو عند الطلب.',
      ],
    },
    customer: {
      title: 'خدمة العملاء',
      body:
        'تُعد خدمة العملاء في بركة المدينة أولوية رقم 1، وهي مسؤولية جميع موظفي الفروع وكل من يتعامل مع العملاء أو الشركاء. أي شكوى موثقة ضد موظف قد تُعرّضه لإجراء صارم.',
    },
    discipline: {
      title: 'الإجراءات التأديبية عند المخالفة',
      points: [
        'المرة الأولى: إنذار خطي.',
        'المرة الثانية: خصم 50 رنجت من الراتب الشهري.',
        'المرة الثالثة: خصم 100 رنجت من الراتب الشهري.',
        'المرة الرابعة: إنهاء خدمات الموظف.',
      ],
      note:
        'يجوز فصل الموظف مباشرة دون إنذارات إذا ثبتت المخالفة أمام عميل بأي وسيلة إثبات (تقرير من المدير المباشر، رسالة من العميل، أو عبر كاميرات المراقبة).',
    },
  };
}

/* ===== Tab 2 (Attendance calculation from the decision PDF) ===== */
function getTab2Content(isAR) {
  if (!isAR) {
    return {
      section1: {
        title: '1) Attendance & Deductions',
        missing: {
          title: '1.1 Missing fingerprint (Check-in or Check-out)',
          points: [
            'Any missing fingerprint will deduct 1 working day.',
          ],
        },
        review: {
          title: 'Revision (within 24 hours, up to 3 times/month)',
          points: [
            'Employee may request a revision within 24 hours, up to 3 times per month.',
            'If CCTV review confirms the employee actually forgot to thumbprint, HR will add the missing record in the system.',
            'If CCTV review shows the employee did not attend or attempted any cheating, it will be considered absence and a double working day will be deducted.',
          ],
        },
        offday: {
          title: '1.2 Taking Off Day without informing / applying form',
          body: 'Any off day without informing the direct manager or without submitting the off-day form will deduct a double working day.',
        },
      },
      section2: {
        title: '2) Lateness Deduction (Company-wide rule)',
        desc:
          'New lateness deduction (and rewards) program under the new attendance system. One rule to follow for all staff:',
        table: {
          col1: 'Lateness (minutes)',
          col2: 'Deduction rule',
          rows: [
            { range: '0 → 180', rule: 'No deduction' },
            { range: '181 → 300', rule: 'Deduct lateness amount' },
            { range: '301++', rule: 'Deduct double lateness amount' },
          ],
        },
      },
      section3: {
        title: '3) Overtime Calculation',
        points: [
          'Each 1 hour of overtime is calculated as 1.5 hours, provided that overtime is assigned and signed by the direct manager and matches the employee thumbprint.',
          'Any overtime that does not match the employee thumbprint or lacks manager permission will not be calculated.',
          'If the employee requests overtime without necessity or to cover attendance shortage, it will be calculated as 1 hour.',
        ],
      },
    };
  }

  // Arabic
  return {
    section1: {
      title: '1) الحضور والخصومات',
      missing: {
        title: '1.1 البصمة المفقودة (دخول أو خروج)',
        points: [
          'يُخصم يوم عمل واحد عن كل بصمة مفقودة.',
        ],
      },
      review: {
        title: 'طلب المراجعة (خلال 24 ساعة وبحد أقصى 3 مرات شهريًا)',
        points: [
          'يجوز للموظف طلب المراجعة خلال 24 ساعة وبحد أقصى 3 مرات في الشهر.',
          'إذا ثبت عبر كاميرات المراقبة أن الموظف نسي فعلًا تسجيل البصمة، تقوم إدارة الموارد البشرية بإضافة البصمة المفقودة في النظام.',
          'إذا تبيّن أن الموظف لم يحضر أو وُجد أي نوع من الغش، تُحتسب غيابًا ويُخصم يوم عمل مضاعف.',
        ],
      },
      offday: {
        title: '1.2 إجازة دون إبلاغ/تقديم نموذج',
        body: 'أي إجازة دون إبلاغ المدير المباشر أو دون تقديم نموذج الإجازة يُخصم عنها يوم عمل مضاعف.',
      },
    },
    section2: {
      title: '2) خصومات التأخير (قاعدة موحّدة)',
      desc:
        'برنامج جديد لخصم التأخير (والمكافآت) ضمن نظام الحضور الجديد. قاعدة واحدة يتبعها جميع الموظفين:',
      table: {
        col1: 'التأخير (بالدقائق)',
        col2: 'قاعدة الخصم',
        rows: [
          { range: '0 → 180', rule: 'لا يوجد خصم' },
          { range: '181 → 300', rule: 'يتم خصم مقدار التأخير' },
          { range: '301++', rule: 'يتم خصم ضعف مقدار التأخير' },
        ],
      },
    },
    section3: {
      title: '3) احتساب العمل الإضافي',
      points: [
        'تُحتسب كل ساعة عمل إضافي بـ 1.5 ساعة بشرط تكليف العمل الإضافي وتوقيعه من المدير المباشر ومطابقته مع بصمة الموظف.',
        'لن يُحتسب أي عمل إضافي غير مطابق للبصمة أو من دون إذن المدير.',
        'إذا طلب الموظف عملًا إضافيًا دون ضرورة أو لتغطية نقص في الحضور، يُحتسب كساعة واحدة.',
      ],
    },
  };
}
