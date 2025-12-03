// src/api/surveys.js
import axios from './axios';

// استرجاع قائمة الاستبيانات
export async function listSurveys({ page = 1, page_size = 10 } = {}) {
  const r = await axios.get('/api/surveys/', { params: { page, page_size } });
  return r?.data; // {count, next, previous, results}
}

// استرجاع تفاصيل استبيان واحد (للموظف أو المدير/HR)
export async function getSurvey(id) {
  const r = await axios.get(`/api/surveys/${id}/`);
  return r?.data;
}

// إنشاء استبيان (للمدير/HR فقط)
export async function createSurvey(payload) {
  const r = await axios.post('/api/surveys/', payload);
  return r?.data;
}

// تعديل استبيان (للمدير/HR فقط)
export async function updateSurvey(id, payload) {
  const r = await axios.put(`/api/surveys/${id}/`, payload);
  return r?.data;
}

// إرسال إجابات الموظف
export async function submitSurvey(id, answers) {
  const r = await axios.post(`/api/surveys/${id}/submit/`, { answers });
  return r?.data;
}

// نتائج الاستبيان (للمدير/HR فقط)
export async function getSurveyResults(id) {
  const r = await axios.get(`/api/surveys/${id}/results/`);
  return r?.data;
}


export async function getMySubmission(id) {
  const r = await axios.get(`/api/surveys/${id}/my_submission/`);
  return r?.data; // {exists: bool, submission?: {...}}
}

export async function changeSurveyStatus(id, status) {
  const r = await axios.post(`/api/surveys/${id}/change_status/`, { status });
  return r?.data;
}