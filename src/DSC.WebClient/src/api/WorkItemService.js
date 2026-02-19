import axios from 'axios';

const API_URL = '/api/items';

export async function getWorkItems() {
  const res = await axios.get(API_URL);
  return res.data;
}

export async function createWorkItem(item) {
  const res = await axios.post(API_URL, item);
  return res.data;
}
