/*
 * ProjectService.js
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Axios wrapper for the user-facing projects endpoint (/api/projects).
 * AI-assisted: axios GET wrapper; reviewed and directed by Ryan Loiselle.
 */

import axios from 'axios';
import { getAuthConfig } from './AuthConfig';

const API_URL = '/api/projects';

export async function getProjects() {
  const res = await axios.get(API_URL, getAuthConfig());
  return res.data;
}

export async function createProject(project) {
  const res = await axios.post(API_URL, project);
  return res.data;
}
