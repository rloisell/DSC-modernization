import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  ButtonGroup,
  Form,
  Heading,
  InlineAlert,
  NumberField,
  Text,
  TextField
} from '@bcgov/design-system-react-components';
import { AdminCatalogService } from '../api/AdminCatalogService';
import SubTabs from '../components/SubTabs';

export default function AdminActivityOptions() {
  const [message, setMessage] = useState('');
  const [activityCodes, setActivityCodes] = useState([]);
  const [networkNumbers, setNetworkNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [codeForm, setCodeForm] = useState({ code: '', description: '' });
  const [networkForm, setNetworkForm] = useState({ number: '', description: '' });
  const [editingCodeId, setEditingCodeId] = useState('');
  const [editingNetworkId, setEditingNetworkId] = useState('');
  const [subTab, setSubTab] = useState('codes');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      AdminCatalogService.getActivityCodes(),
      AdminCatalogService.getNetworkNumbers()
    ])
      .then(([codes, networks]) => {
        setActivityCodes(codes);
        setNetworkNumbers(networks);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function updateCodeForm(field, value) {
    setCodeForm(prev => ({ ...prev, [field]: value }));
  }

  function updateNetworkForm(field, value) {
    setNetworkForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleCodeSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError(null);
    try {
      if (editingCodeId) {
        await AdminCatalogService.updateActivityCode(editingCodeId, {
          code: codeForm.code,
          description: codeForm.description,
          isActive: true
        });
      } else {
        await AdminCatalogService.createActivityCode({
          code: codeForm.code,
          description: codeForm.description
        });
      }
      const refreshed = await AdminCatalogService.getActivityCodes();
      setActivityCodes(refreshed);
      setCodeForm({ code: '', description: '' });
      setEditingCodeId('');
      setMessage(editingCodeId ? 'Activity code updated.' : 'Activity code created.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleNetworkSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError(null);
    try {
      if (editingNetworkId) {
        await AdminCatalogService.updateNetworkNumber(editingNetworkId, {
          number: Number(networkForm.number),
          description: networkForm.description,
          isActive: true
        });
      } else {
        await AdminCatalogService.createNetworkNumber({
          number: Number(networkForm.number),
          description: networkForm.description
        });
      }
      const refreshed = await AdminCatalogService.getNetworkNumbers();
      setNetworkNumbers(refreshed);
      setNetworkForm({ number: '', description: '' });
      setEditingNetworkId('');
      setMessage(editingNetworkId ? 'Network number updated.' : 'Network number created.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeactivateCode(code) {
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.updateActivityCode(code.id, {
        code: code.code,
        description: code.description,
        isActive: false
      });
      const refreshed = await AdminCatalogService.getActivityCodes();
      setActivityCodes(refreshed);
      setMessage('Activity code deactivated.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeleteCode(code) {
    if (!window.confirm(`Delete activity code "${code.code}"? This cannot be undone.`)) {
      return;
    }
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.deleteActivityCode(code.id);
      const refreshed = await AdminCatalogService.getActivityCodes();
      setActivityCodes(refreshed);
      setMessage('Activity code deleted.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeactivateNetwork(network) {
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.updateNetworkNumber(network.id, {
        number: network.number,
        description: network.description,
        isActive: false
      });
      const refreshed = await AdminCatalogService.getNetworkNumbers();
      setNetworkNumbers(refreshed);
      setMessage('Network number deactivated.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeleteNetwork(network) {
    if (!window.confirm(`Delete network number "${network.number}"? This cannot be undone.`)) {
      return;
    }
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.deleteNetworkNumber(network.id);
      const refreshed = await AdminCatalogService.getNetworkNumbers();
      setNetworkNumbers(refreshed);
      setMessage('Network number deleted.');
    } catch (e) {
      setError(e.message);
    }
  }

  function handleEditCode(code) {
    setEditingCodeId(code.id);
    setSubTab('codes');
    setCodeForm({ code: code.code, description: code.description || '' });
  }

  function handleEditNetwork(network) {
    setEditingNetworkId(network.id);
    setSubTab('networks');
    setNetworkForm({ number: String(network.number), description: network.description || '' });
  }

  return (
    <div className="page">
      <section className="section stack">
        <Heading level={1}>Admin Activity Options</Heading>
        <Text elementType="p">
          Legacy servlet: AdminActivityOptions. This page will manage activity codes and network numbers.
        </Text>

      </section>
      <SubTabs
        tabs={[
          { id: 'codes', label: 'Activity Codes' },
          { id: 'networks', label: 'Network Numbers' },
        ]}
        activeTab={subTab}
        onTabChange={setSubTab}
      />
      {subTab === 'codes' && (<>
      <section className="section stack">
        <Heading level={2}>{editingCodeId ? 'Edit Activity Code' : 'Add Activity Code'}</Heading>
        <Form onSubmit={handleCodeSubmit} className="form-grid">
          <TextField
            label="Code"
            value={codeForm.code}
            onChange={value => updateCodeForm('code', value)}
            isRequired
          />
          <TextField
            label="Description"
            value={codeForm.description}
            onChange={value => updateCodeForm('description', value)}
          />
          <ButtonGroup alignment="start" ariaLabel="Activity code actions">
            <Button type="submit" variant="primary">
              {editingCodeId ? 'Save Activity Code' : 'Create Activity Code'}
            </Button>
            {editingCodeId ? (
              <Button
                type="button"
                variant="tertiary"
                onPress={() => {
                  setEditingCodeId('');
                  setCodeForm({ code: '', description: '' });
                  setSubTab('codes');
                }}
              >
                Cancel
              </Button>
            ) : null}
          </ButtonGroup>
        </Form>
      </section>
      <section className="section stack">
        <Heading level={2}>Activity Codes</Heading>
        <table className="bcds-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activityCodes.map(code => (
              <tr key={code.id}>
                <td>{code.code}</td>
                <td>{code.description}</td>
                <td>
                  <div className="actions">
                    <Button size="small" variant="tertiary" onPress={() => handleEditCode(code)}>Edit</Button>
                    <Button size="small" variant="tertiary" danger onPress={() => handleDeactivateCode(code)}>
                      Deactivate
                    </Button>
                    <Button size="small" variant="secondary" danger onPress={() => handleDeleteCode(code)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      </>)}
      {subTab === 'networks' && (<>
      <section className="section stack">
        <Heading level={2}>{editingNetworkId ? 'Edit Network Number' : 'Add Network Number'}</Heading>
        <Form onSubmit={handleNetworkSubmit} className="form-grid">
          <NumberField
            label="Network Number"
            value={networkForm.number ? Number(networkForm.number) : undefined}
            onChange={value => updateNetworkForm('number', value == null ? '' : String(value))}
            isRequired
          />
          <TextField
            label="Description"
            value={networkForm.description}
            onChange={value => updateNetworkForm('description', value)}
          />
          <ButtonGroup alignment="start" ariaLabel="Network number actions">
            <Button type="submit" variant="primary">
              {editingNetworkId ? 'Save Network Number' : 'Create Network Number'}
            </Button>
            {editingNetworkId ? (
              <Button
                type="button"
                variant="tertiary"
                onPress={() => {
                  setEditingNetworkId('');
                  setNetworkForm({ number: '', description: '' });
                  setSubTab('networks');
                }}
              >
                Cancel
              </Button>
            ) : null}
          </ButtonGroup>
        </Form>
      </section>
      <section className="section stack">
        <Heading level={2}>Network Numbers</Heading>
        <table className="bcds-table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {networkNumbers.map(network => (
              <tr key={network.id}>
                <td>{network.number}</td>
                <td>{network.description}</td>
                <td>
                  <div className="actions">
                    <Button size="small" variant="tertiary" onPress={() => handleEditNetwork(network)}>Edit</Button>
                    <Button size="small" variant="tertiary" danger onPress={() => handleDeactivateNetwork(network)}>
                      Deactivate
                    </Button>
                    <Button size="small" variant="secondary" danger onPress={() => handleDeleteNetwork(network)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      </>)}
      {loading ? <Text elementType="p">Loading...</Text> : null}
      {error ? <InlineAlert variant="danger" title="Error" description={error} /> : null}
      {message ? <InlineAlert variant="success" title="Success" description={message} /> : null}
    </div>
  );
}
