/*
 * AdminCatalogService.js
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Axios wrappers for admin catalog reference-data CRUD endpoints.
 * Covers all lookup entity types (roles, activity codes, departments, etc.) using the same
 * GET/POST/PUT/DELETE pattern per entity.
 * AI-assisted: CRUD wrapper scaffolding; reviewed and directed by Ryan Loiselle.
 */

import axios from 'axios';

export const AdminCatalogService = {
  async getPositions() {
    const res = await axios.get('/api/admin/positions');
    return res.data;
  },
  async createPosition(payload) {
    const res = await axios.post('/api/admin/positions', payload);
    return res.data;
  },
  async updatePosition(id, payload) {
    await axios.put(`/api/admin/positions/${id}`, payload);
  },
  async deletePosition(id) {
    await axios.delete(`/api/admin/positions/${id}`);
  },

  async getDepartments() {
    const res = await axios.get('/api/admin/departments');
    return res.data;
  },
  async createDepartment(payload) {
    const res = await axios.post('/api/admin/departments', payload);
    return res.data;
  },
  async updateDepartment(id, payload) {
    await axios.put(`/api/admin/departments/${id}`, payload);
  },
  async deleteDepartment(id) {
    await axios.delete(`/api/admin/departments/${id}`);
  },

  async getUnions() {
    const res = await axios.get('/api/admin/unions');
    return res.data;
  },
  async createUnion(payload) {
    const res = await axios.post('/api/admin/unions', payload);
    return res.data;
  },
  async updateUnion(id, payload) {
    await axios.put(`/api/admin/unions/${id}`, payload);
  },

  async getRoles() {
    const res = await axios.get('/api/admin/roles');
    return res.data;
  },
  async createRole(payload) {
    const res = await axios.post('/api/admin/roles', payload);
    return res.data;
  },
  async updateRole(id, payload) {
    await axios.put(`/api/admin/roles/${id}`, payload);
  },

  async getProjects() {
    const res = await axios.get('/api/admin/projects');
    return res.data;
  },
  async createProject(payload) {
    const res = await axios.post('/api/admin/projects', payload);
    return res.data;
  },
  async updateProject(id, payload) {
    await axios.put(`/api/admin/projects/${id}`, payload);
  },
  async deleteProject(id) {
    await axios.delete(`/api/admin/projects/${id}`);
  },

  async getExpenseCategories() {
    const res = await axios.get('/api/admin/expense-categories');
    return res.data;
  },
  async createExpenseCategory(payload) {
    const res = await axios.post('/api/admin/expense-categories', payload);
    return res.data;
  },
  async updateExpenseCategory(id, payload) {
    await axios.put(`/api/admin/expense-categories/${id}`, payload);
  },
  async deleteExpenseCategory(id) {
    await axios.delete(`/api/admin/expense-categories/${id}`);
  },

  async getBudgets() {
    const res = await axios.get('/api/admin/budgets');
    return res.data;
  },
  async createBudget(payload) {
    const res = await axios.post('/api/admin/budgets', payload);
    return res.data;
  },
  async updateBudget(id, payload) {
    await axios.put(`/api/admin/budgets/${id}`, payload);
  },
  async deleteBudget(id) {
    await axios.delete(`/api/admin/budgets/${id}`);
  },

  async getActivityCategories() {
    const res = await axios.get('/api/admin/activity-categories');
    return res.data;
  },
  async createActivityCategory(payload) {
    const res = await axios.post('/api/admin/activity-categories', payload);
    return res.data;
  },
  async updateActivityCategory(id, payload) {
    await axios.put(`/api/admin/activity-categories/${id}`, payload);
  },

  async getCalendarCategories() {
    const res = await axios.get('/api/admin/calendar-categories');
    return res.data;
  },
  async createCalendarCategory(payload) {
    const res = await axios.post('/api/admin/calendar-categories', payload);
    return res.data;
  },
  async updateCalendarCategory(id, payload) {
    await axios.put(`/api/admin/calendar-categories/${id}`, payload);
  },

  async getExpenseOptions(categoryId) {
    const res = await axios.get('/api/admin/expense-options', {
      params: categoryId ? { categoryId } : undefined
    });
    return res.data;
  },
  async createExpenseOption(payload) {
    const res = await axios.post('/api/admin/expense-options', payload);
    return res.data;
  },
  async updateExpenseOption(id, payload) {
    await axios.put(`/api/admin/expense-options/${id}`, payload);
  },
  async deleteExpenseOption(id) {
    await axios.delete(`/api/admin/expense-options/${id}`);
  },

  async getActivityCodes() {
    const res = await axios.get('/api/admin/activity-codes');
    return res.data;
  },
  async createActivityCode(payload) {
    const res = await axios.post('/api/admin/activity-codes', payload);
    return res.data;
  },
  async updateActivityCode(id, payload) {
    await axios.put(`/api/admin/activity-codes/${id}`, payload);
  },
  async deleteActivityCode(id) {
    await axios.delete(`/api/admin/activity-codes/${id}`);
  },

  async getCpcCodes() {
    const res = await axios.get('/api/admin/cpc-codes');
    return res.data;
  },
  async createCpcCode(payload) {
    const res = await axios.post('/api/admin/cpc-codes', payload);
    return res.data;
  },
  async updateCpcCode(code, payload) {
    await axios.put(`/api/admin/cpc-codes/${code}`, payload);
  },

  async getDirectorCodes() {
    const res = await axios.get('/api/admin/director-codes');
    return res.data;
  },
  async createDirectorCode(payload) {
    const res = await axios.post('/api/admin/director-codes', payload);
    return res.data;
  },
  async updateDirectorCode(code, payload) {
    await axios.put(`/api/admin/director-codes/${code}`, payload);
  },

  async getReasonCodes() {
    const res = await axios.get('/api/admin/reason-codes');
    return res.data;
  },
  async createReasonCode(payload) {
    const res = await axios.post('/api/admin/reason-codes', payload);
    return res.data;
  },
  async updateReasonCode(code, payload) {
    await axios.put(`/api/admin/reason-codes/${code}`, payload);
  },

  async getUnions() {
    const res = await axios.get('/api/admin/unions');
    return res.data;
  },
  async createUnion(payload) {
    const res = await axios.post('/api/admin/unions', payload);
    return res.data;
  },
  async updateUnion(id, payload) {
    await axios.put(`/api/admin/unions/${id}`, payload);
  },

  async getNetworkNumbers() {
    const res = await axios.get('/api/admin/network-numbers');
    return res.data;
  },
  async createNetworkNumber(payload) {
    const res = await axios.post('/api/admin/network-numbers', payload);
    return res.data;
  },
  async updateNetworkNumber(id, payload) {
    await axios.put(`/api/admin/network-numbers/${id}`, payload);
  },
  async deleteNetworkNumber(id) {
    await axios.delete(`/api/admin/network-numbers/${id}`);
  },

  async getProjectActivityOptions(projectId) {
    const res = await axios.get('/api/admin/project-activity-options', {
      params: projectId ? { projectId } : undefined
    });
    return res.data;
  },
  async createProjectActivityOption(payload) {
    const res = await axios.post('/api/admin/project-activity-options', payload);
    return res.data;
  },
  async assignAllActivityOptionsToProject(projectId) {
    const res = await axios.post('/api/admin/project-activity-options/assign-all', { projectId });
    return res.data;
  },
  async deleteProjectActivityOption(projectId, activityCodeId, networkNumberId) {
    await axios.delete('/api/admin/project-activity-options', {
      params: { projectId, activityCodeId, networkNumberId }
    });
  }
};
