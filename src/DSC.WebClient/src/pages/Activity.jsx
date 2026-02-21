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
  TextArea,
  TextField
} from '@bcgov/design-system-react-components';
import { useAuth } from '../contexts/AuthContext';
import { getWorkItems, createWorkItemWithLegacy, getDetailedWorkItems, updateWorkItem, deleteWorkItem } from '../api/WorkItemService';
import { getProjects } from '../api/ProjectService';
import { getActivityCodes, getNetworkNumbers, getBudgets, getProjectOptions } from '../api/CatalogService';
import { getUserFromStorage } from '../api/AuthConfig';

export default function Activity() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [detailedItems, setDetailedItems] = useState([]);
  const [timePeriod, setTimePeriod] = useState('month');
  const [activityMode, setActivityMode] = useState('project'); // 'project' or 'expense'
  const [projects, setProjects] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [activityCodes, setActivityCodes] = useState([]);
  const [networkNumbers, setNetworkNumbers] = useState([]);
  const [projectOptions, setProjectOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailedLoading, setDetailedLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [projectId, setProjectId] = useState('');
  const [budgetId, setBudgetId] = useState('');
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
  const [selectedProjectData, setSelectedProjectData] = useState(null);
  const [projectSummaries, setProjectSummaries] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const timePeriodItems = [
    { id: 'day', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
    { id: 'all', label: 'All Time' }
  ];

  const projectItems = projects.map(project => ({
    id: project.id,
    label: project.projectNo ? `${project.projectNo} — ${project.name}` : project.name
  }));

  const budgetItems = budgets.map(budget => ({
    id: budget.id,
    label: budget.description
  }));

  function getErrorMessage(err) {
    return err?.response?.data?.error || err?.message || 'Request failed.';
  }

  useEffect(() => {
    let isMounted = true;
    const loadCatalog = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        getWorkItems(user?.Id),
        getProjects(),
        getBudgets(),
        getActivityCodes(),
        getNetworkNumbers()
      ]);

      if (!isMounted) return;

      const [workItems, projects, budgets, codes, numbers] = results;
      const errors = [];

      if (workItems.status === 'fulfilled') {
        setItems(workItems.value);
      } else {
        errors.push(`Work items: ${getErrorMessage(workItems.reason)}`);
      }

      if (projects.status === 'fulfilled') {
        setProjects(projects.value);
      } else {
        errors.push(`Projects: ${getErrorMessage(projects.reason)}`);
      }

      if (budgets.status === 'fulfilled') {
        setBudgets(budgets.value);
      } else {
        errors.push(`Budgets: ${getErrorMessage(budgets.reason)}`);
      }

      if (codes.status === 'fulfilled') {
        setActivityCodes(codes.value);
      } else {
        errors.push(`Activity codes: ${getErrorMessage(codes.reason)}`);
      }

      if (numbers.status === 'fulfilled') {
        setNetworkNumbers(numbers.value);
      } else {
        errors.push(`Network numbers: ${getErrorMessage(numbers.reason)}`);
      }

      setError(errors.length ? errors.join(' | ') : null);
      setLoading(false);
    };

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, [user?.Id]);

  // Load detailed work items when time period changes
  useEffect(() => {
    setDetailedLoading(true);
    getDetailedWorkItems(timePeriod, user?.Id)
      .then(data => setDetailedItems(data))
      .catch(e => console.error('Failed to load detailed work items:', e))
      .finally(() => setDetailedLoading(false));
  }, [timePeriod, user?.Id]);

  // Load project summaries (cumulative remaining hours) for all projects in detailed items
  useEffect(() => {
    if (!detailedItems.length) {
      setProjectSummaries({});
      return;
    }

    // Get all unique project IDs from detailed items
    const uniqueProjectIds = [...new Set(detailedItems.map(item => item.projectId).filter(Boolean))];
    
    if (uniqueProjectIds.length === 0) {
      setProjectSummaries({});
      return;
    }

    // Fetch remaining hours for each project
    const fetchSummaries = async () => {
      const summaries = {};
      
      for (const projectId of uniqueProjectIds) {
        try {
          const _u = getUserFromStorage();
          const response = await fetch(`/api/items/project/${projectId}/remaining-hours`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              ...(_u?.id ? { 'X-User-Id': _u.id } : {})
            }
          });
          if (!response.ok) {
            console.error(`API error loading summary for ${projectId}: ${response.status} ${response.statusText}`);
          } else {
            const data = await response.json();
            summaries[projectId] = data;
          }
        } catch (e) {
          console.error(`Failed to load summary for project ${projectId}:`, e);
        }
      }
      
      setProjectSummaries(summaries);
    };

    fetchSummaries();
  }, [detailedItems]);

  // When activity mode changes, auto-select appropriate budget
  useEffect(() => {
    if (activityMode === 'project') {
      // Auto-select CAPEX budget for project activities
      const capexBudget = budgets.find(b => b.description.toUpperCase().includes('CAPEX'));
      if (capexBudget) {
        setBudgetId(capexBudget.id);
      }
    } else if (activityMode === 'expense') {
      // Auto-select OPEX budget for expense activities
      const opexBudget = budgets.find(b => b.description.toUpperCase().includes('OPEX'));
      if (opexBudget) {
        setBudgetId(opexBudget.id);
      }
    }
  }, [activityMode, budgets]);

  // When project changes, load project-specific options and cumulative remaining hours
  useEffect(() => {
    if (projectId && activityMode === 'project') {
      // Find the selected project to get its estimated hours
      const project = projects.find(p => String(p.id) === projectId);
      setSelectedProjectData(project || null);
      
      // Fetch cumulative remaining hours for this user on this project
      const _authUser = getUserFromStorage();
      fetch(`/api/items/project/${projectId}/remaining-hours`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(_authUser?.id ? { 'X-User-Id': _authUser.id } : {})
        }
      })
        .then(async res => {
          if (!res.ok) {
            console.error(`API error: ${res.status} ${res.statusText}`);
            const errorText = await res.text();
            console.error('Error response:', errorText);
            throw new Error(`API error: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Remaining hours data:', data);
          // Display project's total estimated hours
          if (data.estimatedHours !== null && data.estimatedHours !== undefined) {
            setEstimatedHours(String(data.estimatedHours));
          } else {
            setEstimatedHours('0');
          }
          // Display cumulative remaining hours (can be negative for overbudget)
          if (data.remainingHours !== null && data.remainingHours !== undefined) {
            setRemainingHours(String(data.remainingHours));
          } else {
            setRemainingHours('0');
          }
        })
        .catch(e => {
          console.error('Failed to load remaining hours for project:', projectId, e);
          // Clear on error so field shows nothing (user can still submit)
          setEstimatedHours('');
          setRemainingHours('');
        });

      getProjectOptions(projectId)
        .then(data => {
          setProjectOptions(data);
          // Reset selected activity code and network number if they're not in the project options
          const validCodes = data.activityCodes.map(c => c.code);
          const validNumbers = data.networkNumbers.map(n => String(n.number));
          if (activityCode && !validCodes.includes(activityCode)) {
            setActivityCode('');
          }
          if (networkNumber && !validNumbers.includes(networkNumber)) {
            setNetworkNumber('');
          }
        })
        .catch(e => {
          console.error('Failed to load project options:', e);
          setProjectOptions(null);
          setError(getErrorMessage(e));
        });
    } else {
      setProjectOptions(null);
      setSelectedProjectData(null);
      setActivityCode('');
      setNetworkNumber('');
      if (activityMode === 'expense') {
        setEstimatedHours('');
        setRemainingHours('');
      }
    }
  }, [projectId, activityMode, projects]);

  function handleEditClick(item) {
    setEditingItem(item);
    setEditForm({
      title: item.title || '',
      description: item.description || '',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      startTime: item.startTime ? new Date(item.startTime).toTimeString().slice(0,5) : '',
      endTime: item.endTime ? new Date(item.endTime).toTimeString().slice(0,5) : '',
      plannedDuration: item.plannedDuration ? String(item.plannedDuration) : '',
      actualDuration: item.actualDuration != null ? String(item.actualDuration) : '',
      activityCode: item.activityCode || '',
      networkNumber: item.networkNumber != null ? String(item.networkNumber) : '',
      estimatedHours: item.estimatedHours != null ? String(item.estimatedHours) : '',
    });
    setTimeout(() => document.getElementById('edit-work-item-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  function handleEditCancel() {
    setEditingItem(null);
    setEditForm({});
  }

  async function handleEditSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateWorkItem(editingItem.id, {
        title: editForm.title || undefined,
        description: editForm.description || undefined,
        date: editForm.date || undefined,
        startTime: editForm.startTime || undefined,
        endTime: editForm.endTime || undefined,
        plannedDuration: editForm.plannedDuration ? Number(editForm.plannedDuration) : undefined,
        actualDuration: editForm.actualDuration ? Number(editForm.actualDuration) : undefined,
        activityCode: editForm.activityCode || undefined,
        networkNumber: editForm.networkNumber ? Number(editForm.networkNumber) : undefined,
        estimatedHours: editForm.estimatedHours ? Number(editForm.estimatedHours) : undefined,
      });
      setEditingItem(null);
      setEditForm({});
      setSuccessMsg('Work item updated.');
      const [updated, detailed] = await Promise.all([
        getWorkItems(user?.Id),
        getDetailedWorkItems(timePeriod, user?.Id)
      ]);
      setItems(updated);
      setDetailedItems(detailed);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteItem(item) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    setError(null);
    try {
      await deleteWorkItem(item.id);
      setSuccessMsg('Work item deleted.');
      const [updated, detailed] = await Promise.all([
        getWorkItems(user?.Id),
        getDetailedWorkItems(timePeriod, user?.Id)
      ]);
      setItems(updated);
      setDetailedItems(detailed);
      if (editingItem?.id === item.id) handleEditCancel();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccessMsg('');
    try {
      const payload = {
        title,
        projectId: projectId || undefined,
        budgetId: budgetId || undefined,
        description: desc,
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
      // Refresh detailed items table
      getDetailedWorkItems(timePeriod, user?.Id).then(data => setDetailedItems(data));
      setTitle('');
      setDesc('');
      setProjectId('');
      setBudgetId('');
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
    <div className="page">
      <section className="section stack">
        <Heading level={1}>Activity</Heading>
        <Text elementType="p">Track your work activities and view planned vs actual hours across projects.</Text>
        
        {error ? <InlineAlert variant="danger" title="Error" description={error} /> : null}
      {successMsg ? <InlineAlert variant="success" title="Success" description={successMsg} /> : null}

        {/* Time Period Filter */}
        <div style={{ maxWidth: '300px' }}>
          <Select
            label="Time Period"
            items={timePeriodItems}
            selectedKey={timePeriod || null}
            onSelectionChange={key => setTimePeriod(key ? String(key) : 'month')}
          />
        </div>

        {/* Project Summary - Cumulative Hours by Project */}
        {!detailedLoading && detailedItems.length > 0 && Object.keys(projectSummaries).length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <Heading level={2}>Project Summary</Heading>
            <Text elementType="p" className="muted">Total estimated, actual hours used, and remaining hours for your assigned projects:</Text>
            <table className="bcds-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Est. Hours</th>
                  <th>Actual Hours Used</th>
                  <th>Cumulative Remaining</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(projectSummaries).map(([projectId, summary]) => {
                  const statusColor = summary.remainingHours < 0 ? '#d32f2f' : '#1976d2';
                  const statusLabel = summary.remainingHours < 0 ? '⚠ OVERBUDGET' : 'On Track';
                  
                  return (
                    <tr key={projectId}>
                      <td>
                        <strong>{summary.projectNo}</strong> — {summary.projectName}
                      </td>
                      <td>{summary.estimatedHours ? `${summary.estimatedHours} hrs` : '—'}</td>
                      <td>{summary.actualHoursUsed} hrs</td>
                      <td style={{ color: statusColor, fontWeight: 'bold' }}>
                        {summary.remainingHours !== null ? `${summary.remainingHours} hrs` : '—'}
                        <div style={{ fontSize: '0.85em', fontWeight: 'normal', color: statusColor }}>
                          {statusLabel}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Activity Tracking Table */}
        <Heading level={2}>My Activities</Heading>
        {detailedLoading ? (
          <Text elementType="p">Loading activities...</Text>
        ) : detailedItems.length === 0 ? (
          <Text elementType="p" className="muted">No activities found for the selected time period.</Text>
        ) : (
          <table className="bcds-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Budget</th>
                <th>Title</th>
                <th>Activity Code</th>
                <th>Date</th>
                <th>Actual Hours</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {detailedItems.map(item => (
                <tr key={item.id} style={{ backgroundColor: editingItem?.id === item.id ? '#f0f9ff' : undefined }}>
                  <td><strong>{item.projectNo ? `${item.projectNo} — ${item.projectName}` : (item.projectName || '—')}</strong></td>
                  <td>{item.budgetDescription || '—'}</td>
                  <td>{item.title}</td>
                  <td>{item.activityCode || '—'}</td>
                  <td>{item.date ? new Date(item.date).toLocaleDateString() : '—'}</td>
                  <td>{item.actualDuration != null ? `${item.actualDuration} hrs` : '—'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <ButtonGroup ariaLabel="Activity actions">
                      <Button size="small" variant="secondary" onPress={() => handleEditClick(item)}>Edit</Button>
                      <Button size="small" variant="tertiary" onPress={() => handleDeleteItem(item)}>Delete</Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {editingItem && (
      <section className="section stack" id="edit-work-item-form">
        <Heading level={2}>Edit Work Item</Heading>
        <Text elementType="p">Editing: <strong>{editingItem.title}</strong></Text>
        <Form onSubmit={handleEditSave} className="form-grid">
          <TextField label="Title" value={editForm.title} onChange={v => setEditForm(f => ({...f, title: v}))} isRequired />
          <div className="form-columns">
            <TextField label="Date" type="date" value={editForm.date} onChange={v => setEditForm(f => ({...f, date: v}))} />
            <TextField label="Start Time" type="time" value={editForm.startTime} onChange={v => setEditForm(f => ({...f, startTime: v}))} />
            <TextField label="End Time" type="time" value={editForm.endTime} onChange={v => setEditForm(f => ({...f, endTime: v}))} />
          </div>
          <div className="form-columns">
            <NumberField label="Planned Duration (hours)" value={editForm.plannedDuration ? Number(editForm.plannedDuration) : undefined} onChange={v => setEditForm(f => ({...f, plannedDuration: v == null ? '' : String(v)}))} />
            <NumberField label="Actual Duration (hours)" value={editForm.actualDuration ? Number(editForm.actualDuration) : undefined} onChange={v => setEditForm(f => ({...f, actualDuration: v == null ? '' : String(v)}))} />
          </div>
          <TextArea label="Description" value={editForm.description} onChange={v => setEditForm(f => ({...f, description: v}))} />
          <ButtonGroup alignment="start" ariaLabel="Edit work item actions">
            <Button type="submit" variant="primary" isDisabled={saving}>Save Changes</Button>
            <Button type="button" variant="tertiary" onPress={handleEditCancel}>Cancel</Button>
            <Button type="button" variant="tertiary" onPress={() => handleDeleteItem(editingItem)}>Delete This Item</Button>
          </ButtonGroup>
        </Form>
      </section>
      )}

      <section className="section stack">
        <Heading level={2}>Add Work Item</Heading>
        <Form onSubmit={handleCreate} className="form-grid">
          <TextField label="Title" value={title} onChange={setTitle} isRequired />
          
          {/* Activity Mode Selection - First Item */}
          <div style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>
            <fieldset style={{ border: 'none', padding: 0 }}>
              <legend style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>Activity Type</legend>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="activityType"
                    value="project"
                    checked={activityMode === 'project'}
                    onChange={(e) => setActivityMode(e.target.value)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Project Activity
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="activityType"
                    value="expense"
                    checked={activityMode === 'expense'}
                    onChange={(e) => setActivityMode(e.target.value)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Expense Activity
                </label>
              </div>
            </fieldset>
          </div>
          
          {/* Project Selection - Only for Project Activities */}
          {activityMode === 'project' && (
          <Select
            label="Project"
            placeholder="Select project"
            items={projectItems}
            selectedKey={projectId || null}
            onSelectionChange={key => setProjectId(key ? String(key) : '')}
            isRequired
            description="Select the project this activity is associated with"
          />
          )}
          
          {/* Budget - Auto-selected based on activity type */}
          <Select
            label="Budget"
            placeholder="Auto-selected"
            items={budgetItems}
            selectedKey={budgetId || null}
            onSelectionChange={key => setBudgetId(key ? String(key) : '')}
            isRequired
            description={activityMode === 'project' ? 'CAPEX (auto-selected for project activities)' : 'OPEX (auto-selected for expense activities)'}
            isDisabled
          />
          
          <div className="form-columns">
            <TextField label="Date" type="date" value={date} onChange={setDate} />
            <TextField label="Start Time" type="time" value={startTime} onChange={setStartTime} />
            <TextField label="End Time" type="time" value={endTime} onChange={setEndTime} />
          </div>
          <div className="form-columns">
            <NumberField
              label="Planned Duration (hours)"
              value={plannedDuration ? Number(plannedDuration) : undefined}
              onChange={value => setPlannedDuration(value == null ? '' : String(value))}
            />
            <NumberField
              label="Actual Duration (hours)"
              value={actualDuration ? Number(actualDuration) : undefined}
              onChange={value => setActualDuration(value == null ? '' : String(value))}
            />
          </div>
          
          {/* Project Activity Mode: Activity Code / Network Number pair selection table */}
          {activityMode === 'project' && (
          <div style={{ gridColumn: '1 / -1' }}>
            {!projectId ? (
              <Text elementType="p" style={{ color: '#595959', fontStyle: 'italic' }}>
                Select a project above to see available activity code / network number pairs.
              </Text>
            ) : !projectOptions ? (
              <Text elementType="p" style={{ color: '#595959' }}>Loading options for selected project…</Text>
            ) : projectOptions.validPairs && projectOptions.validPairs.length > 0 ? (
              <fieldset style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '1rem' }}>
                <legend style={{ fontWeight: '700', padding: '0 0.5rem' }}>
                  Select Activity Code / Network Number Pair <span style={{ color: '#d32f2f' }}>*</span>
                </legend>
                <Text elementType="p" style={{ marginTop: 0, marginBottom: '0.75rem', color: '#595959', fontSize: '0.9rem' }}>
                  Choose the appropriate combination for this work item.
                </Text>
                <table className="bcds-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '2.5rem' }}></th>
                      <th>Activity Code</th>
                      <th>Network Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectOptions.validPairs.map(pair => {
                      const code = projectOptions.activityCodes.find(c => c.code === pair.activityCode);
                      const number = projectOptions.networkNumbers.find(n => n.number === pair.networkNumber);
                      const pairKey = `${pair.activityCode}-${pair.networkNumber}`;
                      const isSelected = activityCode === pair.activityCode && networkNumber === String(pair.networkNumber);
                      return (
                        <tr
                          key={pairKey}
                          onClick={() => { setActivityCode(pair.activityCode); setNetworkNumber(String(pair.networkNumber)); }}
                          style={{ cursor: 'pointer', background: isSelected ? '#e3f0fc' : undefined }}
                        >
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="radio"
                              name="activityPair"
                              value={pairKey}
                              checked={isSelected}
                              onChange={() => { setActivityCode(pair.activityCode); setNetworkNumber(String(pair.networkNumber)); }}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                          <td>
                            <strong>{code?.code ?? pair.activityCode}</strong>
                            {code?.description ? <> — {code.description}</> : null}
                          </td>
                          <td>
                            <strong>{number?.number ?? pair.networkNumber}</strong>
                            {number?.description ? <> — {number.description}</> : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {activityCode && networkNumber && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#595959' }}>
                    Selected: <strong>{activityCode}</strong> / Network <strong>{networkNumber}</strong>
                    &nbsp;<button
                      type="button"
                      onClick={() => { setActivityCode(''); setNetworkNumber(''); }}
                      style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
                    >Clear</button>
                  </div>
                )}
              </fieldset>
            ) : (
              <Text elementType="p" style={{ color: '#d32f2f' }}>
                No activity code / network number pairs are configured for this project. Contact your administrator.
              </Text>
            )}
          </div>
          )}
          
          <div className="form-columns">
            {activityMode === 'project' && (
              <>
                <NumberField
                  label="Project Estimated Hours"
                  value={estimatedHours && estimatedHours !== '' ? Number(estimatedHours) : undefined}
                  isDisabled
                  description="Total hours available for this project (from database)"
                />
                <NumberField
                  label="Current Cumulative Remaining"
                  value={remainingHours && remainingHours !== '' ? Number(remainingHours) : undefined}
                  isDisabled
                  description="Remaining before this entry (can be negative)"
                />
                <NumberField
                  label="Projected Remaining After Entry"
                  value={
                    remainingHours && remainingHours !== '' && actualDuration
                      ? Number(remainingHours) - Number(actualDuration)
                      : (remainingHours && remainingHours !== '' ? Number(remainingHours) : undefined)
                  }
                  isDisabled
                  description="Remaining hours after you submit this entry"
                />
              </>
            )}
            {/* Expense activities: No remaining hours field (expense activities are tracked by budget, not hours) */}
          </div>
          <TextArea label="Description" value={desc} onChange={setDesc} />
          <ButtonGroup alignment="start" ariaLabel="Work item actions">
            <Button type="submit" variant="primary" isDisabled={creating}>Create</Button>
          </ButtonGroup>
        </Form>
      </section>
    </div>
  );
}
