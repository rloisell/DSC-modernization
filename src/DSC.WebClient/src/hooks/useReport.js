/*
 * useReport.js
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * React Query hook that fetches a report summary from /api/reports/summary
 * with optional date range parameters.
 * AI-assisted: useQuery wrapper pattern; reviewed and directed by Ryan Loiselle.
 */

import { useQuery } from '@tanstack/react-query';
import { getReportSummary } from '../api/ReportService';

/**
 * Fetches a report summary, automatically re-fetching whenever the
 * filter params (`from`, `to`, or `projectId`) change.
 *
 * @param {{ from?: string, to?: string, projectId?: string }} params
 */
export function useReport({ from, to, projectId } = {}) {
  return useQuery({
    // Unique per filter combination — changing any filter triggers a fresh fetch
    queryKey: ['report', { from: from ?? null, to: to ?? null, projectId: projectId ?? null }],
    queryFn: () => getReportSummary({ from, to, projectId }),
    staleTime: 30 * 1000, // treat report data as fresh for 30 s
  });
}
