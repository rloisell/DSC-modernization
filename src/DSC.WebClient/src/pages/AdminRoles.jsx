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
import { AdminCatalogService } from '../api/AdminCatalogService';

export default function AdminRoles() {
  const [message, setMessage] = useState('');
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', status: 'active' });
  const [editingId, setEditingId] = useState('');
  const navigate = useNavigate();

  const statusItems = [
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' }
  ];

  const roleItems = roles.map(r => ({
    id: r.id,
    label: r.name,
    description: r.description || undefined
  }));

  useEffect(() => {
    AdminCatalogService.getRoles()
      .then(setRoles)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function updateForm(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError(null);
    try {
      if (editingId) {
        await AdminCatalogService.updateRole(editingId, {
          name: form.name,
          description: form.description,
          isActive: form.status === 'active'
        });
      } else {
        await AdminCatalogService.createRole({
          name: form.name,
          description: form.description
        });
      }
      const refreshed = await AdminCatalogService.getRoles();
      setRoles(refreshed);
      setForm({ name: '', description: '', status: 'active' });
      setEditingId('');
      setMessage(editingId ? 'Role updated.' : 'Role created.');
    } catch (e) {
      setError(e.message);
    }
  }

  function handleEdit(role) {
    setEditingId(role.id);
    setForm({
      name: role.name,
      description: role.description || '',
      status: role.isActive ? 'active' : 'inactive'
    });
  }

  async function handleDeactivate(role) {
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.updateRole(role.id, {
        name: role.name,
        description: role.description,
        isActive: false
      });
      const refreshed = await AdminCatalogService.getRoles();
      setRoles(refreshed);
      setMessage('Role deactivated.');
    } catch (e) {
      setError(e.message);
    }
  }

  function handleCancel() {
    setEditingId('');
    setForm({ name: '', description: '', status: 'active' });
  }

  return (
    <div className="page">
      <section className="section stack">
        <Heading level={1}>Admin Roles</Heading>
        <Text elementType="p">Manage system roles for user assignments.</Text>
        <div className="page-actions">
          <Button variant="link" onPress={() => navigate('/admin')}>Back to Administrator</Button>
        </div>
      </section>
      <section className="section stack">
        <Heading level={2}>{editingId ? 'Edit Role' : 'Create New Role'}</Heading>
        <Form onSubmit={handleSubmit} className="form-grid">
          <TextField
            label="Role Name"
            value={form.name}
            onChange={value => updateForm('name', value)}
            isRequired
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={value => updateForm('description', value)}
            description="Optional description of the role"
          />
          <Select
            label="Status"
            items={statusItems}
            selectedKey={form.status}
            onSelectionChange={key => updateForm('status', String(key))}
          />
          <ButtonGroup alignment="start" ariaLabel="Role actions">
            <Button type="submit" variant="primary">
              {editingId ? 'Update Role' : 'Create Role'}
            </Button>
            {editingId && (
              <Button type="button" variant="tertiary" onPress={handleCancel}>
                Cancel
              </Button>
            )}
          </ButtonGroup>
        </Form>
      </section>
      <section className="section stack">
        <Heading level={2}>Available Roles</Heading>
        {loading ? <Text elementType="p">Loading...</Text> : null}
        <table className="bcds-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map(role => (
              <tr key={role.id}>
                <td>{role.id}</td>
                <td>{role.name}</td>
                <td>{role.description || '-'}</td>
                <td>{role.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <ButtonGroup alignment="start" ariaLabel="Role row actions">
                    <Button variant="link" size="small" onPress={() => handleEdit(role)}>
                      Edit
                    </Button>
                    {role.isActive && (
                      <Button variant="link" size="small" danger onPress={() => handleDeactivate(role)}>
                        Deactivate
                      </Button>
                    )}
                  </ButtonGroup>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {error ? <InlineAlert variant="danger" title="Error" description={error} /> : null}
      {message ? <InlineAlert variant="success" title="Success" description={message} /> : null}
    </div>
  );
}
