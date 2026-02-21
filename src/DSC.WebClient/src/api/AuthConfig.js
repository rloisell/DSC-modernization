/*
 * AuthConfig.js
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Utility helpers to read the current user session from localStorage
 * and construct an axios Authorization header config object for authenticated requests.
 * AI-assisted: localStorage session helper, axios config helper; reviewed and directed by Ryan Loiselle.
 */

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
