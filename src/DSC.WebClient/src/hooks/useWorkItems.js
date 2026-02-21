/*
 * useWorkItems.js
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * React Query hook providing work-item read, create, update, and delete mutations
 * for the Activity page. Invalidates the work-items cache on every mutation.
 * AI-assisted: useMutation + cache invalidation pattern; reviewed and directed by Ryan Loiselle.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWorkItems,
  getDetailedWorkItems,
  createWorkItemWithLegacy,
  updateWorkItem,
  deleteWorkItem,
} from '../api/WorkItemService';

/**
 * Fetches all (or user-scoped) work items.
 * @param {string|undefined} userId  – UUID string, omit for all
 */
export function useWorkItems(userId) {
  return useQuery({
    queryKey: ['work-items', userId],
    queryFn: () => getWorkItems(userId),
  });
}

/**
 * Fetches detailed work items with optional period / date-range filters.
 */
export function useDetailedWorkItems(period = 'month', userId) {
  return useQuery({
    queryKey: ['work-items-detailed', period, userId],
    queryFn: () => getDetailedWorkItems(period, userId),
  });
}

/**
 * Mutation: creates a new work item and invalidates the cache.
 */
export function useCreateWorkItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWorkItemWithLegacy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-items'] });
    },
  });
}

/**
 * Mutation: updates a work item and invalidates the cache.
 */
export function useUpdateWorkItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateWorkItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-items'] });
    },
  });
}

/**
 * Mutation: deletes a work item and invalidates the cache.
 */
export function useDeleteWorkItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteWorkItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-items'] });
    },
  });
}
