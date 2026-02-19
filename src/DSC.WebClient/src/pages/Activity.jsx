import React, { useEffect, useState } from 'react';
import { getWorkItems, createWorkItem } from '../api/WorkItemService';

export default function Activity() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [desc, setDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getWorkItems()
      .then(setItems)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const item = await createWorkItem({ description: desc });
      setItems(i => [...i, item]);
      setDesc('');
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <h1>Activity</h1>
      {loading ? <p>Loading...</p> : null}
      {error ? <p style={{color:'red'}}>Error: {error}</p> : null}
      <ul>
        {items.map(i => (
          <li key={i.id}>
            {i.title ? <strong>{i.title}</strong> : null}
            {i.legacyActivityId ? <span> (Legacy ID: {i.legacyActivityId})</span> : null}
            <div>{i.description}</div>
            <div style={{fontSize:'0.9em',color:'#666'}}>
              {i.date ? <span>Date: {i.date} </span> : null}
              {i.startTime ? <span>Start: {i.startTime} </span> : null}
              {i.endTime ? <span>End: {i.endTime} </span> : null}
              {i.plannedDuration ? <span>Planned: {i.plannedDuration}h </span> : null}
              {i.actualDuration ? <span>Actual: {i.actualDuration}h </span> : null}
              {i.activityCode ? <span>Code: {i.activityCode} </span> : null}
              {i.networkNumber ? <span>Network: {i.networkNumber}</span> : null}
            </div>
          </li>
        ))}
      </ul>
      <h2>Add Work Item</h2>
      <form onSubmit={handleCreate}>
        <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" required />
        <button type="submit" disabled={creating}>Create</button>
      </form>
    </div>
  );
}
