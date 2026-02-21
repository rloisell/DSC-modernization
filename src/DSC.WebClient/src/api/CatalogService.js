/*
 * CatalogService.js
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Axios wrappers for the public catalog read endpoints: activity codes, network numbers,
 * budgets, director/reason/CPC codes, and the project-options join query.
 * AI-assisted: axios GET wrapper scaffolding; reviewed and directed by Ryan Loiselle.
 */

import axios from 'axios';
import { getAuthConfig } from './AuthConfig';

const CATALOG_URL = '/api/catalog';

export async function getActivityCodes() {
  const res = await axios.get(`${CATALOG_URL}/activity-codes`, getAuthConfig());
  return res.data;
}

export async function getNetworkNumbers() {
  const res = await axios.get(`${CATALOG_URL}/network-numbers`, getAuthConfig());
  return res.data;
}

export async function getBudgets() {
  const res = await axios.get(`${CATALOG_URL}/budgets`, getAuthConfig());
  return res.data;
}

export async function getProjectOptions(projectId) {
  const res = await axios.get(`${CATALOG_URL}/project-options/${projectId}`, getAuthConfig());
  return res.data;
}

export async function getDirectorCodes() {
  const res = await axios.get(`${CATALOG_URL}/director-codes`);
  return res.data;
}

export async function getReasonCodes() {
  const res = await axios.get(`${CATALOG_URL}/reason-codes`);
  return res.data;
}

export async function getCpcCodes() {
  const res = await axios.get(`${CATALOG_URL}/cpc-codes`);
  return res.data;
}
