import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminCatalogService } from '../api/AdminCatalogService';

export default function AdminPositions() {
  const [message, setMessage] = useState('');
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'active' });
  const [editingId, setEditingId] = useState('');

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

  return (
    <div>
      <h1>Admin Positions</h1>
      <p>Legacy servlet: AdminPositions. This page will manage position records.</p>
      <p><Link to="/admin">Back to Administrator</Link></p>
      <section>
        <h2>{editingId ? 'Edit Position' : 'Add Position'}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Title
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={e => updateForm('title', e.target.value)}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Description
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={e => updateForm('description', e.target.value)}
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
          <button type="submit">Create Position</button>
          {editingId ? (
            <button type="button" onClick={() => {
              setEditingId('');
              setForm({ title: '', description: '', status: 'active' });
            }}>Cancel</button>
          ) : null}
        </form>
      </section>
      <section>
        <h2>Existing Positions</h2>
        <table>
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
                  <button type="button" onClick={() => handleEdit(position)}>Edit</button>
                  <button type="button" onClick={() => handleDeactivate(position)}>Deactivate</button>
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
