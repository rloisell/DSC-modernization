import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminPositions() {
  const [message, setMessage] = useState('');
  const positions = [
    { id: 1, title: 'Supervisor', description: 'Field supervisor', status: 'Active' },
    { id: 2, title: 'Technician', description: 'Maintenance technician', status: 'Active' }
  ];

  function handleSubmit(e) {
    e.preventDefault();
    setMessage('Position changes are not wired to the API yet.');
  }

  return (
    <div>
      <h1>Admin Positions</h1>
      <p>Legacy servlet: AdminPositions. This page will manage position records.</p>
      <p><Link to="/admin">Back to Administrator</Link></p>
      <section>
        <h2>Add Position</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Title
              <input type="text" name="title" />
            </label>
          </div>
          <div>
            <label>
              Description
              <input type="text" name="description" />
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
                <td>{position.status}</td>
                <td>
                  <button type="button" onClick={() => setMessage('Edit position is not wired to the API yet.')}>Edit</button>
                  <button type="button" onClick={() => setMessage('Deactivate position is not wired to the API yet.')}>Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
