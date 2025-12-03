// src/api/axios.js
import axios from 'axios';

export const API_BASE_URL =
  (process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor لإضافة Authorization header تلقائيًا
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Interceptor للردود
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // لو ما في response (مثلاً خطأ شبكة) رجّع الخطأ عادي
    if (!error.response) {
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // 🔴 أولاً: فحص ترخيص النظام
    if (status === 403 && data?.status === 'license_invalid') {
      // نخزّن فلاغ بسيط لو حابب تستخدمه لاحقاً
      localStorage.setItem('LICENSE_EXPIRED', '1');
      // تحويل إجباري لصفحة انتهاء الترخيص
      window.location.href = '/license-expired';
      return Promise.reject(error);
    }

    // 🔐 ثانياً: منطق انتهاء التوكن (يبقى كما هو)
    if (status === 401) {
      localStorage.clear();
      window.location.href = '/'; // مسار صفحة تسجيل الدخول
      return Promise.reject(error);
    }

    // لبقية الأخطاء، رجّع الخطأ كما هو
    return Promise.reject(error);
  }
);

export default instance;
