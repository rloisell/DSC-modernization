/**
 * AdminReferenceData.jsx
 * Single page that provides CRUD access for all catalog reference data types.
 * Uses a config-driven approach so each type shares the same list/add/edit pattern.
 */
import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Form,
  Heading,
  InlineAlert,
  Select,
  Text,
  TextField,
} from '@bcgov/design-system-react-components';
import { AdminCatalogService } from '../api/AdminCatalogService';

// ─── Reference Data Type Configurations ──────────────────────────────────────

const TYPES = [
  {
    id: 'activity-codes',
    label: 'Activity Codes',
    idField: 'id',
    hasIsActive: true,
    fields: [
      { key: 'code', label: 'Code', required: true },
      { key: 'description', label: 'Description' },
    ],
    service: {
      getAll: () => AdminCatalogService.getActivityCodes(),
      create: p => AdminCatalogService.createActivityCode(p),
      update: (id, p) => AdminCatalogService.updateActivityCode(id, p),
      delete: id => AdminCatalogService.deleteActivityCode(id),
    },
  },
  {
    id: 'network-numbers',
    label: 'Network Numbers',
    idField: 'id',
    hasIsActive: true,
    fields: [
      { key: 'number', label: 'Number', type: 'number', required: true },
      { key: 'description', label: 'Description' },
    ],
    service: {
      getAll: () => AdminCatalogService.getNetworkNumbers(),
      create: p => AdminCatalogService.createNetworkNumber(p),
      update: (id, p) => AdminCatalogService.updateNetworkNumber(id, p),
      delete: id => AdminCatalogService.deleteNetworkNumber(id),
    },
  },
  {
    id: 'budgets',
    label: 'Budgets',
    idField: 'id',
    hasIsActive: true,
    fields: [
      { key: 'description', label: 'Description', required: true },
    ],
    service: {
      getAll: () => AdminCatalogService.getBudgets(),
      create: p => AdminCatalogService.createBudget(p),
      update: (id, p) => AdminCatalogService.updateBudget(id, p),
      delete: id => AdminCatalogService.deleteBudget(id),
    },
  },
  {
    id: 'director-codes',
    label: 'Director Codes',
    idField: 'code',
    hasIsActive: false,
    fields: [
      { key: 'code', label: 'Code', required: true, readOnlyOnEdit: true },
      { key: 'description', label: 'Description' },
    ],
    service: {
      getAll: () => AdminCatalogService.getDirectorCodes(),
      create: p => AdminCatalogService.createDirectorCode(p),
      update: (code, p) => AdminCatalogService.updateDirectorCode(code, p),
    },
  },
  {
    id: 'cpc-codes',
    label: 'CPC Codes',
    idField: 'code',
    hasIsActive: false,
    fields: [
      { key: 'code', label: 'Code', required: true, readOnlyOnEdit: true },
      { key: 'description', label: 'Description' },
    ],
    service: {
      getAll: () => AdminCatalogService.getCpcCodes(),
      create: p => AdminCatalogService.createCpcCode(p),
      update: (code, p) => AdminCatalogService.updateCpcCode(code, p),
    },
  },
  {
    id: 'reason-codes',
    label: 'Reason Codes',
    idField: 'code',
    hasIsActive: false,
    fields: [
      { key: 'code', label: 'Code', required: true, readOnlyOnEdit: true },
      { key: 'description', label: 'Description' },
    ],
    service: {
      getAll: () => AdminCatalogService.getReasonCodes(),
      create: p => AdminCatalogService.createReasonCode(p),
      update: (code, p) => AdminCatalogService.updateReasonCode(code, p),
    },
  },
  {
    id: 'unions',
    label: 'Unions',
    idField: 'id',
    hasIsActive: false,
    fields: [
      { key: 'id', label: 'ID (numeric)', type: 'number', required: true, readOnlyOnEdit: true },
      { key: 'name', label: 'Name', required: true },
    ],
    service: {
      getAll: () => AdminCatalogService.getUnions(),
      create: p => AdminCatalogService.createUnion(p),
      update: (id, p) => AdminCatalogService.updateUnion(id, p),
    },
  },
  {
    id: 'activity-categories',
    label: 'Activity Categories',
    idField: 'id',
    hasIsActive: false,
    fields: [
      { key: 'name', label: 'Name', required: true },
    ],
    service: {
      getAll: () => AdminCatalogService.getActivityCategories(),
      create: p => AdminCatalogService.createActivityCategory(p),
      update: (id, p) => AdminCatalogService.updateActivityCategory(id, p),
    },
  },
  {
    id: 'calendar-categories',
    label: 'Calendar Categories',
    idField: 'id',
    hasIsActive: false,
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'description', label: 'Description' },
    ],
    service: {
      getAll: () => AdminCatalogService.getCalendarCategories(),
      create: p => AdminCatalogService.createCalendarCategory(p),
      update: (id, p) => AdminCatalogService.updateCalendarCategory(id, p),
    },
  },
];

const TYPE_ITEMS = TYPES.map(t => ({ id: t.id, label: t.label }));

const STATUS_ITEMS = [
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
];

function emptyForm(config) {
  const f = {};
  config.fields.forEach(field => { f[field.key] = ''; });
  if (config.hasIsActive) f['_status'] = 'active';
  return f;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminReferenceData() {
  const [typeId, setTypeId] = useState(TYPES[0].id);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({});
  const [editingKey, setEditingKey] = useState(null); // null = adding
  const [view, setView] = useState('list'); // 'list' | 'form'

  const config = TYPES.find(t => t.id === typeId);

  // Reload when type changes
  useEffect(() => {
    setEditingKey(null);
    setForm(emptyForm(config));
    setView('list');
    setError(null);
    setMessage('');
    setLoading(true);
    config.service.getAll()
      .then(setItems)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [typeId]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateForm(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function startAdd() {
    setEditingKey(null);
    setForm(emptyForm(config));
    setView('form');
    setMessage('');
    setError(null);
  }

  function startEdit(item) {
    const f = {};
    config.fields.forEach(field => { f[field.key] = item[field.key] != null ? String(item[field.key]) : ''; });
    if (config.hasIsActive) f['_status'] = item.isActive ? 'active' : 'inactive';
    setForm(f);
    setEditingKey(item[config.idField]);
    setView('form');
    setMessage('');
    setError(null);
  }

  function cancelForm() {
    setEditingKey(null);
    setForm(emptyForm(config));
    setView('list');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError(null);
    try {
      const payload = {};
      config.fields.forEach(field => {
        if (field.readOnlyOnEdit && editingKey != null) return; // skip PK on updates
        payload[field.key] = field.type === 'number'
          ? (form[field.key] !== '' ? Number(form[field.key]) : undefined)
          : form[field.key] || undefined;
      });
      if (config.hasIsActive) payload.isActive = form['_status'] === 'active';

      if (editingKey != null) {
        await config.service.update(editingKey, payload);
        setMessage(`${config.label.replace(/s$/, '')} updated.`);
      } else {
        // include PK fields when creating
        config.fields.filter(f => f.readOnlyOnEdit).forEach(field => {
          payload[field.key] = field.type === 'number'
            ? (form[field.key] !== '' ? Number(form[field.key]) : undefined)
            : form[field.key] || undefined;
        });
        await config.service.create(payload);
        setMessage(`${config.label.replace(/s$/, '')} created.`);
      }

      const refreshed = await config.service.getAll();
      setItems(refreshed);
      setEditingKey(null);
      setForm(emptyForm(config));
      setView('list');
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  }

  async function handleDelete(item) {
    const displayValue = item[config.fields[0].key];
    if (!window.confirm(`Delete "${displayValue}"? This cannot be undone.`)) return;
    setMessage('');
    setError(null);
    try {
      await config.service.delete(item[config.idField]);
      const refreshed = await config.service.getAll();
      setItems(refreshed);
      setMessage(`${config.label.replace(/s$/, '')} deleted.`);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  }

  // Determine columns to show: all fields + optional status + actions
  const tableFields = config.fields;

  return (
    <div className="page">
      <section className="section stack">
        <Heading level={2}>Reference Data</Heading>
        <Text elementType="p">Manage catalog reference values used across the system.</Text>

        {/* Type Selector */}
        <div style={{ maxWidth: '260px' }}>
          <Select
            label="Data Type"
            items={TYPE_ITEMS}
            selectedKey={typeId}
            onSelectionChange={key => setTypeId(String(key))}
          />
        </div>

        {/* Action bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Heading level={3}>{config.label}</Heading>
          {view === 'list' && (
            <Button variant="primary" size="small" onPress={startAdd}>
              + Add {config.label.replace(/s$/, '')}
            </Button>
          )}
        </div>

        {/* Feedback */}
        {error ? <InlineAlert variant="danger" title="Error" description={error} /> : null}
        {message ? <InlineAlert variant="success" title="Success" description={message} /> : null}

        {/* Add / Edit Form */}
        {view === 'form' && (
          <Form onSubmit={handleSubmit} className="form-grid">
            <Heading level={4}>{editingKey != null ? `Edit ${config.label.replace(/s$/, '')}` : `Add ${config.label.replace(/s$/, '')}`}</Heading>
            {config.fields.map(field => (
              <TextField
                key={field.key}
                label={field.label}
                value={form[field.key] ?? ''}
                onChange={v => updateForm(field.key, v)}
                isRequired={field.required}
                isDisabled={field.readOnlyOnEdit && editingKey != null}
                description={field.readOnlyOnEdit && editingKey != null ? 'Cannot be changed after creation' : undefined}
              />
            ))}
            {config.hasIsActive && (
              <Select
                label="Status"
                items={STATUS_ITEMS}
                selectedKey={form['_status'] ?? 'active'}
                onSelectionChange={key => updateForm('_status', String(key))}
              />
            )}
            <ButtonGroup alignment="start" ariaLabel="Form actions">
              <Button type="submit" variant="primary">
                {editingKey != null ? 'Save Changes' : 'Add'}
              </Button>
              <Button type="button" variant="tertiary" onPress={cancelForm}>Cancel</Button>
            </ButtonGroup>
          </Form>
        )}

        {/* List Table */}
        {view === 'list' && (
          <>
            {loading ? <Text elementType="p">Loading…</Text> : null}
            {!loading && items.length === 0 ? (
              <Text elementType="p" className="muted">No {config.label.toLowerCase()} found.</Text>
            ) : (
              <table className="bcds-table">
                <thead>
                  <tr>
                    {tableFields.map(f => <th key={f.key}>{f.label}</th>)}
                    {config.hasIsActive && <th>Status</th>}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item[config.idField] ?? idx}>
                      {tableFields.map(f => (
                        <td key={f.key}>{item[f.key] != null ? String(item[f.key]) : '—'}</td>
                      ))}
                      {config.hasIsActive && (
                        <td>
                          <span style={{ color: item.isActive ? '#1a7f37' : '#b91c1c', fontWeight: 500, fontSize: '0.85em' }}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      )}
                      <td>
                        <ButtonGroup ariaLabel="Row actions">
                          <Button size="small" variant="secondary" onPress={() => startEdit(item)}>Edit</Button>
                          {config.service.delete && (
                            <Button size="small" variant="tertiary" onPress={() => handleDelete(item)}>Delete</Button>
                          )}
                        </ButtonGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </section>
    </div>
  );
}
