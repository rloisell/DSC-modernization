import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';

export const AuthService = {
  async login(username, password) {
    // Simple authentication against the UserAuth table
    // In production, this would use OIDC/Keycloak
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      username,
      password
    });
    return response.data;
  },

  async getCurrentUser(empId) {
    // Fetch user details including role
    const response = await axios.get(`${API_BASE_URL}/api/auth/user/${empId}`);
    return response.data;
  }
};
