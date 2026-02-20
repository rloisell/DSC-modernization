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

export default function AdminDepartments() {
  const [message, setMessage] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', manager: '', status: 'active' });
  const [editingId, setEditingId] = useState('');
  const navigate = useNavigate();

  const statusItems = [
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' }
  ];

  useEffect(() => {
    AdminCatalogService.getDepartments()
      .then(setDepartments)
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
        await AdminCatalogService.updateDepartment(editingId, {
          name: form.name,
          managerName: form.manager,
          isActive: form.status === 'active'
        });
      } else {
        await AdminCatalogService.createDepartment({
          name: form.name,
          managerName: form.manager
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
    setForm({
      name: dept.name,
      manager: dept.managerName || '',
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

  return (
    <div className="page">
      <section className="section stack">
        <Heading level={1}>Admin Departments</Heading>
        <Text elementType="p">Legacy servlet: AdminDepartments. This page will manage department records.</Text>
        <div className="page-actions">
          <Button variant="link" onPress={() => navigate('/admin')}>Back to Administrator</Button>
        </div>
      </section>
      <section className="section stack">
        <Heading level={2}>{editingId ? 'Edit Department' : 'Add Department'}</Heading>
        <Form onSubmit={handleSubmit} className="form-grid">
          <TextField
            label="Department Name"
            value={form.name}
            onChange={value => updateForm('name', value)}
            isRequired
          />
          <TextField
            label="Manager"
            value={form.manager}
            onChange={value => updateForm('manager', value)}
            placeholder="Select user"
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
                }}
              >
                Cancel
              </Button>
            ) : null}
          </ButtonGroup>
        </Form>
      </section>
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {loading ? <Text elementType="p">Loading...</Text> : null}
      {error ? <InlineAlert variant="danger" title="Error" description={error} /> : null}
      {message ? <InlineAlert variant="success" title="Success" description={message} /> : null}
    </div>
  );
}
