import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ProfileButton() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const username = localStorage.getItem('username') || localStorage.getItem('userName') || '';
  const fullName = localStorage.getItem('full_name') || localStorage.getItem('fullName') || '';
  const initial = (fullName || username || 'U').trim()[0]?.toUpperCase() || 'U';

  return (
    <button
      className="border-0 rounded-circle d-flex align-items-center justify-content-center"
      title={t('profile') || 'Profile'}
      onClick={() => navigate('/profile')}
      style={{
        width: 42, height: 42,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.15))',
        color: '#0b2e13',
        fontWeight: 800,
        boxShadow: '0 4px 18px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.5)'
      }}
    >
      {initial}
    </button>
  );
}
