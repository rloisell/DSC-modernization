import React, { useState } from 'react';
import { Heading, Text } from '@bcgov/design-system-react-components';
import AdminUsers from './AdminUsers';
import AdminRoles from './AdminRoles';
import AdminPositions from './AdminPositions';
import AdminDepartments from './AdminDepartments';
import AdminProjects from './AdminProjects';
import AdminExpense from './AdminExpense';
import AdminActivityOptions from './AdminActivityOptions';
import AdminProjectAssignments from './AdminProjectAssignments';

const TABS = [
  { id: 'users',            label: 'Users' },
  { id: 'roles',            label: 'Roles' },
  { id: 'positions',        label: 'Positions' },
  { id: 'departments',      label: 'Departments' },
  { id: 'projects',         label: 'Projects' },
  { id: 'assignments',      label: 'Assignments' },
  { id: 'expense',          label: 'Expense' },
  { id: 'activity-options', label: 'Activity Options' },
];

const TAB_COMPONENTS = {
  'users':            AdminUsers,
  'roles':            AdminRoles,
  'positions':        AdminPositions,
  'departments':      AdminDepartments,
  'projects':         AdminProjects,
  'assignments':      AdminProjectAssignments,
  'expense':          AdminExpense,
  'activity-options': AdminActivityOptions,
};

export default function Administrator() {
  const [activeTab, setActiveTab] = useState('users');
  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="page">
      <section className="section stack">
        <Heading level={1}>Administrator</Heading>
        <Text elementType="p">
          Manage users, roles, positions, departments, projects, expense options, and activity options.
        </Text>
      </section>

      {/* Tab bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0',
        borderBottom: '2px solid #003366',
        marginBottom: '1.5rem',
        padding: '0 1.5rem',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.6rem 1.2rem',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #003366' : '3px solid transparent',
              marginBottom: '-2px',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '700' : '400',
              color: activeTab === tab.id ? '#003366' : '#595959',
              fontSize: '0.95rem',
              transition: 'color 0.15s, border-bottom-color 0.15s',
            }}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Render active tab content */}
      <div role="tabpanel">
        <ActiveComponent />
      </div>
    </div>
  );
}

