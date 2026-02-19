import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminActivityOptions() {
  return (
    <div>
      <h1>Admin Activity Options</h1>
      <p>Legacy servlet: AdminActivityOptions. This page will manage activity codes and network numbers.</p>
      <p><Link to="/admin">Back to Administrator</Link></p>
      <section>
        <h2>Planned Actions</h2>
        <ul>
          <li>Manage activity codes (code + description).</li>
          <li>Manage network numbers for SAP integration.</li>
        </ul>
      </section>
    </div>
  );
}
