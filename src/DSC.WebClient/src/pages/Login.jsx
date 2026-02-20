import React, { useState } from 'react';
import { Button, Form, Heading, InlineAlert, Text, TextField } from '@bcgov/design-system-react-components';

export default function Login() {
  // No authentication yet; just a placeholder for future OIDC integration.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    // No-op: authentication not implemented
    alert('Authentication is not yet implemented.');
  }

  return (
    <div className="page">
      <section className="section stack">
        <Heading level={1}>Login</Heading>
        <Text elementType="p">
          Authentication is not yet implemented. This will be replaced with OIDC (Keycloak) integration.
        </Text>
        <Form onSubmit={handleSubmit} className="form-grid">
          <TextField
            label="Username"
            value={username}
            onChange={setUsername}
            placeholder="Username"
            isRequired
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Password"
            isRequired
          />
          <div className="actions">
            <Button type="submit" variant="primary">Login</Button>
          </div>
        </Form>
        {error ? <InlineAlert variant="danger" title="Error" description={error} /> : null}
      </section>
    </div>
  );
}
