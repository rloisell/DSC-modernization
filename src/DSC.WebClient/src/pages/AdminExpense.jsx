import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminExpense() {
  const [message, setMessage] = useState('');
  const categories = [
    { id: 1, name: 'Travel', status: 'Active' },
    { id: 2, name: 'Supplies', status: 'Active' }
  ];

  function handleSubmit(e) {
    e.preventDefault();
    setMessage('Expense admin actions are not wired to the API yet.');
  }

  return (
    <div>
      <h1>Admin Expense</h1>
      <p>Legacy servlet: AdminExpense. This page will manage expense categories and options.</p>
      <p><Link to="/admin">Back to Administrator</Link></p>
      <section>
        <h2>Add Expense Category</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Category Name
              <input type="text" name="name" />
            </label>
          </div>
          <div>
            <label>
              Status
              <select name="status">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>
          <button type="submit">Create Category</button>
        </form>
      </section>
      <section>
        <h2>Expense Categories</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.status}</td>
                <td>
                  <button type="button" onClick={() => setMessage('Edit category is not wired to the API yet.')}>Edit</button>
                  <button type="button" onClick={() => setMessage('Deactivate category is not wired to the API yet.')}>Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2>Add Expense Option</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Category
              <select name="category">
                <option value="">Select category</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              Option Name
              <input type="text" name="optionName" />
            </label>
          </div>
          <button type="submit">Add Option</button>
        </form>
      </section>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
