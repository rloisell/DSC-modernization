import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminProjects() {
  const [message, setMessage] = useState('');
  const projects = [
    { id: 1, projectNo: 'P-1001', name: 'Facility Upgrade', status: 'Active' },
    { id: 2, projectNo: 'P-1002', name: 'Network Refresh', status: 'Active' }
  ];

  function handleSubmit(e) {
    e.preventDefault();
    setMessage('Project admin actions are not wired to the API yet.');
  }

  return (
    <div>
      <h1>Admin Projects</h1>
      <p>Legacy servlet: AdminProjects. This page will manage project metadata and assignments.</p>
      <p><Link to="/admin">Back to Administrator</Link></p>
      <section>
        <h2>Add Project</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Project No (Legacy)
              <input type="text" name="projectNo" />
            </label>
          </div>
          <div>
            <label>
              Name
              <input type="text" name="name" />
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
              Estimated Hours
              <input type="number" name="estimatedHours" step="0.5" />
            </label>
          </div>
          <button type="submit">Create Project</button>
        </form>
      </section>
      <section>
        <h2>Existing Projects</h2>
        <table>
          <thead>
            <tr>
              <th>Project No</th>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id}>
                <td>{project.projectNo}</td>
                <td>{project.name}</td>
                <td>{project.status}</td>
                <td>
                  <button type="button" onClick={() => setMessage('Edit project is not wired to the API yet.')}>Edit</button>
                  <button type="button" onClick={() => setMessage('Archive project is not wired to the API yet.')}>Archive</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2>Assign Activity Codes / Network Numbers</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Project
              <select name="projectId">
                <option value="">Select project</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              Activity Code
              <input type="text" name="activityCode" />
            </label>
            <label>
              Network Number
              <input type="number" name="networkNumber" />
            </label>
          </div>
          <button type="submit">Assign</button>
        </form>
      </section>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
