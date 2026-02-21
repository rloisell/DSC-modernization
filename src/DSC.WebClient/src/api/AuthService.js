/*
 * AuthService.js
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Thin axios wrapper for the /api/auth/login endpoint.
 * Returns a token and user object on success; throws on invalid credentials.
 * AI-assisted: axios POST wrapper; reviewed and directed by Ryan Loiselle.
 */

import axios from 'axios';

export const AuthService = {
  async login(username, password) {
    // Simple authentication against the UserAuth table
    // In production, this would use OIDC/Keycloak
    // Uses relative path so Vite proxy forwards to http://localhost:5005
    const response = await axios.post('/api/auth/login', {
      username,
      password
    });
    return response.data;
  },

  async getCurrentUser(empId) {
    // Fetch user details including role
    // Uses relative path so Vite proxy forwards to http://localhost:5005
    const response = await axios.get(`/api/auth/user/${empId}`);
    return response.data;
  }
};
