import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  ButtonGroup,
  Form,
  Heading,
  InlineAlert,
  Select,
  Text,
  TextField
} from '@bcgov/design-system-react-components';
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
  const navigate = useNavigate();

  const statusItems = [
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' }
  ];
  const categoryItems = categories.map(category => ({
    id: category.id,
    label: category.name
  }));
  const categoryLookup = categories.reduce((acc, category) => {
    acc[category.id] = category.name;
    return acc;
  }, {});

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
    const categoryId = optionForm.categoryId || selectedCategoryId;
    if (!categoryId) {
      setError('Select a category before adding an expense option.');
      return;
    }
    try {
      if (editingOptionId) {
        await AdminCatalogService.updateExpenseOption(editingOptionId, {
          name: optionForm.name,
          isActive: true
        });
      } else {
        await AdminCatalogService.createExpenseOption({
          expenseCategoryId: categoryId,
          name: optionForm.name
        });
      }
      if (categoryId) {
        const refreshed = await AdminCatalogService.getExpenseOptions(categoryId);
        setOptions(refreshed);
      }
      setSelectedCategoryId(categoryId);
      setOptionForm({ categoryId, name: '' });
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
    <div className="page">
      <section className="section stack">
        <Heading level={1}>Admin Expense</Heading>
        <Text elementType="p">Legacy servlet: AdminExpense. This page will manage expense categories and options.</Text>
        <div className="page-actions">
          <Button variant="link" onPress={() => navigate('/admin')}>Back to Administrator</Button>
        </div>
      </section>
      <section className="section stack">
        <Heading level={2}>{editingCategoryId ? 'Edit Expense Category' : 'Add Expense Category'}</Heading>
        <Form onSubmit={handleCategorySubmit} className="form-grid">
          <TextField
            label="Category Name"
            value={categoryForm.name}
            onChange={value => updateCategoryForm('name', value)}
            isRequired
          />
          <Select
            label="Status"
            items={statusItems}
            selectedKey={categoryForm.status}
            onSelectionChange={key => updateCategoryForm('status', String(key))}
          />
          <ButtonGroup alignment="start" ariaLabel="Expense category actions">
            <Button type="submit" variant="primary">
              {editingCategoryId ? 'Save Category' : 'Create Category'}
            </Button>
            {editingCategoryId ? (
              <Button
                type="button"
                variant="tertiary"
                onPress={() => {
                  setEditingCategoryId('');
                  setCategoryForm({ name: '', status: 'active' });
                }}
              >
                Cancel
              </Button>
            ) : null}
          </ButtonGroup>
        </Form>
      </section>
      <section className="section stack">
        <Heading level={2}>Expense Categories</Heading>
        <table className="bcds-table">
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
                  <div className="actions">
                    <Button size="small" variant="tertiary" onPress={() => handleEditCategory(category)}>Edit</Button>
                    <Button size="small" variant="tertiary" danger onPress={() => handleDeactivateCategory(category)}>
                      Deactivate
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="section stack">
        <Heading level={2}>{editingOptionId ? 'Edit Expense Option' : 'Add Expense Option'}</Heading>
        <Form onSubmit={handleOptionSubmit} className="form-grid">
          <Select
            label="Category"
            placeholder="Select category"
            items={categoryItems}
            selectedKey={optionForm.categoryId || null}
            onSelectionChange={key => {
              const nextValue = key ? String(key) : '';
              updateOptionForm('categoryId', nextValue);
              setSelectedCategoryId(nextValue);
            }}
            isRequired
          />
          <TextField
            label="Option Name"
            value={optionForm.name}
            onChange={value => updateOptionForm('name', value)}
            isRequired
          />
          <ButtonGroup alignment="start" ariaLabel="Expense option actions">
            <Button type="submit" variant="primary">
              {editingOptionId ? 'Save Option' : 'Add Option'}
            </Button>
            {editingOptionId ? (
              <Button
                type="button"
                variant="tertiary"
                onPress={() => {
                  setEditingOptionId('');
                  setOptionForm({ categoryId: '', name: '' });
                }}
              >
                Cancel
              </Button>
            ) : null}
          </ButtonGroup>
        </Form>
      </section>
      <section className="section stack">
        <Heading level={2}>Expense Options</Heading>
        <table className="bcds-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {options.map(option => (
              <tr key={option.id}>
                <td>{option.expenseCategoryName || categoryLookup[option.expenseCategoryId] || '—'}</td>
                <td>{option.name}</td>
                <td>{option.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <div className="actions">
                    <Button size="small" variant="tertiary" onPress={() => handleEditOption(option)}>Edit</Button>
                    <Button size="small" variant="tertiary" danger onPress={() => handleDeactivateOption(option)}>
                      Deactivate
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {loading ? <Text elementType="p">Loading...</Text> : null}
      {error ? <InlineAlert variant="danger" title="Error" description={error} /> : null}
      {message ? <InlineAlert variant="success" title="Success" description={message} /> : null}
    </div>
  );
}
