import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const OfficialAnnouncements = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('public');

  const isRTL = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto"
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
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`bg-white dark:bg-gray-800 rounded-xl shadow p-6 ${
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
                (سيتم ربط ملف PDF أو جدول منظم لاحقًا)
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
                سيتم عرض تفاصيل استحقاق الإجازات للموظفين الأجانب والخط الأمامي هنا،
                مع تقسيم الاستحقاق السنوي.
              </p>

              <button className="text-green-600 hover:underline text-sm">
                {t('view_pdf')}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OfficialAnnouncements;
