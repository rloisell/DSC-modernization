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
