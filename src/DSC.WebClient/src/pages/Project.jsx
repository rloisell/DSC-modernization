import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Form,
  Heading,
  InlineAlert,
  Text,
  TextArea,
  TextField
} from '@bcgov/design-system-react-components';
import { getProjects, createProject } from '../api/ProjectService';

export default function Project() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [projectNo, setProjectNo] = useState('');
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
      const proj = await createProject({ projectNo: projectNo || undefined, name, description: desc });
      setProjects(p => [...p, proj]);
      setName('');
      setDesc('');
      setProjectNo('');
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="page">
      <section className="section stack">
        <Heading level={1}>Projects</Heading>
        {loading ? <Text elementType="p">Loading...</Text> : null}
        {error ? <InlineAlert variant="danger" title="Error" description={error} /> : null}
        <ul className="inline-list">
          {projects.map(p => (
            <li key={p.id}>
              <Text elementType="strong">
                {p.projectNo ? `${p.projectNo} — ${p.name}` : p.name}
              </Text>
              {p.description ? <Text elementType="span">: {p.description}</Text> : null}
            </li>
          ))}
        </ul>
      </section>
      <section className="section stack">
        <Heading level={2}>Add Project</Heading>
        <Form onSubmit={handleCreate} className="form-grid">
          <TextField
            label="Project No (legacy)"
            value={projectNo}
            onChange={setProjectNo}
          />
          <TextField
            label="Name"
            value={name}
            onChange={setName}
            isRequired
          />
          <TextArea label="Description" value={desc} onChange={setDesc} />
          <ButtonGroup alignment="start" ariaLabel="Project actions">
            <Button type="submit" variant="primary" isDisabled={creating}>Create</Button>
          </ButtonGroup>
        </Form>
      </section>
    </div>
  );
}
