import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  ButtonGroup,
  Form,
  Heading,
  InlineAlert,
  Select,
  Text,
  TextField
} from '@bcgov/design-system-react-components';
import { getAdminUsers } from '../api/AdminUserService';
import { AdminCatalogService } from '../api/AdminCatalogService';
import SubTabs from '../components/SubTabs';

export default function AdminDepartments() {
  const [message, setMessage] = useState('');
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', manager: '', status: 'active' });
  const [editingId, setEditingId] = useState('');
  const [subTab, setSubTab] = useState('list');
  const navigate = useNavigate();

  const statusItems = [
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' }
  ];

  const userItems = users.map(u => {
    const displayName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || u.email;
    return {
      id: u.id,
      label: displayName,
      description: u.email || undefined
    };
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [deptsData, usersData] = await Promise.all([
          AdminCatalogService.getDepartments(),
          getAdminUsers()
        ]);
        setDepartments(deptsData);
        setUsers(usersData);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  function updateForm(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError(null);
    try {
      // Look up the selected user's name if manager is a user ID
      let managerName = form.manager || '';
      if (form.manager && form.manager !== '') {
        const selectedUser = users.find(u => u.id === form.manager);
        if (selectedUser) {
          managerName = `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() || selectedUser.username;
        }
      }

      if (editingId) {
        await AdminCatalogService.updateDepartment(editingId, {
          name: form.name,
          managerName: managerName,
          isActive: form.status === 'active'
        });
      } else {
        await AdminCatalogService.createDepartment({
          name: form.name,
          managerName: managerName
        });
      }
      const refreshed = await AdminCatalogService.getDepartments();
      setDepartments(refreshed);
      setForm({ name: '', manager: '', status: 'active' });
      setEditingId('');
      setMessage(editingId ? 'Department updated.' : 'Department created.');
    } catch (e) {
      setError(e.message);
    }
  }

  function handleEdit(dept) {
    setEditingId(dept.id);
    setSubTab('form');
    // Try to find the user by name when editing
    let managerId = '';
    if (dept.managerName) {
      const matchedUser = users.find(u => {
        const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
        return fullName === dept.managerName || u.username === dept.managerName;
      });
      managerId = matchedUser ? matchedUser.id : '';
    }
    setForm({
      name: dept.name,
      manager: managerId,
      status: dept.isActive ? 'active' : 'inactive'
    });
  }

  async function handleDeactivate(dept) {
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.updateDepartment(dept.id, {
        name: dept.name,
        managerName: dept.managerName,
        isActive: false
      });
      const refreshed = await AdminCatalogService.getDepartments();
      setDepartments(refreshed);
      setMessage('Department deactivated.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(dept) {
    if (!window.confirm(`Delete department "${dept.name}"? This cannot be undone.`)) {
      return;
    }
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.deleteDepartment(dept.id);
      const refreshed = await AdminCatalogService.getDepartments();
      setDepartments(refreshed);
      setMessage('Department deleted.');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="page">
      <section className="section stack">
        <Heading level={1}>Admin Departments</Heading>
        <Text elementType="p">Legacy servlet: AdminDepartments. This page will manage department records.</Text>

      </section>
      <SubTabs
        tabs={[
          { id: 'list', label: 'Departments' },
          { id: 'form', label: 'Add / Edit' },
        ]}
        activeTab={subTab}
        onTabChange={setSubTab}
      />
      {subTab === 'form' && (
      <section className="section stack">
        <Heading level={2}>{editingId ? 'Edit Department' : 'Add Department'}</Heading>
        <Form onSubmit={handleSubmit} className="form-grid">
          <TextField
            label="Department Name"
            value={form.name}
            onChange={value => updateForm('name', value)}
            isRequired
          />
          <Select
            label="Manager"
            placeholder="Select a manager"
            items={userItems}
            selectedKey={form.manager || null}
            onSelectionChange={key => updateForm('manager', key ? String(key) : '')}
            description="Optional: assign a user as department manager"
          />
          <Select
            label="Status"
            items={statusItems}
            selectedKey={form.status}
            onSelectionChange={key => updateForm('status', String(key))}
          />
          <ButtonGroup alignment="start" ariaLabel="Department actions">
            <Button type="submit" variant="primary">
              {editingId ? 'Save Department' : 'Create Department'}
            </Button>
            {editingId ? (
              <Button
                type="button"
                variant="tertiary"
                onPress={() => {
                  setEditingId('');
                  setForm({ name: '', manager: '', status: 'active' });
                  setMessage('');
                  setError(null);
                  setSubTab('list');
                }}
              >
                Cancel
              </Button>
            ) : null}
          </ButtonGroup>
        </Form>
      </section>
      )}
      {subTab === 'list' && (
      <section className="section stack">
        <Heading level={2}>Existing Departments</Heading>
        <table className="bcds-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Manager</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(dept => (
              <tr key={dept.id}>
                <td>{dept.name}</td>
                <td>{dept.managerName || '-'}</td>
                <td>{dept.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <div className="actions">
                    <Button size="small" variant="tertiary" onPress={() => handleEdit(dept)}>Edit</Button>
                    <Button size="small" variant="tertiary" danger onPress={() => handleDeactivate(dept)}>
                      Deactivate
                    </Button>
                    <Button size="small" variant="secondary" danger onPress={() => handleDelete(dept)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      )}
      {loading ? <Text elementType="p">Loading...</Text> : null}
      {error ? <InlineAlert variant="danger" title="Error" description={error} /> : null}
      {message ? <InlineAlert variant="success" title="Success" description={message} /> : null}
    </div>
  );
}
