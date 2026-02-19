import React, { useState } from 'react';

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
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Login</button>
      </form>
      {error ? <p style={{color:'red'}}>Error: {error}</p> : null}
      <p>Authentication is not yet implemented. This will be replaced with OIDC (Keycloak) integration.</p>
    </div>
  );
}
