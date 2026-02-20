import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminCatalogService } from '../api/AdminCatalogService';

export default function AdminExpense() {
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', status: 'active' });
  const [optionForm, setOptionForm] = useState({ categoryId: '', name: '' });
  const [editingCategoryId, setEditingCategoryId] = useState('');
  const [editingOptionId, setEditingOptionId] = useState('');

  useEffect(() => {
    AdminCatalogService.getExpenseCategories()
      .then(data => {
        setCategories(data);
        return data;
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      setOptions([]);
      return;
    }

    AdminCatalogService.getExpenseOptions(selectedCategoryId)
      .then(setOptions)
      .catch(e => setError(e.message));
  }, [selectedCategoryId]);

  function updateCategoryForm(field, value) {
    setCategoryForm(prev => ({ ...prev, [field]: value }));
  }

  function updateOptionForm(field, value) {
    setOptionForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleCategorySubmit(e) {
    e.preventDefault();
    setMessage('');
    setError(null);
    try {
      if (editingCategoryId) {
        await AdminCatalogService.updateExpenseCategory(editingCategoryId, {
          name: categoryForm.name,
          isActive: categoryForm.status === 'active'
        });
      } else {
        await AdminCatalogService.createExpenseCategory({
          name: categoryForm.name
        });
      }
      const refreshed = await AdminCatalogService.getExpenseCategories();
      setCategories(refreshed);
      setCategoryForm({ name: '', status: 'active' });
      setEditingCategoryId('');
      setMessage(editingCategoryId ? 'Expense category updated.' : 'Expense category created.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleOptionSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError(null);
    try {
      if (editingOptionId) {
        await AdminCatalogService.updateExpenseOption(editingOptionId, {
          name: optionForm.name,
          isActive: true
        });
      } else {
        await AdminCatalogService.createExpenseOption({
          expenseCategoryId: optionForm.categoryId,
          name: optionForm.name
        });
      }
      if (selectedCategoryId) {
        const refreshed = await AdminCatalogService.getExpenseOptions(selectedCategoryId);
        setOptions(refreshed);
      }
      setOptionForm({ categoryId: '', name: '' });
      setEditingOptionId('');
      setMessage(editingOptionId ? 'Expense option updated.' : 'Expense option created.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeactivateCategory(category) {
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.updateExpenseCategory(category.id, {
        name: category.name,
        isActive: false
      });
      const refreshed = await AdminCatalogService.getExpenseCategories();
      setCategories(refreshed);
      setMessage('Expense category deactivated.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeactivateOption(option) {
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.updateExpenseOption(option.id, {
        name: option.name,
        isActive: false
      });
      if (selectedCategoryId) {
        const refreshed = await AdminCatalogService.getExpenseOptions(selectedCategoryId);
        setOptions(refreshed);
      }
      setMessage('Expense option deactivated.');
    } catch (e) {
      setError(e.message);
    }
  }

  function handleEditCategory(category) {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name: category.name,
      status: category.isActive ? 'active' : 'inactive'
    });
  }

  function handleEditOption(option) {
    setEditingOptionId(option.id);
    setOptionForm({ categoryId: option.expenseCategoryId, name: option.name });
    setSelectedCategoryId(option.expenseCategoryId);
  }

  return (
    <div>
      <h1>Admin Expense</h1>
      <p>Legacy servlet: AdminExpense. This page will manage expense categories and options.</p>
      <p><Link to="/admin">Back to Administrator</Link></p>
      <section>
        <h2>{editingCategoryId ? 'Edit Expense Category' : 'Add Expense Category'}</h2>
        <form onSubmit={handleCategorySubmit}>
          <div>
            <label>
              Category Name
              <input
                type="text"
                name="name"
                value={categoryForm.name}
                onChange={e => updateCategoryForm('name', e.target.value)}
                required
              />
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
          {editingCategoryId ? (
            <button type="button" onClick={() => {
              setEditingCategoryId('');
              setCategoryForm({ name: '', status: 'active' });
            }}>Cancel</button>
          ) : null}
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
                <td>{category.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <button type="button" onClick={() => handleEditCategory(category)}>Edit</button>
                  <button type="button" onClick={() => handleDeactivateCategory(category)}>Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2>{editingOptionId ? 'Edit Expense Option' : 'Add Expense Option'}</h2>
        <form onSubmit={handleOptionSubmit}>
          <div>
            <label>
              Category
              <select
                name="category"
                value={optionForm.categoryId}
                onChange={e => {
                  updateOptionForm('categoryId', e.target.value);
                  setSelectedCategoryId(e.target.value);
                }}
                required
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label>
              Option Name
              <input
                type="text"
                name="optionName"
                value={optionForm.name}
                onChange={e => updateOptionForm('name', e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit">Add Option</button>
          {editingOptionId ? (
            <button type="button" onClick={() => {
              setEditingOptionId('');
              setOptionForm({ categoryId: '', name: '' });
            }}>Cancel</button>
          ) : null}
        </form>
      </section>
      <section>
        <h2>Expense Options</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {options.map(option => (
              <tr key={option.id}>
                <td>{option.name}</td>
                <td>{option.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <button type="button" onClick={() => handleEditOption(option)}>Edit</button>
                  <button type="button" onClick={() => handleDeactivateOption(option)}>Deactivate</button>
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
