// src/api/tasks.js — consolidated, reliable API layer
import axios from './axios';

const BASE = '/api/tasks/';

// List tasks (paginated)
export async function listTasks({ page = 1, page_size = 10 } = {}) {
  const res = await axios.get(BASE, { params: { page, page_size } });
  return res.data; // {count,next,previous,results}
}

// Get one task
export async function getTask(id) {
  const res = await axios.get(`${BASE}${id}/`);
  return res.data;
}

// Create task
export async function createTask(payload) {
  const res = await axios.post(BASE, payload);
  return res.data;
}

// Update task
export async function updateTask(id, payload) {
  const res = await axios.put(`${BASE}${id}/`, payload);
  return res.data;
}

// Mark success
export async function markTaskSuccess(id) {
  const res = await axios.post(`${BASE}${id}/mark-success/`);
  return res.data;
}

// Mark failed
export async function markTaskFailed(id) {
  const res = await axios.post(`${BASE}${id}/mark-failed/`);
  return res.data;
}

// Cancel task
export async function cancelTask(id) {
  const res = await axios.post(`${BASE}${id}/cancel/`);
  return res.data;
}

// Advance to next phase
export async function completeNextPhase(id, result) {
  const res = await axios.post(`${BASE}${id}/complete-next-phase/`, { result });
  return res.data;
}

// List comments
export async function listComments(id) {
  const res = await axios.get(`${BASE}${id}/comments/`);
  return res.data || [];
}

// Add comment
export async function addComment(id, text) {
  const res = await axios.post(`${BASE}${id}/comments/`, { text });
  return res.data;
}

// Backward-compatible default export
export default {
  listTasks,
  getTask,
  createTask,
  updateTask,
  completeNextPhase,
  listComments,
  addComment,
  markTaskSuccess,
  markTaskFailed,
  cancelTask,
};
