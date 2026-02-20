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
