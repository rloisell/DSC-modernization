/*
 * ReportService.js
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Axios wrappers for the report summary endpoint with optional date range filtering.
 * AI-assisted: axios GET wrapper with query params; reviewed and directed by Ryan Loiselle.
 */

import axios from 'axios';
import { getAuthConfig } from './AuthConfig';

const API_URL = '/api/reports';

export async function getReportSummary({ from, to, projectId, userId } = {}) {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  if (projectId) params.projectId = projectId;
  if (userId) params.userId = userId;
  const res = await axios.get(`${API_URL}/summary`, { params, ...getAuthConfig() });
  return res.data;
}

export function exportToCSV(data) {
  const rows = [];
  rows.push(['--- Project Summary ---']);
  rows.push(['Project No', 'Project Name', 'Est. Hours', 'Actual Hours', 'Variance', 'Status']);
  data.projectSummaries.forEach(p => {
    rows.push([
      p.projectNo, p.projectName,
      p.estimatedHours ?? '—', p.actualHours,
      p.variance != null ? p.variance : '—',
      p.isOverBudget ? 'OVERBUDGET' : 'On Track'
    ]);
  });

  rows.push([]);
  rows.push(['--- Activity Code Summary ---']);
  rows.push(['Activity Code', 'Total Hours', 'Item Count']);
  data.activityCodeSummaries.forEach(a => {
    rows.push([a.activityCode, a.totalHours, a.itemCount]);
  });

  if (data.userSummaries?.length) {
    rows.push([]);
    rows.push(['--- User Summary ---']);
    rows.push(['Name', 'Username', 'Total Hours', 'Projects', 'Items']);
    data.userSummaries.forEach(u => {
      rows.push([u.fullName, u.username, u.totalHours, u.projectCount, u.itemCount]);
    });
  }

  const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dsc-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
