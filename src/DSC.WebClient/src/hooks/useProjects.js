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
