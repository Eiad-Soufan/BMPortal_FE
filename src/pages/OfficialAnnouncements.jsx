import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const OfficialAnnouncements = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div
        className={`max-w-6xl mx-auto transition-all duration-500 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Page Header */}
        <div className={`mb-10 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            {t('official_announcements_title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {t('official_announcements_subtitle')}
          </p>
        </div>

        {/* ===== Card: Public Holidays ===== */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('tab_public_holidays')}
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            تشمل هذه القائمة العطل الرسمية المعتمدة لسنة 2026 للموظفين المحليين
            وموظفي المكاتب، وفق التقويم الرسمي المعتمد من الإدارة.
            يبلغ عدد العطل الرسمية المعتمدة <strong>11 يومًا</strong> خلال السنة.
          </p>

          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 mb-6">
            <li>New Year’s Day</li>
            <li>Chinese New Year</li>
            <li>Hari Raya Aidilfitri</li>
            <li>Labour Day</li>
            <li>Wesak Day</li>
            <li>Agong’s Birthday</li>
            <li>Hari Raya Haji</li>
            <li>Malaysia Day</li>
            <li>Deepavali</li>
            <li>Christmas Day</li>
          </ul>

          <a
            href="/pdf/public-holidays-2026.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-green-600 hover:underline text-sm font-medium"
          >
            {t('view_pdf')}
          </a>
        </div>

        {/* ===== Card: Leave Entitlement ===== */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            {t('tab_leave_days')}
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            يوضح هذا القسم آلية استحقاق الإجازات السنوية للموظفين الأجانب
            وموظفي الخط الأمامي، ويتم احتساب الإجازات تدريجيًا على مدار السنة
            حسب الربع السنوي.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Quarter 1</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                5 أيام إجازة
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Quarter 2</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                4 أيام إجازة
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Quarter 3</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                3 أيام إجازة
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Quarter 4</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                يومان إجازة
              </p>
            </div>
          </div>

          <a
            href="/pdf/leave-entitlement-2026.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-green-600 hover:underline text-sm font-medium"
          >
            {t('view_pdf')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default OfficialAnnouncements;
