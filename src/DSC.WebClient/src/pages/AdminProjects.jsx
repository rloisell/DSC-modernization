import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminCatalogService } from '../api/AdminCatalogService';

export default function AdminProjects() {
  const [message, setMessage] = useState('');
  const [projects, setProjects] = useState([]);
  const [activityCodes, setActivityCodes] = useState([]);
  const [networkNumbers, setNetworkNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ projectNo: '', name: '', description: '', estimatedHours: '' });
  const [assignForm, setAssignForm] = useState({ projectId: '', activityCodeId: '', networkNumberId: '' });

  useEffect(() => {
    Promise.all([
      AdminCatalogService.getProjects(),
      AdminCatalogService.getActivityCodes(),
      AdminCatalogService.getNetworkNumbers()
    ])
      .then(([projectData, codeData, networkData]) => {
        setProjects(projectData);
        setActivityCodes(codeData);
        setNetworkNumbers(networkData);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function updateForm(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function updateAssignForm(field, value) {
    setAssignForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.createProject({
        projectNo: form.projectNo || null,
        name: form.name,
        description: form.description || null,
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : null
      });
      const refreshed = await AdminCatalogService.getProjects();
      setProjects(refreshed);
      setForm({ projectNo: '', name: '', description: '', estimatedHours: '' });
      setMessage('Project created.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleArchive(project) {
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.updateProject(project.id, {
        projectNo: project.projectNo,
        name: project.name,
        description: project.description,
        estimatedHours: project.estimatedHours,
        isActive: false
      });
      const refreshed = await AdminCatalogService.getProjects();
      setProjects(refreshed);
      setMessage('Project archived.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleAssign(e) {
    e.preventDefault();
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.createProjectActivityOption({
        projectId: assignForm.projectId,
        activityCodeId: assignForm.activityCodeId,
        networkNumberId: assignForm.networkNumberId
      });
      setAssignForm({ projectId: '', activityCodeId: '', networkNumberId: '' });
      setMessage('Assignment created.');
    } catch (e) {
      setError(e.message);
    }
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
              <input
                type="text"
                name="projectNo"
                value={form.projectNo}
                onChange={e => updateForm('projectNo', e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Name
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
              Estimated Hours
              <input
                type="number"
                name="estimatedHours"
                step="0.5"
                value={form.estimatedHours}
                onChange={e => updateForm('estimatedHours', e.target.value)}
              />
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
                <td>{project.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <button type="button" onClick={() => setMessage('Edit project is not wired to the API yet.')}>Edit</button>
                  <button type="button" onClick={() => handleArchive(project)}>Archive</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2>Assign Activity Codes / Network Numbers</h2>
        <form onSubmit={handleAssign}>
          <div>
            <label>
              Project
              <select
                name="projectId"
                value={assignForm.projectId}
                onChange={e => updateAssignForm('projectId', e.target.value)}
                required
              >
                <option value="">Select project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.projectNo ? `${project.projectNo} — ${project.name}` : project.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label>
              Activity Code
              <select
                name="activityCodeId"
                value={assignForm.activityCodeId}
                onChange={e => updateAssignForm('activityCodeId', e.target.value)}
                required
              >
                <option value="">Select activity code</option>
                {activityCodes.map(code => (
                  <option key={code.id} value={code.id}>
                    {code.code} - {code.description}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Network Number
              <select
                name="networkNumberId"
                value={assignForm.networkNumberId}
                onChange={e => updateAssignForm('networkNumberId', e.target.value)}
                required
              >
                <option value="">Select network number</option>
                {networkNumbers.map(network => (
                  <option key={network.id} value={network.id}>
                    {network.number} {network.description ? `- ${network.description}` : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button type="submit">Assign</button>
        </form>
      </section>
      {loading ? <p>Loading...</p> : null}
      {error ? <p style={{color:'red'}}>Error: {error}</p> : null}
      {message ? <p>{message}</p> : null}
    </div>
  );
}
