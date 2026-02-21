/*
 * useProjects.js
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * React Query hook that fetches the authenticated user's available projects from /api/projects.
 * AI-assisted: useQuery wrapper pattern; reviewed and directed by Ryan Loiselle.
 */

import { useQuery } from '@tanstack/react-query';
import { getProjects } from '../api/ProjectService';

/**
 * Fetches the current user's accessible projects.
 * Result is cached for 5 minutes — projects rarely change.
 */
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    staleTime: 5 * 60 * 1000,
  });
}
