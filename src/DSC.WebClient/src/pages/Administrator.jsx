import React from 'react';

export default function Administrator() {
  // In the legacy JSP, this page links to admin subpages. We'll just show the links for now.
  return (
    <div>
      <h1>Administrator</h1>
      <ul>
        <li><a href="#">Admin Users</a></li>
        <li><a href="#">Admin Positions</a></li>
        <li><a href="#">Admin Departments</a></li>
        <li><a href="#">Admin Projects</a></li>
        <li><a href="#">Admin Expense</a></li>
        <li><a href="#">Admin Activity Options</a></li>
      </ul>
      <p>Subpages will be ported as React routes/components.</p>
    </div>
  );
}
