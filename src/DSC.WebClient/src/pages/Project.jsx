import React, { useEffect, useState } from 'react';
import {
  Heading,
  InlineAlert,
  Text
} from '@bcgov/design-system-react-components';
import { getProjects } from '../api/ProjectService';
import axios from 'axios';

export default function Project() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectOptions, setProjectOptions] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSelectProject(project) {
    setSelectedProject(project);
    setLoadingOptions(true);
    setError(null);
    try {
      const response = await axios.get(`/api/catalog/project-options/${project.id}`);
      setProjectOptions(response.data);
    } catch (e) {
      setError(e.message);
      setProjectOptions(null);
    } finally {
      setLoadingOptions(false);
    }
  }

  return (
    <div className="page">
      <section className="section stack">
        <Heading level={1}>Projects</Heading>
        <Text elementType="p">Browse projects and view available activity codes and network numbers for each project.</Text>
        {loading ? <Text elementType="p">Loading...</Text> : null}
        {error ? <InlineAlert variant="danger" title="Error" description={error} /> : null}
        
        {projects.length > 0 ? (
          <table className="bcds-table">
            <thead>
              <tr>
                <th>Project No</th>
                <th>Name</th>
                <th>Description</th>
                <th>Estimated Hours</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr 
                  key={p.id}
                  onClick={() => handleSelectProject(p)}
                  style={{ cursor: 'pointer', backgroundColor: selectedProject?.id === p.id ? '#f0f9ff' : 'transparent' }}
                  onMouseEnter={(e) => {
                    if (selectedProject?.id !== p.id) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedProject?.id !== p.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <td>{p.projectNo || '—'}</td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.description || '—'}</td>
                  <td>{p.estimatedHours != null ? `${p.estimatedHours} hrs` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : !loading ? (
          <Text elementType="p" className="muted">No projects found.</Text>
        ) : null}
      </section>

      {selectedProject && (
        <section className="section stack">
          <Heading level={2}>
            Project Activity Options: {selectedProject.projectNo ? `${selectedProject.projectNo} — ${selectedProject.name}` : selectedProject.name}
          </Heading>
          {loadingOptions ? (
            <Text elementType="p">Loading project activity options...</Text>
          ) : projectOptions && projectOptions.validPairs && projectOptions.validPairs.length > 0 ? (
            <>
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
            </>
          ) : (
            <Text elementType="p" className="muted">
              No activity options assigned to this project yet. Contact an administrator to assign activity codes and network numbers.
            </Text>
          )}
        </section>
      )}
    </div>
  );
}
