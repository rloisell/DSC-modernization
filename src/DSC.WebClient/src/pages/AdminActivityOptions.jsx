import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminActivityOptions() {
  const [message, setMessage] = useState('');
  const activityCodes = [
    { id: 1, code: 'INSPECT', description: 'Inspection activity' },
    { id: 2, code: 'REPAIR', description: 'Repair activity' }
  ];
  const networkNumbers = [
    { id: 1, number: 1001, description: 'Network A' },
    { id: 2, number: 1002, description: 'Network B' }
  ];

  function handleSubmit(e) {
    e.preventDefault();
    setMessage('Activity options are not wired to the API yet.');
  }

  return (
    <div>
      <h1>Admin Activity Options</h1>
      <p>Legacy servlet: AdminActivityOptions. This page will manage activity codes and network numbers.</p>
      <p><Link to="/admin">Back to Administrator</Link></p>
      <section>
        <h2>Add Activity Code</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Code
              <input type="text" name="code" />
            </label>
          </div>
          <div>
            <label>
              Description
              <input type="text" name="description" />
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
                  <button type="button" onClick={() => setMessage('Deactivate activity code is not wired to the API yet.')}>Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2>Add Network Number</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Network Number
              <input type="number" name="networkNumber" />
            </label>
          </div>
          <div>
            <label>
              Description
              <input type="text" name="networkDescription" />
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
                  <button type="button" onClick={() => setMessage('Deactivate network number is not wired to the API yet.')}>Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
