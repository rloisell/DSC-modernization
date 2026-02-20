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
import { getWorkItems, createWorkItemWithLegacy } from '../api/WorkItemService';
import { getProjects } from '../api/ProjectService';
import { getActivityCodes, getNetworkNumbers } from '../api/CatalogService';
import axios from 'axios';

export default function Activity() {
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activityCodes, setActivityCodes] = useState([]);
  const [networkNumbers, setNetworkNumbers] = useState([]);
  const [projectOptions, setProjectOptions] = useState(null);
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

  const projectItems = projects.map(project => ({
    id: project.id,
    label: project.projectNo ? `${project.projectNo} — ${project.name}` : project.name
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

  useEffect(() => {
    Promise.all([
      getWorkItems(),
      getProjects(),
      getActivityCodes(),
      getNetworkNumbers()
    ])
      .then(([workItems, projects, codes, numbers]) => {
        setItems(workItems);
        setProjects(projects);
        setActivityCodes(codes);
        setNetworkNumbers(numbers);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // When project changes, load project-specific options
  useEffect(() => {
    if (projectId) {
      axios.get(`/api/catalog/project-options/${projectId}`)
        .then(res => {
          setProjectOptions(res.data);
          // Reset selected activity code and network number if they're not in the project options
          const validCodes = res.data.activityCodes.map(c => c.code);
          const validNumbers = res.data.networkNumbers.map(n => String(n.number));
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
        description: desc,
        legacyActivityId: legacyActivityId ? Number(legacyActivityId) : undefined,
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
    <div className="page">
      <section className="section stack">
        <Heading level={1}>Activity</Heading>
        {loading ? <Text elementType="p">Loading...</Text> : null}
        {error ? <InlineAlert variant="danger" title="Error" description={error} /> : null}
        <ul className="inline-list">
          {items.map(i => (
            <li key={i.id}>
              {i.title ? <Text elementType="strong">{i.title}</Text> : null}
              {i.legacyActivityId ? <Text elementType="span"> (Legacy ID: {i.legacyActivityId})</Text> : null}
              {i.description ? <Text elementType="p">{i.description}</Text> : null}
              <Text elementType="p" className="muted">
                {i.date ? <span>Date: {i.date} </span> : null}
                {i.startTime ? <span>Start: {i.startTime} </span> : null}
                {i.endTime ? <span>End: {i.endTime} </span> : null}
                {i.plannedDuration ? <span>Planned: {i.plannedDuration}h </span> : null}
                {i.actualDuration ? <span>Actual: {i.actualDuration}h </span> : null}
                {i.activityCode ? <span>Code: {i.activityCode} </span> : null}
                {i.networkNumber ? <span>Network: {i.networkNumber}</span> : null}
              </Text>
            </li>
          ))}
        </ul>
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
          <TextField label="Legacy Activity ID" value={legacyActivityId} onChange={setLegacyActivityId} />
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
    </div>
  );
}
