import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminProjects() {
  return (
    <div>
      <h1>Admin Projects</h1>
      <p>Legacy servlet: AdminProjects. This page will manage project metadata and assignments.</p>
      <p><Link to="/admin">Back to Administrator</Link></p>
      <section>
        <h2>Planned Actions</h2>
        <ul>
          <li>Edit project metadata (name, description, legacy project number).</li>
          <li>Assign network numbers and activity codes to projects.</li>
        </ul>
      </section>
    </div>
  );
}
