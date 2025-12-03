// src/components/HonorBoard.jsx
import { jwtDecode } from 'jwt-decode';
import { useEffect, useMemo, useRef, useState } from 'react';
import axios, { API_BASE_URL } from '../api/axios';

function absMedia(url) {
  if (!url) return null;
  if (/^(https?:)?\/\//i.test(url) || /^data:/i.test(url)) return url;

  const origin = API_BASE_URL.replace(/\/$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

function CrownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3.5 7.5 7 11l3-7 3 7 3.5-3.5L21 12l-2 7H5L3 12l.5-4.5Z"
        fill="#f4b41a"
        stroke="#c98a00"
        strokeWidth="1"
      />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 4h10v3a5 5 0 0 1-4 4.9V14h2v2H9v-2h2v-2.1A5 5 0 0 1 7 7V4Zm-2 1h2v3a3 3 0 0 1-3 3H3V7a2 2 0 0 1 2-2Zm14 0h-2v3a3 3 0 0 0 3 3h1V7a2 2 0 0 0-2-2Z"
        fill="#9fa8da"
      />
    </svg>
  );
}

function Featured({ title, list, accent }) {
  const featured = list?.[0] || null;
  const others = (list || []).slice(1);

  const mainName = featured
    ? featured.full_name || featured.username || ''
    : '';

  return (
    <div className="hb-card" style={{ borderColor: accent }}>
      <div className="hb-card__head" style={{ color: accent }}>
        <span className="hb-icon">
          {title === 'الشهر' ? <CrownIcon /> : <TrophyIcon />}
        </span>
        <strong>موظف {title}</strong>
      </div>

      {featured ? (
        <div className="hb-main">
          <div className="hb-avatar">
            {featured.avatar ? (
              <img
                src={absMedia(featured.avatar)}
                alt={mainName || 'avatar'}
              />
            ) : (
              <span>{(mainName || '?').charAt(0)}</span>
            )}
          </
