/*
 * AdminProjects.jsx
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Admin project management page. CRUD for project records (name, project number,
 * estimated hours, active status) with inline form and optimistic list updates.
 * AI-assisted: CRUD page scaffolding, form state, list refresh pattern;
 * reviewed and directed by Ryan Loiselle.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { AdminCatalogService } from '../api/AdminCatalogService';
import SubTabs from '../components/SubTabs';

export default function AdminProjects() {
  const [message, setMessage] = useState('');
  const [projects, setProjects] = useState([]);
  const [activityCodes, setActivityCodes] = useState([]);
  const [networkNumbers, setNetworkNumbers] = useState([]);
  const [projectActivityOptions, setProjectActivityOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ projectNo: '', name: '', description: '', estimatedHours: '' });
  const [assignForm, setAssignForm] = useState({ projectId: '', activityCodeId: '', networkNumberId: '' });
  const [editingId, setEditingId] = useState('');
  const [subTab, setSubTab] = useState('projects');
  const navigate = useNavigate();

  const projectItems = projects.map(project => ({
    id: project.id,
    label: project.projectNo ? `${project.projectNo} — ${project.name}` : project.name
  }));
  const activityItems = activityCodes.map(code => ({
    id: code.id,
    label: `${code.code} - ${code.description || ''}`.trim()
  }));
  const networkItems = networkNumbers.map(network => ({
    id: network.id,
    label: `${network.number}${network.description ? ` - ${network.description}` : ''}`
  }));

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [projectData, codeData, networkData, optionsData] = await Promise.all([
        AdminCatalogService.getProjects(),
        AdminCatalogService.getActivityCodes(),
        AdminCatalogService.getNetworkNumbers(),
        AdminCatalogService.getProjectActivityOptions()
      ]);
      setProjects(projectData);
      setActivityCodes(codeData);
      setNetworkNumbers(networkData);
      setProjectActivityOptions(optionsData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

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
      if (editingId) {
        await AdminCatalogService.updateProject(editingId, {
          projectNo: form.projectNo || null,
          name: form.name,
          description: form.description || null,
          estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : null,
          isActive: true
        });
      } else {
        await AdminCatalogService.createProject({
          projectNo: form.projectNo || null,
          name: form.name,
          description: form.description || null,
          estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : null
        });
      }
      const refreshed = await AdminCatalogService.getProjects();
      setProjects(refreshed);
      setForm({ projectNo: '', name: '', description: '', estimatedHours: '' });
      setEditingId('');
      setSubTab('projects');
      setMessage(editingId ? 'Project updated.' : 'Project created.');
    } catch (e) {
      setError(e.message);
    }
  }

  function handleEdit(project) {
    setEditingId(project.id);
    setSubTab('edit');
    setForm({
      projectNo: project.projectNo || '',
      name: project.name,
      description: project.description || '',
      estimatedHours: project.estimatedHours ?? ''
    });
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

  async function handleDelete(project) {
    if (!window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) {
      return;
    }
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.deleteProject(project.id);
      await loadData();
      setMessage('Project deleted.');
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

  async function handleAssignAll(projectId) {
    setMessage('');
    setError(null);
    try {
      const response = await AdminCatalogService.assignAllActivityOptionsToProject(projectId);
      setMessage(response.message || 'All activity codes and network numbers assigned to project.');
      await loadData();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeleteOption(projectId, activityCodeId, networkNumberId) {
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.deleteProjectActivityOption(projectId, activityCodeId, networkNumberId);
      setMessage('Project activity option deleted.');
      await loadData();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="page">
      <SubTabs
        tabs={[
          { id: 'projects', label: 'Projects' },
          { id: 'add', label: 'Add' },
          ...(editingId ? [{ id: 'edit', label: 'Edit' }] : []),
          { id: 'assign', label: 'Assign Options' },
          { id: 'assignments', label: 'Assignments' },
        ]}
        activeTab={subTab}
        onTabChange={(tab) => { if (tab === 'add') setEditingId(''); setSubTab(tab); }}
      />
      {(subTab === 'add' || subTab === 'edit') && (
      <section className="section stack">
        <Heading level={2}>{editingId ? 'Edit Project' : 'Add Project'}</Heading>
        <Form onSubmit={handleSubmit} className="form-grid">
          <TextField
            label="Project No (Legacy)"
            value={form.projectNo}
            onChange={value => updateForm('projectNo', value)}
          />
          <TextField
            label="Name"
            value={form.name}
            onChange={value => updateForm('name', value)}
            isRequired
          />
          <TextArea
            label="Description"
            value={form.description}
            onChange={value => updateForm('description', value)}
          />
          <NumberField
            label="Estimated Hours"
            value={form.estimatedHours ? Number(form.estimatedHours) : undefined}
            onChange={value => updateForm('estimatedHours', value == null ? '' : String(value))}
          />
          <ButtonGroup alignment="start" ariaLabel="Project actions">
            <Button type="submit" variant="primary">
              {editingId ? 'Save Project' : 'Create Project'}
            </Button>
            {editingId ? (
              <Button
                type="button"
                variant="tertiary"
                onPress={() => {
                  setEditingId('');
                  setForm({ projectNo: '', name: '', description: '', estimatedHours: '' });
                  setSubTab('projects');
                }}
              >
                Cancel
              </Button>
            ) : null}
          </ButtonGroup>
        </Form>
      </section>
      )}
      {subTab === 'projects' && (
      <section className="section stack">
        <Heading level={2}>Existing Projects</Heading>
        <table className="bcds-table">
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
                  <div className="actions">
                    <Button size="small" variant="tertiary" onPress={() => handleEdit(project)}>Edit</Button>
                    <Button size="small" variant="tertiary" danger onPress={() => handleArchive(project)}>
                      Archive
                    </Button>
                    <Button size="small" variant="secondary" danger onPress={() => handleDelete(project)}>
                      Delete
                    </Button>
                    <Button size="small" variant="secondary" onPress={() => handleAssignAll(project.id)}>
                      Assign All Options
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      )}
      {subTab === 'assign' && (
      <section className="section stack">
        <Heading level={2}>Assign Activity Codes / Network Numbers</Heading>
        <Form onSubmit={handleAssign} className="form-grid">
          <Select
            label="Project"
            placeholder="Select project"
            items={projectItems}
            selectedKey={assignForm.projectId || null}
            onSelectionChange={key => updateAssignForm('projectId', key ? String(key) : '')}
            isRequired
          />
          <div className="form-columns">
            <Select
              label="Activity Code"
              placeholder="Select activity code"
              items={activityItems}
              selectedKey={assignForm.activityCodeId || null}
              onSelectionChange={key => updateAssignForm('activityCodeId', key ? String(key) : '')}
              isRequired
            />
            <Select
              label="Network Number"
              placeholder="Select network number"
              items={networkItems}
              selectedKey={assignForm.networkNumberId || null}
              onSelectionChange={key => updateAssignForm('networkNumberId', key ? String(key) : '')}
              isRequired
            />
          </div>
          <ButtonGroup alignment="start" ariaLabel="Assignment actions">
            <Button type="submit" variant="primary">Assign</Button>
          </ButtonGroup>
        </Form>
      </section>
      )}
      {subTab === 'assignments' && (
      <section className="section stack">
        <Heading level={2}>Project Activity Options</Heading>
        <Text elementType="p">All assigned activity code and network number combinations for projects.</Text>
        {projectActivityOptions.length === 0 ? (
          <Text elementType="p" className="muted">No project activity options assigned yet.</Text>
        ) : (
          <table className="bcds-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Activity Code</th>
                <th>Network Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projectActivityOptions.map(option => {
                const project = projects.find(p => p.id === option.projectId);
                return (
                  <tr key={`${option.projectId}-${option.activityCodeId}-${option.networkNumberId}`}>
                    <td>{project ? (project.projectNo ? `${project.projectNo} — ${project.name}` : project.name) : 'Unknown'}</td>
                    <td>{option.activityCode ? `${option.activityCode.code}${option.activityCode.description ? ` — ${option.activityCode.description}` : ''}` : 'Unknown'}</td>
                    <td>{option.networkNumber ? `${option.networkNumber.number}${option.networkNumber.description ? ` — ${option.networkNumber.description}` : ''}` : 'Unknown'}</td>
                    <td>
                      <Button 
                        size="small" 
                        variant="tertiary" 
                        danger 
                        onPress={() => handleDeleteOption(option.projectId, option.activityCodeId, option.networkNumberId)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
      )}
      {loading ? <Text elementType="p">Loading...</Text> : null}
      {error ? <InlineAlert variant="danger" title="Error" description={error} /> : null}
      {message ? <InlineAlert variant="success" title="Success" description={message} /> : null}
    </div>
  );
}
