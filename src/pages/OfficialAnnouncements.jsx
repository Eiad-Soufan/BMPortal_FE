import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const OfficialAnnouncements = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('public');
  const [visible, setVisible] = useState(false);

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    // نفس نمط fade-in المستخدم في بقية الصفحات
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-10">
      <div
        className={`max-w-5xl mx-auto transition-all duration-500 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        {/* Title */}
        <div className={`mb-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {t('official_announcements_title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {t('official_announcements_subtitle')}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('public')}
            className={`px-4 py-2 text-sm font-medium transition
              ${
                activeTab === 'public'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-300'
              }`}
          >
            {t('tab_public_holidays')}
          </button>

          <button
            onClick={() => setActiveTab('leave')}
            className={`px-4 py-2 text-sm font-medium transition
              ${
                activeTab === 'leave'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-300'
              }`}
          >
            {t('tab_leave_days')}
          </button>
        </div>

        {/* Content */}
        <div
          className={`bg-white dark:bg-gray-800 rounded-xl shadow p-6 transition-all duration-300 ${
            isRTL ? 'text-right' : 'text-left'
          }`}
        >
          {activeTab === 'public' && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                {t('tab_public_holidays')}
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-4">
                سيتم عرض قائمة العطل الرسمية المعتمدة هنا.
              </p>

              <button className="text-green-600 hover:underline text-sm">
                {t('view_pdf')}
              </button>
            </div>
          )}

          {activeTab === 'leave' && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                {t('tab_leave_days')}
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-4">
                تفاصيل استحقاق الإجازات للموظفين الأجانب والخط الأمامي.
              </p>

              <button className="text-green-600 hover:underline text-sm">
                {t('view_pdf')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfficialAnnouncements;
