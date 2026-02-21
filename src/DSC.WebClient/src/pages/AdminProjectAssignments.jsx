import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Form,
  Heading,
  InlineAlert,
  NumberField,
  Select,
  Text,
} from '@bcgov/design-system-react-components';
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '../api/ProjectAssignmentAdminService';
import { AdminCatalogService } from '../api/AdminCatalogService';
import { getAdminUsers } from '../api/AdminUserService';
import SubTabs from '../components/SubTabs';

const ROLE_OPTIONS = [
  { id: 'Contributor', label: 'Contributor' },
  { id: 'Manager', label: 'Manager' },
  { id: 'Director', label: 'Director' },
  { id: 'Admin', label: 'Admin' },
];

export default function AdminProjectAssignments() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState('assignments');

  const [assignments, setAssignments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [filterProjectId, setFilterProjectId] = useState('');
  const [addForm, setAddForm] = useState({ projectId: '', userId: '', role: 'Contributor', estimatedHours: '' });
  const [editingKey, setEditingKey] = useState(null); // "projectId:userId"
  const [editForm, setEditForm] = useState({ role: '', estimatedHours: '' });

  const projectItems = projects.map(p => ({
    id: p.id,
    label: p.projectNo ? `${p.projectNo} — ${p.name}` : p.name,
  }));

  const userItems = users
    .filter(u => u.isActive !== false)
    .map(u => ({
      id: u.id,
      label: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username,
    }));

  const filterItems = [{ id: '', label: 'All Projects' }, ...projectItems];

  const filteredAssignments = filterProjectId
    ? assignments.filter(a => a.projectId === filterProjectId)
    : assignments;

  useEffect(() => {
    const load = async () => {
      try {
        const [allAssignments, projs, usrs] = await Promise.all([
          getAssignments(),
          AdminCatalogService.getProjects(),
          getAdminUsers(),
        ]);
        setAssignments(allAssignments);
        setProjects(projs);
        setUsers(usrs);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  function handleSelectEdit(a) {
    setEditingKey(`${a.projectId}:${a.userId}`);
    setEditForm({ role: a.role || 'Contributor', estimatedHours: a.estimatedHours != null ? String(a.estimatedHours) : '' });
    setSubTab('edit');
  }

  async function handleAdd(e) {
    e.preventDefault();
    setMessage('');
    setError(null);
    try {
      await createAssignment({
        projectId: addForm.projectId,
        userId: addForm.userId,
        role: addForm.role || 'Contributor',
        estimatedHours: addForm.estimatedHours ? Number(addForm.estimatedHours) : null,
      });
      const refreshed = await getAssignments();
      setAssignments(refreshed);
      setAddForm({ projectId: '', userId: '', role: 'Contributor', estimatedHours: '' });
      setMessage('Assignment created.');
      setSubTab('assignments');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleEditSave(e) {
    e.preventDefault();
    setMessage('');
    setError(null);
    if (!editingKey) return;
    const [projectId, userId] = editingKey.split(':');
    try {
      await updateAssignment(projectId, userId, {
        role: editForm.role || undefined,
        estimatedHours: editForm.estimatedHours ? Number(editForm.estimatedHours) : null,
      });
      const refreshed = await getAssignments();
      setAssignments(refreshed);
      setEditingKey(null);
      setMessage('Assignment updated.');
      setSubTab('assignments');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(a) {
    if (!window.confirm(`Remove ${a.userFullName} from ${a.projectName}?`)) return;
    setMessage('');
    setError(null);
    try {
      await deleteAssignment(a.projectId, a.userId);
      const refreshed = await getAssignments();
      setAssignments(refreshed);
      if (editingKey === `${a.projectId}:${a.userId}`) {
        setEditingKey(null);
        setSubTab('assignments');
      }
      setMessage('Assignment removed.');
    } catch (e) {
      setError(e.message);
    }
  }

  const editingAssignment = editingKey
    ? assignments.find(a => `${a.projectId}:${a.userId}` === editingKey)
    : null;

  return (
    <div className="page">
      <SubTabs
        tabs={[
          { id: 'assignments', label: 'Assignments' },
          { id: 'add', label: 'Add Assignment' },
          ...(editingKey ? [{ id: 'edit', label: 'Edit Assignment' }] : []),
        ]}
        activeTab={subTab}
        onTabChange={tab => { if (tab !== 'edit') setEditingKey(null); setSubTab(tab); }}
      />

      {subTab === 'assignments' && (
        <section className="section stack">
          <Heading level={2}>Project Assignments</Heading>
          <div style={{ maxWidth: '400px' }}>
            <Select
              label="Filter by Project"
              items={filterItems}
              selectedKey={filterProjectId || ''}
              onSelectionChange={key => setFilterProjectId(key ? String(key) : '')}
            />
          </div>
          {loading ? <Text elementType="p">Loading…</Text> : null}
          {!loading && filteredAssignments.length === 0 ? (
            <Text elementType="p" className="muted">No assignments found.</Text>
          ) : (
            <table className="bcds-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Est. Hours</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map(a => (
                  <tr key={`${a.projectId}:${a.userId}`}>
                    <td><strong>{a.projectNo}</strong> — {a.projectName}</td>
                    <td>{a.userFullName || a.username}</td>
                    <td>{a.role || '—'}</td>
                    <td>{a.estimatedHours != null ? `${a.estimatedHours} hrs` : '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <ButtonGroup ariaLabel="Assignment actions">
                        <Button size="small" variant="secondary" onPress={() => handleSelectEdit(a)}>Edit</Button>
                        <Button size="small" variant="tertiary" onPress={() => handleDelete(a)}>Remove</Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {subTab === 'add' && (
        <section className="section stack">
          <Heading level={2}>Add Assignment</Heading>
          <Form onSubmit={handleAdd} className="form-grid">
            <Select
              label="Project"
              placeholder="Select project"
              items={projectItems}
              selectedKey={addForm.projectId || null}
              onSelectionChange={key => setAddForm(f => ({ ...f, projectId: key ? String(key) : '' }))}
              isRequired
            />
            <Select
              label="User"
              placeholder="Select user"
              items={userItems}
              selectedKey={addForm.userId || null}
              onSelectionChange={key => setAddForm(f => ({ ...f, userId: key ? String(key) : '' }))}
              isRequired
            />
            <Select
              label="Role"
              items={ROLE_OPTIONS}
              selectedKey={addForm.role}
              onSelectionChange={key => setAddForm(f => ({ ...f, role: String(key) }))}
            />
            <NumberField
              label="Estimated Hours (optional)"
              value={addForm.estimatedHours ? Number(addForm.estimatedHours) : undefined}
              onChange={v => setAddForm(f => ({ ...f, estimatedHours: v == null ? '' : String(v) }))}
              description="Hours allocated to this user on this project"
            />
            <ButtonGroup alignment="start" ariaLabel="Add assignment actions">
              <Button type="submit" variant="primary">Add Assignment</Button>
            </ButtonGroup>
          </Form>
        </section>
      )}

      {subTab === 'edit' && editingAssignment && (
        <section className="section stack">
          <Heading level={2}>Edit Assignment</Heading>
          <Text elementType="p">
            <strong>{editingAssignment.userFullName}</strong> on <strong>{editingAssignment.projectNo} — {editingAssignment.projectName}</strong>
          </Text>
          <Form onSubmit={handleEditSave} className="form-grid">
            <Select
              label="Role"
              items={ROLE_OPTIONS}
              selectedKey={editForm.role}
              onSelectionChange={key => setEditForm(f => ({ ...f, role: String(key) }))}
            />
            <NumberField
              label="Estimated Hours"
              value={editForm.estimatedHours ? Number(editForm.estimatedHours) : undefined}
              onChange={v => setEditForm(f => ({ ...f, estimatedHours: v == null ? '' : String(v) }))}
            />
            <ButtonGroup alignment="start" ariaLabel="Edit assignment actions">
              <Button type="submit" variant="primary">Save Changes</Button>
              <Button type="button" variant="tertiary" onPress={() => handleDelete(editingAssignment)}>Remove Assignment</Button>
            </ButtonGroup>
          </Form>
        </section>
      )}

      {error ? <InlineAlert variant="danger" title="Error" description={error} /> : null}
      {message ? <InlineAlert variant="success" title="Success" description={message} /> : null}
    </div>
  );
}
