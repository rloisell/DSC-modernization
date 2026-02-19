import React, { useEffect, useState } from 'react';
import { getWorkItems, createWorkItemWithLegacy } from '../api/WorkItemService';
import { getProjects } from '../api/ProjectService';

export default function Activity() {
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [projectId, setProjectId] = useState('');
  const [legacyActivityId, setLegacyActivityId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [plannedDuration, setPlannedDuration] = useState('');
  const [actualDuration, setActualDuration] = useState('');
  const [activityCode, setActivityCode] = useState('');
  const [networkNumber, setNetworkNumber] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [remainingHours, setRemainingHours] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([getWorkItems(), getProjects()])
      .then(([workItems, projects]) => {
        setItems(workItems);
        setProjects(projects);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const payload = {
        title,
        projectId: projectId || undefined,
        description: desc,
        legacyActivityId: legacyActivityId || undefined,
        date: date || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        plannedDuration: plannedDuration ? Number(plannedDuration) : undefined,
        actualDuration: actualDuration ? Number(actualDuration) : undefined,
        activityCode: activityCode || undefined,
        networkNumber: networkNumber ? Number(networkNumber) : undefined,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        remainingHours: remainingHours ? Number(remainingHours) : undefined
      };

      const item = await createWorkItemWithLegacy(payload);
      setItems(i => [...i, item]);
      setTitle('');
      setDesc('');
      setProjectId('');
      setLegacyActivityId('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setPlannedDuration('');
      setActualDuration('');
      setActivityCode('');
      setNetworkNumber('');
      setEstimatedHours('');
      setRemainingHours('');
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
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" required />
        <select value={projectId} onChange={e=>setProjectId(e.target.value)} required>
          <option value="">Select project</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.projectNo ? `${p.projectNo} — ${p.name}` : p.name}</option>
          ))}
        </select>
        <input value={legacyActivityId} onChange={e=>setLegacyActivityId(e.target.value)} placeholder="Legacy Activity ID" />
        <input value={date} onChange={e=>setDate(e.target.value)} placeholder="Date (YYYY-MM-DD)" />
        <input value={startTime} onChange={e=>setStartTime(e.target.value)} placeholder="Start Time (HH:mm)" />
        <input value={endTime} onChange={e=>setEndTime(e.target.value)} placeholder="End Time (HH:mm)" />
        <input value={plannedDuration} onChange={e=>setPlannedDuration(e.target.value)} placeholder="Planned Duration (hours)" />
        <input value={actualDuration} onChange={e=>setActualDuration(e.target.value)} placeholder="Actual Duration (hours)" />
        <input value={activityCode} onChange={e=>setActivityCode(e.target.value)} placeholder="Activity Code" />
        <input value={networkNumber} onChange={e=>setNetworkNumber(e.target.value)} placeholder="Network Number" />
        <input value={estimatedHours} onChange={e=>setEstimatedHours(e.target.value)} placeholder="Estimated Hours" />
        <input value={remainingHours} onChange={e=>setRemainingHours(e.target.value)} placeholder="Remaining Hours" />
        <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" />
        <button type="submit" disabled={creating}>Create</button>
      </form>
    </div>
  );
}
