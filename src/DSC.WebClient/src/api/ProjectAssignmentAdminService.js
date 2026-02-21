/*
 * ProjectAssignmentAdminService.js
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Axios wrappers for the project-assignment admin endpoints (/api/adminprojectassignments).
 * AI-assisted: axios CRUD wrapper scaffolding; reviewed and directed by Ryan Loiselle.
 */

import axios from 'axios';

const API_URL = '/api/adminprojectassignments';

export async function getAssignments(projectId) {
  const params = projectId ? { projectId } : {};
  const res = await axios.get(API_URL, { params });
  return res.data;
}

export async function getAssignmentsByProject(projectId) {
  const res = await axios.get(`${API_URL}/project/${projectId}`);
  return res.data;
}

export async function createAssignment(payload) {
  const res = await axios.post(API_URL, payload);
  return res.data;
}

export async function updateAssignment(projectId, userId, payload) {
  await axios.put(`${API_URL}/${projectId}/${userId}`, payload);
}

export async function deleteAssignment(projectId, userId) {
  await axios.delete(`${API_URL}/${projectId}/${userId}`);
}
