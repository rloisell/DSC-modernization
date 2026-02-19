import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminExpense() {
  return (
    <div>
      <h1>Admin Expense</h1>
      <p>Legacy servlet: AdminExpense. This page will manage expense categories and options.</p>
      <p><Link to="/admin">Back to Administrator</Link></p>
      <section>
        <h2>Planned Actions</h2>
        <ul>
          <li>Create and edit expense categories.</li>
          <li>Define allowed expense options per category.</li>
        </ul>
      </section>
    </div>
  );
}
