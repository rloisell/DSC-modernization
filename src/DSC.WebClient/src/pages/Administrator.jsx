import React from 'react';
import { Link } from 'react-router-dom';

export default function Administrator() {
  // In the legacy JSP, this page links to admin subpages. We'll keep them as routes for now.
  return (
    <div>
      <h1>Administrator</h1>
      <ul>
        <li><Link to="/admin/users">Admin Users</Link></li>
        <li><Link to="/admin/positions">Admin Positions</Link></li>
        <li><Link to="/admin/departments">Admin Departments</Link></li>
        <li><Link to="/admin/projects">Admin Projects</Link></li>
        <li><Link to="/admin/expense">Admin Expense</Link></li>
        <li><Link to="/admin/activity-options">Admin Activity Options</Link></li>
      </ul>
      <p>Subpages are stubbed for now and will be expanded during the admin port.</p>
    </div>
  );
}
