import axios from 'axios';

const API_URL = '/api/projects';

export async function getProjects() {
  const res = await axios.get(API_URL);
  return res.data;
}

export async function createProject(project) {
  const res = await axios.post(API_URL, project);
  return res.data;
}
