import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDepartments() {
  return (
    <div>
      <h1>Admin Departments</h1>
      <p>Legacy servlet: AdminDepartments. This page will manage department records.</p>
      <p><Link to="/admin">Back to Administrator</Link></p>
      <section>
        <h2>Planned Actions</h2>
        <ul>
          <li>Create and edit departments.</li>
          <li>Assign managers and set department metadata.</li>
        </ul>
      </section>
    </div>
  );
}
