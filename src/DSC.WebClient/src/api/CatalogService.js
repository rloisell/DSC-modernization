import axios from 'axios';

const CATALOG_URL = '/api/catalog';

const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
};

export async function getActivityCodes() {
  const res = await axios.get(`${CATALOG_URL}/activity-codes`, axiosConfig);
  return res.data;
}

export async function getNetworkNumbers() {
  const res = await axios.get(`${CATALOG_URL}/network-numbers`, axiosConfig);
  return res.data;
}

export async function getBudgets() {
  const res = await axios.get(`${CATALOG_URL}/budgets`, axiosConfig);
  return res.data;
}

export async function getProjectOptions(projectId) {
  const res = await axios.get(`${CATALOG_URL}/project-options/${projectId}`, axiosConfig);
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
