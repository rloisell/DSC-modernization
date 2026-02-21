import axios from 'axios';

const API_URL = '/api/admin/users';

export async function getAdminUsers() {
  const res = await axios.get(API_URL);
  return res.data;
}

export async function createAdminUser(payload) {
  const res = await axios.post(API_URL, payload);
  return res.data;
}

export async function updateAdminUser(id, payload) {
  await axios.put(`${API_URL}/${id}`, payload);
}

export async function deleteAdminUser(id) {
  await axios.delete(`${API_URL}/${id}`);
}

export async function deactivateAdminUser(id) {
  await axios.patch(`${API_URL}/${id}/deactivate`);
}

export async function activateAdminUser(id) {
  await axios.patch(`${API_URL}/${id}/activate`);
}
