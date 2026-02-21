/*
 * Login.jsx
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Login form page. Submits credentials to AuthService, stores the returned token,
 * and redirects to the originally requested path after a successful login.
 * AI-assisted: form submission pattern, useNavigate + useLocation redirect; reviewed and directed by Ryan Loiselle.
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Form, Heading, InlineAlert, Text, TextField } from '@bcgov/design-system-react-components';
import { useAuth } from '../contexts/AuthContext';
import { AuthService } from '../api/AuthService';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userData = await AuthService.login(username, password);
      login(userData);
      
      // Redirect to the page they tried to access, or home
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <section className="section stack">
        <Heading level={1}>Login</Heading>
        <Text elementType="p">
          Enter your credentials to access the DSC system.
        </Text>
        {error && <InlineAlert variant="danger" title="Error" description={error} />}
        <Form onSubmit={handleSubmit} className="form-grid">
          <TextField
            label="Username"
            value={username}
            onChange={setUsername}
            placeholder="Username"
            isRequired
            isDisabled={loading}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Password"
            isRequired
            isDisabled={loading}
          />
          <div className="actions">
            <Button type="submit" variant="primary" isDisabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </Form>
        <Text elementType="p" className="hint">
          Test credentials: username: <strong>rloisel1</strong>, password: <strong>test-password-updated</strong>
        </Text>
      </section>
    </div>
  );
}
