import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminPositions() {
  return (
    <div>
      <h1>Admin Positions</h1>
      <p>Legacy servlet: AdminPositions. This page will manage position records.</p>
      <p><Link to="/admin">Back to Administrator</Link></p>
      <section>
        <h2>Planned Actions</h2>
        <ul>
          <li>Create new positions with title/description.</li>
          <li>Edit existing positions and retire obsolete ones.</li>
        </ul>
      </section>
    </div>
  );
}
