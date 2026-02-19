import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminCatalogService } from '../api/AdminCatalogService';

export default function AdminActivityOptions() {
  const [message, setMessage] = useState('');
  const [activityCodes, setActivityCodes] = useState([]);
  const [networkNumbers, setNetworkNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [codeForm, setCodeForm] = useState({ code: '', description: '' });
  const [networkForm, setNetworkForm] = useState({ number: '', description: '' });

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
      await AdminCatalogService.createActivityCode({
        code: codeForm.code,
        description: codeForm.description
      });
      const refreshed = await AdminCatalogService.getActivityCodes();
      setActivityCodes(refreshed);
      setCodeForm({ code: '', description: '' });
      setMessage('Activity code created.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleNetworkSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.createNetworkNumber({
        number: Number(networkForm.number),
        description: networkForm.description
      });
      const refreshed = await AdminCatalogService.getNetworkNumbers();
      setNetworkNumbers(refreshed);
      setNetworkForm({ number: '', description: '' });
      setMessage('Network number created.');
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

  return (
    <div>
      <h1>Admin Activity Options</h1>
      <p>Legacy servlet: AdminActivityOptions. This page will manage activity codes and network numbers.</p>
      <p><Link to="/admin">Back to Administrator</Link></p>
      <section>
        <h2>Add Activity Code</h2>
        <form onSubmit={handleCodeSubmit}>
          <div>
            <label>
              Code
              <input
                type="text"
                name="code"
                value={codeForm.code}
                onChange={e => updateCodeForm('code', e.target.value)}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Description
              <input
                type="text"
                name="description"
                value={codeForm.description}
                onChange={e => updateCodeForm('description', e.target.value)}
              />
            </label>
          </div>
          <button type="submit">Create Activity Code</button>
        </form>
      </section>
      <section>
        <h2>Activity Codes</h2>
        <table>
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
                  <button type="button" onClick={() => setMessage('Edit activity code is not wired to the API yet.')}>Edit</button>
                  <button type="button" onClick={() => handleDeactivateCode(code)}>Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2>Add Network Number</h2>
        <form onSubmit={handleNetworkSubmit}>
          <div>
            <label>
              Network Number
              <input
                type="number"
                name="networkNumber"
                value={networkForm.number}
                onChange={e => updateNetworkForm('number', e.target.value)}
                required
              />
            </label>
          </div>
          <div>
            <label>
              Description
              <input
                type="text"
                name="networkDescription"
                value={networkForm.description}
                onChange={e => updateNetworkForm('description', e.target.value)}
              />
            </label>
          </div>
          <button type="submit">Create Network Number</button>
        </form>
      </section>
      <section>
        <h2>Network Numbers</h2>
        <table>
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
                  <button type="button" onClick={() => setMessage('Edit network number is not wired to the API yet.')}>Edit</button>
                  <button type="button" onClick={() => handleDeactivateNetwork(network)}>Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {loading ? <p>Loading...</p> : null}
      {error ? <p style={{color:'red'}}>Error: {error}</p> : null}
      {message ? <p>{message}</p> : null}
    </div>
  );
}
