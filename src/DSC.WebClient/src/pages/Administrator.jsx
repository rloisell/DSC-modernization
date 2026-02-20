import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonGroup, Heading, Text } from '@bcgov/design-system-react-components';

function AdminLinkButton({ to, children }) {
  const navigate = useNavigate();
  return (
    <Button variant="secondary" onPress={() => navigate(to)}>
      {children}
    </Button>
  );
}

export default function Administrator() {
  // In the legacy JSP, this page links to admin subpages. We'll keep them as routes for now.
  return (
    <div className="page">
      <section className="section stack">
        <Heading level={1}>Administrator</Heading>
        <Text elementType="p">
          Admin sections are now wired to the catalog and user APIs. Use the buttons below to manage users,
          positions, departments, projects, expense options, and activity options.
        </Text>
        <ButtonGroup ariaLabel="Admin sections" alignment="start">
          <AdminLinkButton to="/admin/users">Admin Users</AdminLinkButton>
          <AdminLinkButton to="/admin/roles">Admin Roles</AdminLinkButton>
          <AdminLinkButton to="/admin/positions">Admin Positions</AdminLinkButton>
          <AdminLinkButton to="/admin/departments">Admin Departments</AdminLinkButton>
          <AdminLinkButton to="/admin/projects">Admin Projects</AdminLinkButton>
          <AdminLinkButton to="/admin/expense">Admin Expense</AdminLinkButton>
          <AdminLinkButton to="/admin/activity-options">Admin Activity Options</AdminLinkButton>
        </ButtonGroup>
      </section>
    </div>
  );
}
