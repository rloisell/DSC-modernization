/*
 * WorkItemService.js
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Axios wrappers for the work-item CRUD endpoints (/api/items).
 * Auth header is injected via getAuthConfig() on every request.
 * AI-assisted: axios CRUD wrapper scaffolding; reviewed and directed by Ryan Loiselle.
 */

import axios from 'axios';
import { getAuthConfig } from './AuthConfig';

const API_URL = '/api/items';

export async function getWorkItems(userId) {
  const params = {};
  if (userId) params.userId = userId;
  const res = await axios.get(API_URL, { params, ...getAuthConfig() });
  return res.data;
}

export async function getDetailedWorkItems(period = 'all', userId) {
  const params = { period };
  if (userId) params.userId = userId;
  const res = await axios.get(`${API_URL}/detailed`, {
    params,
    ...getAuthConfig()
  });
  return res.data;
}

export async function createWorkItem(item) {
  const res = await axios.post(API_URL, item, getAuthConfig());
  return res.data;
}

export async function updateWorkItem(id, payload) {
  await axios.put(`${API_URL}/${id}`, payload, getAuthConfig());
}

export async function deleteWorkItem(id) {
  await axios.delete(`${API_URL}/${id}`, getAuthConfig());
}

// Convenience helper to create a work item including legacy Java fields.
export async function createWorkItemWithLegacy({
  title,
  projectId,
  budgetId,
  description,
  legacyActivityId,
  date,
  startTime,
  endTime,
  plannedDuration,
  actualDuration,
  activityCode,
  networkNumber,
  directorCode,
  reasonCode,
  cpcCode,
  estimatedHours,
  remainingHours
}) {
  const payload = {
    title,
    projectId,
    budgetId,
    description,
    legacyActivityId,
    date,
    startTime,
    endTime,
    plannedDuration,
    actualDuration,
    activityCode,
    networkNumber,
    directorCode,
    reasonCode,
    cpcCode,
    estimatedHours,
    remainingHours
  };
  const res = await axios.post(API_URL, payload, getAuthConfig());
  return res.data;
}
