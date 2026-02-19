import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminDepartments() {
  const [message, setMessage] = useState('');
  const departments = [
    { id: 1, name: 'Operations', manager: 'C. Lopez', status: 'Active' },
    { id: 2, name: 'Engineering', manager: 'A. Patel', status: 'Active' }
  ];

  function handleSubmit(e) {
    e.preventDefault();
    setMessage('Department changes are not wired to the API yet.');
  }

  return (
    <div>
      <h1>Admin Departments</h1>
      <p>Legacy servlet: AdminDepartments. This page will manage department records.</p>
      <p><Link to="/admin">Back to Administrator</Link></p>
      <section>
        <h2>Add Department</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Department Name
              <input type="text" name="name" />
            </label>
          </div>
          <div>
            <label>
              Manager
              <input type="text" name="manager" placeholder="Select user" />
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
                <td>{dept.manager}</td>
                <td>{dept.status}</td>
                <td>
                  <button type="button" onClick={() => setMessage('Edit department is not wired to the API yet.')}>Edit</button>
                  <button type="button" onClick={() => setMessage('Deactivate department is not wired to the API yet.')}>Deactivate</button>
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
