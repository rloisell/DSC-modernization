import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminCatalogService } from '../api/AdminCatalogService';

export default function AdminDepartments() {
  const [message, setMessage] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', manager: '', status: 'active' });
  const [editingId, setEditingId] = useState('');

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
    <div>
      <h1>Admin Departments</h1>
      <p>Legacy servlet: AdminDepartments. This page will manage department records.</p>
      <p><Link to="/admin">Back to Administrator</Link></p>
      <section>
        <h2>{editingId ? 'Edit Department' : 'Add Department'}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Department Name
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={e => updateForm('name', e.target.value)}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Manager
              <input
                type="text"
                name="manager"
                placeholder="Select user"
                value={form.manager}
                onChange={e => updateForm('manager', e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Status
              <select name="status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>
          <button type="submit">Create Department</button>
          {editingId ? (
            <button type="button" onClick={() => {
              setEditingId('');
              setForm({ name: '', manager: '', status: 'active' });
            }}>Cancel</button>
          ) : null}
        </form>
      </section>
      <section>
        <h2>Existing Departments</h2>
        <table>
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
                  <button type="button" onClick={() => handleEdit(dept)}>Edit</button>
                  <button type="button" onClick={() => handleDeactivate(dept)}>Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {loading ? <p>Loading...</p> : null}
      {error ? <p style={{color:'red'}}>Error: {error}</p> : null}
      {message ? <p>{message}</p> : null}
    </div>
  );
}
