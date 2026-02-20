import axios from 'axios';

const CATALOG_URL = '/api/catalog';

export async function getActivityCodes() {
  const res = await axios.get(`${CATALOG_URL}/activity-codes`);
  return res.data;
}

export async function getNetworkNumbers() {
  const res = await axios.get(`${CATALOG_URL}/network-numbers`);
  return res.data;
}

export async function getBudgets() {
  const res = await axios.get(`${CATALOG_URL}/budgets`);
  return res.data;
}
