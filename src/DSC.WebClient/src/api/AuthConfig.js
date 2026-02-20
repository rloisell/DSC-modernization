// Utility to get axios config with authentication header
export function getAuthConfig() {
  const user = getUserFromStorage();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'withCredentials': true
    }
  };

  if (user && user.id) {
    config.headers['X-User-Id'] = user.id;
  }

  return config;
}

export function getUserFromStorage() {
  try {
    const storedUser = localStorage.getItem('dsc_user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (e) {
    console.error('Error parsing stored user:', e);
    return null;
  }
}
