/*
 * useHealthCheck.js
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * React Query hook that fetches /api/health/details and exposes health check status
 * to the Health dashboard page. Refetches on a configurable interval.
 * AI-assisted: useQuery wrapper pattern; reviewed and directed by Ryan Loiselle.
 */

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

/**
 * Fetches the detailed health report from /api/health/details.
 *
 * The endpoint returns a JSON body even for unhealthy states (HTTP 200 always)
 * so the frontend can display individual check results rather than just a
 * binary healthy/unhealthy indication.
 *
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
async function fetchHealthDetails() {
  const { data } = await axios.get('/api/health/details');
  return data;
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health-details'],
    queryFn: fetchHealthDetails,
    // Poll every 30 seconds so the dashboard stays current
    refetchInterval: 30_000,
    // Always treat data as stale so each interval fetch goes to the server
    staleTime: 0,
    // Only retry once — a second failure likely means the API is down
    retry: 1,
    retryDelay: 3_000,
  });
}
