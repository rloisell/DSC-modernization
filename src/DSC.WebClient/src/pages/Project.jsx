import React, { useEffect, useState } from 'react';
import { getProjects, createProject } from '../api/ProjectService';

export default function Project() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const proj = await createProject({ name, description: desc });
      setProjects(p => [...p, proj]);
      setName('');
      setDesc('');
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <h1>Projects</h1>
      {loading ? <p>Loading...</p> : null}
      {error ? <p style={{color:'red'}}>Error: {error}</p> : null}
      <ul>
        {projects.map(p => (
          <li key={p.id}><b>{p.name}</b>: {p.description}</li>
        ))}
      </ul>
      <h2>Add Project</h2>
      <form onSubmit={handleCreate}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" required />
        <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" />
        <button type="submit" disabled={creating}>Create</button>
      </form>
    </div>
  );
}
