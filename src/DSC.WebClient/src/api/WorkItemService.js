import axios from 'axios';

const API_URL = '/api/items';

export async function getWorkItems(userId) {
  const params = {};
  if (userId) params.userId = userId;
  const res = await axios.get(API_URL, { params });
  return res.data;
}

export async function getDetailedWorkItems(period = 'all', userId) {
  const params = { period };
  if (userId) params.userId = userId;
  const res = await axios.get(`${API_URL}/detailed`, {
    params
  });
  return res.data;
}

export async function createWorkItem(item) {
  const res = await axios.post(API_URL, item);
  return res.data;
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
  const res = await axios.post(API_URL, payload);
  return res.data;
}
