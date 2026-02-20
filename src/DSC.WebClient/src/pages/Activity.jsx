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
import { getWorkItems, createWorkItemWithLegacy, getDetailedWorkItems } from '../api/WorkItemService';
import { getProjects } from '../api/ProjectService';
import { getActivityCodes, getNetworkNumbers, getBudgets, getProjectOptions } from '../api/CatalogService';

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

  // Use project-specific options if a project is selected, otherwise use all codes/numbers
  const availableActivityCodes = projectOptions?.activityCodes || activityCodes;
  const availableNetworkNumbers = projectOptions?.networkNumbers || networkNumbers;

  const activityCodeItems = availableActivityCodes.map(code => ({
    id: code.code,
    label: code.description ? `${code.code} — ${code.description}` : code.code
  }));

  const networkNumberItems = availableNetworkNumbers.map(nn => ({
    id: String(nn.number),
    label: nn.description ? `${nn.number} — ${nn.description}` : String(nn.number)
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

  // When project changes, load project-specific options
  useEffect(() => {
    if (projectId) {
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
      setActivityCode('');
      setNetworkNumber('');
    }
  }, [projectId]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError(null);
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

        {/* Time Period Filter */}
        <div style={{ maxWidth: '300px' }}>
          <Select
            label="Time Period"
            items={timePeriodItems}
            selectedKey={timePeriod || null}
            onSelectionChange={key => setTimePeriod(key ? String(key) : 'month')}
          />
        </div>

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
                <th>Network</th>
                <th>Date</th>
                <th>Est. Hours</th>
                <th>Actual Hours</th>
                <th>Remaining Hours</th>
              </tr>
            </thead>
            <tbody>
              {detailedItems.map(item => {
                // Calculate remaining hours
                let remaining = '—';
                if (item.remainingHours != null) {
                  remaining = `${item.remainingHours} hrs`;
                } else if (item.projectEstimatedHours != null && item.actualDuration != null) {
                  const calc = item.projectEstimatedHours - item.actualDuration;
                  remaining = `${calc.toFixed(2)} hrs`;
                } else if (item.projectEstimatedHours != null) {
                  remaining = `${item.projectEstimatedHours} hrs`;
                }

                return (
                  <tr key={item.id}>
                    <td>
                      <strong>
                        {item.projectNo ? `${item.projectNo} — ${item.projectName}` : item.projectName}
                      </strong>
                    </td>
                    <td>{item.budgetDescription || '—'}</td>
                    <td>{item.title}</td>
                    <td>{item.activityCode || '—'}</td>
                    <td>{item.networkNumber || '—'}</td>
                    <td>{item.date ? new Date(item.date).toLocaleDateString() : '—'}</td>
                    <td>{item.projectEstimatedHours != null ? `${item.projectEstimatedHours} hrs` : '—'}</td>
                    <td>{item.actualDuration != null ? `${item.actualDuration} hrs` : '—'}</td>
                    <td>{remaining}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section className="section stack">
        <Heading level={2}>Add Work Item</Heading>
        <Form onSubmit={handleCreate} className="form-grid">
          <TextField label="Title" value={title} onChange={setTitle} isRequired />
          <Select
            label="Project"
            placeholder="Select project"
            items={projectItems}
            selectedKey={projectId || null}
            onSelectionChange={key => setProjectId(key ? String(key) : '')}
            isRequired
          />
          <Select
            label="Budget"
            placeholder="Select budget"
            items={budgetItems}
            selectedKey={budgetId || null}
            onSelectionChange={key => setBudgetId(key ? String(key) : '')}
            isRequired
          />
          
          {/* Activity Mode Selection */}
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
          
          {/* Project Activity Mode: Activity Code and Network Number */}
          {activityMode === 'project' && (
          <div className="form-columns">
            <Select
              label="Activity Code"
              placeholder={projectId ? "Select activity code" : "Select a project first"}
              items={activityCodeItems}
              selectedKey={activityCode || null}
              onSelectionChange={key => {
                const newCode = key ? String(key) : '';
                setActivityCode(newCode);
                // If filtering is active and an activity code is selected, filter network numbers
                if (projectOptions && newCode && networkNumber) {
                  const validPairs = projectOptions.validPairs
                    .filter(p => p.activityCode === newCode)
                    .map(p => String(p.networkNumber));
                  if (!validPairs.includes(networkNumber)) {
                    setNetworkNumber('');
                  }
                }
              }}
              description={projectId ? "Select an activity code for this work item" : "Select a project to see available codes"}
              isDisabled={!projectId}
            />
            <Select
              label="Network Number"
              placeholder={projectId ? "Select network number" : "Select a project first"}
              items={networkNumberItems}
              selectedKey={networkNumber || null}
              onSelectionChange={key => {
                const newNumber = key ? String(key) : '';
                setNetworkNumber(newNumber);
                // If filtering is active and a network number is selected, filter activity codes
                if (projectOptions && newNumber && activityCode) {
                  const validPairs = projectOptions.validPairs
                    .filter(p => String(p.networkNumber) === newNumber)
                    .map(p => p.activityCode);
                  if (!validPairs.includes(activityCode)) {
                    setActivityCode('');
                  }
                }
              }}
              description={projectId ? "Select a network number for this work item" : "Select a project to see available numbers"}
              isDisabled={!projectId}
            />
          </div>
          )}
          
          {/* Expense Activity Mode: Placeholder for expense-specific fields */}
          {activityMode === 'expense' && (
          <div className="form-columns">
            <Text elementType="p" className="muted" style={{ gridColumn: '1 / -1' }}>
              Expense activity mode fields will be configured when expense catalog endpoints are available.
            </Text>
          </div>
          )}
          
          <div className="form-columns">
            <NumberField
              label="Estimated Hours"
              value={estimatedHours ? Number(estimatedHours) : undefined}
              onChange={value => setEstimatedHours(value == null ? '' : String(value))}
            />
            <NumberField
              label="Remaining Hours"
              value={remainingHours ? Number(remainingHours) : undefined}
              onChange={value => setRemainingHours(value == null ? '' : String(value))}
            />
          </div>
          <TextArea label="Description" value={desc} onChange={setDesc} />
          <ButtonGroup alignment="start" ariaLabel="Work item actions">
            <Button type="submit" variant="primary" isDisabled={creating}>Create</Button>
          </ButtonGroup>
        </Form>
      </section>
      {projectId && projectOptions && projectOptions.validPairs && projectOptions.validPairs.length > 0 ? (
        <section className="section stack">
          <Heading level={2}>Available Options for Selected Project</Heading>
          <Text elementType="p">Valid activity code and network number combinations for this project:</Text>
          <table className="bcds-table">
            <thead>
              <tr>
                <th>Activity Code</th>
                <th>Network Number</th>
              </tr>
            </thead>
            <tbody>
              {projectOptions.validPairs.map(pair => {
                const code = projectOptions.activityCodes.find(c => c.code === pair.activityCode);
                const number = projectOptions.networkNumbers.find(n => n.number === pair.networkNumber);
                return (
                  <tr key={`${pair.activityCode}-${pair.networkNumber}`}>
                    <td>{code ? `${code.code}${code.description ? ` — ${code.description}` : ''}` : pair.activityCode}</td>
                    <td>{number ? `${number.number}${number.description ? ` — ${number.description}` : ''}` : pair.networkNumber}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}
