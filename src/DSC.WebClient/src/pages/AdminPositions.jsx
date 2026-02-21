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
import SubTabs from '../components/SubTabs';

export default function AdminPositions() {
  const [message, setMessage] = useState('');
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'active' });
  const [editingId, setEditingId] = useState('');
  const [subTab, setSubTab] = useState('list');
  const navigate = useNavigate();

  const statusItems = [
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' }
  ];

  useEffect(() => {
    AdminCatalogService.getPositions()
      .then(setPositions)
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
        await AdminCatalogService.updatePosition(editingId, {
          title: form.title,
          description: form.description,
          isActive: form.status === 'active'
        });
      } else {
        await AdminCatalogService.createPosition({
          title: form.title,
          description: form.description
        });
      }
      const refreshed = await AdminCatalogService.getPositions();
      setPositions(refreshed);
      setForm({ title: '', description: '', status: 'active' });
      setEditingId('');
      setMessage(editingId ? 'Position updated.' : 'Position created.');
    } catch (e) {
      setError(e.message);
    }
  }

  function handleEdit(position) {
    setEditingId(position.id);
    setSubTab('form');
    setForm({
      title: position.title,
      description: position.description || '',
      status: position.isActive ? 'active' : 'inactive'
    });
  }

  async function handleDeactivate(position) {
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.updatePosition(position.id, {
        title: position.title,
        description: position.description,
        isActive: false
      });
      const refreshed = await AdminCatalogService.getPositions();
      setPositions(refreshed);
      setMessage('Position deactivated.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(position) {
    if (!window.confirm(`Delete position "${position.title}"? This cannot be undone.`)) {
      return;
    }
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.deletePosition(position.id);
      const refreshed = await AdminCatalogService.getPositions();
      setPositions(refreshed);
      setMessage('Position deleted.');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="page">
      <section className="section stack">
        <Heading level={1}>Admin Positions</Heading>
        <Text elementType="p">Legacy servlet: AdminPositions. This page will manage position records.</Text>

      </section>
      <SubTabs
        tabs={[
          { id: 'list', label: 'Positions' },
          { id: 'form', label: 'Add / Edit' },
        ]}
        activeTab={subTab}
        onTabChange={setSubTab}
      />
      {subTab === 'form' && (
      <section className="section stack">
        <Heading level={2}>{editingId ? 'Edit Position' : 'Add Position'}</Heading>
        <Form onSubmit={handleSubmit} className="form-grid">
          <TextField
            label="Title"
            value={form.title}
            onChange={value => updateForm('title', value)}
            isRequired
          />
          <TextField
            label="Description"
            value={form.description}
            onChange={value => updateForm('description', value)}
          />
          <Select
            label="Status"
            items={statusItems}
            selectedKey={form.status}
            onSelectionChange={key => updateForm('status', String(key))}
          />
          <ButtonGroup alignment="start" ariaLabel="Position actions">
            <Button type="submit" variant="primary">
              {editingId ? 'Save Position' : 'Create Position'}
            </Button>
            {editingId ? (
              <Button
                type="button"
                variant="tertiary"
                onPress={() => {
                  setEditingId('');
                  setForm({ title: '', description: '', status: 'active' });
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
        <Heading level={2}>Existing Positions</Heading>
        <table className="bcds-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map(position => (
              <tr key={position.id}>
                <td>{position.title}</td>
                <td>{position.description}</td>
                <td>{position.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <div className="actions">
                    <Button size="small" variant="tertiary" onPress={() => handleEdit(position)}>Edit</Button>
                    <Button size="small" variant="tertiary" danger onPress={() => handleDeactivate(position)}>
                      Deactivate
                    </Button>
                    <Button size="small" variant="secondary" danger onPress={() => handleDelete(position)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>      )}      {loading ? <Text elementType="p">Loading...</Text> : null}
      {error ? <InlineAlert variant="danger" title="Error" description={error} /> : null}
      {message ? <InlineAlert variant="success" title="Success" description={message} /> : null}
    </div>
  );
}
