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
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [budgetForm, setBudgetForm] = useState({ description: '', status: 'active' });
  const [categoryForm, setCategoryForm] = useState({ budgetId: '', name: '', status: 'active' });
  const [editingCategoryId, setEditingCategoryId] = useState('');
  const [editingBudgetId, setEditingBudgetId] = useState('');
  const navigate = useNavigate();

  const statusItems = [
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' }
  ];
  const budgetItems = budgets.map(budget => ({
    id: budget.id,
    label: budget.description
  }));

  useEffect(() => {
    Promise.all([
      AdminCatalogService.getBudgets(),
      AdminCatalogService.getExpenseCategories()
    ])
      .then(([budgetData, categoryData]) => {
        setBudgets(budgetData);
        setCategories(categoryData);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function updateCategoryForm(field, value) {
    setCategoryForm(prev => ({ ...prev, [field]: value }));
  }


  async function handleCategorySubmit(e) {
    e.preventDefault();
    setMessage('');
    setError(null);
    if (!categoryForm.budgetId) {
      setError('Select a budget before saving a category.');
      return;
    }
    try {
      if (editingCategoryId) {
        await AdminCatalogService.updateExpenseCategory(editingCategoryId, {
          budgetId: categoryForm.budgetId,
          name: categoryForm.name,
          isActive: categoryForm.status === 'active'
        });
      } else {
        await AdminCatalogService.createExpenseCategory({
          budgetId: categoryForm.budgetId,
          name: categoryForm.name
        });
      }
      const refreshed = await AdminCatalogService.getExpenseCategories();
      setCategories(refreshed);
      setCategoryForm({ budgetId: categoryForm.budgetId, name: '', status: 'active' });
      setEditingCategoryId('');
      setMessage(editingCategoryId ? 'Expense category updated.' : 'Expense category created.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleBudgetSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError(null);
    try {
      if (editingBudgetId) {
        await AdminCatalogService.updateBudget(editingBudgetId, {
          description: budgetForm.description,
          isActive: budgetForm.status === 'active'
        });
      } else {
        await AdminCatalogService.createBudget({
          description: budgetForm.description
        });
      }
      const refreshed = await AdminCatalogService.getBudgets();
      setBudgets(refreshed);
      setBudgetForm({ description: '', status: 'active' });
      setEditingBudgetId('');
      setMessage(editingBudgetId ? 'Budget updated.' : 'Budget created.');
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

  async function handleDeactivateBudget(budget) {
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.updateBudget(budget.id, {
        description: budget.description,
        isActive: false
      });
      const refreshed = await AdminCatalogService.getBudgets();
      setBudgets(refreshed);
      setMessage('Budget deactivated.');
    } catch (e) {
      setError(e.message);
    }
  }

  function handleEditCategory(category) {
    setEditingCategoryId(category.id);
    setCategoryForm({
      budgetId: category.budgetId || '',
      name: category.name,
      status: category.isActive ? 'active' : 'inactive'
    });
  }

  function handleEditBudget(budget) {
    setEditingBudgetId(budget.id);
    setBudgetForm({
      description: budget.description,
      status: budget.isActive ? 'active' : 'inactive'
    });
  }

  return (
    <div className="page">
      <section className="section stack">
        <Heading level={1}>Admin Expense</Heading>
        <Text elementType="p">Legacy servlet: AdminExpense. This page will manage budgets (CAPEX/OPEX) and expense categories.</Text>
        <div className="page-actions">
          <Button variant="link" onPress={() => navigate('/admin')}>Back to Administrator</Button>
        </div>
      </section>
      <section className="section stack">
        <Heading level={2}>{editingBudgetId ? 'Edit Budget' : 'Add Budget'}</Heading>
        <Form onSubmit={handleBudgetSubmit} className="form-grid">
          <TextField
            label="Budget Description"
            value={budgetForm.description}
            onChange={value => setBudgetForm(prev => ({ ...prev, description: value }))}
            isRequired
          />
          <Select
            label="Status"
            items={statusItems}
            selectedKey={budgetForm.status}
            onSelectionChange={key => setBudgetForm(prev => ({ ...prev, status: String(key) }))}
          />
          <ButtonGroup alignment="start" ariaLabel="Budget actions">
            <Button type="submit" variant="primary">
              {editingBudgetId ? 'Save Budget' : 'Create Budget'}
            </Button>
            {editingBudgetId ? (
              <Button
                type="button"
                variant="tertiary"
                onPress={() => {
                  setEditingBudgetId('');
                  setBudgetForm({ description: '', status: 'active' });
                }}
              >
                Cancel
              </Button>
            ) : null}
          </ButtonGroup>
        </Form>
      </section>
      <section className="section stack">
        <Heading level={2}>Budgets</Heading>
        <table className="bcds-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map(budget => (
              <tr key={budget.id}>
                <td>{budget.description}</td>
                <td>{budget.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <div className="actions">
                    <Button size="small" variant="tertiary" onPress={() => handleEditBudget(budget)}>Edit</Button>
                    <Button size="small" variant="tertiary" danger onPress={() => handleDeactivateBudget(budget)}>
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
        <Heading level={2}>{editingCategoryId ? 'Edit Expense Category' : 'Add Expense Category'}</Heading>
        <Form onSubmit={handleCategorySubmit} className="form-grid">
          <Select
            label="Budget"
            placeholder="Select budget"
            items={budgetItems}
            selectedKey={categoryForm.budgetId || null}
            onSelectionChange={key => updateCategoryForm('budgetId', key ? String(key) : '')}
            isRequired
          />
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
              <th>Budget</th>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id}>
                <td>{category.budgetDescription || '—'}</td>
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
      {loading ? <Text elementType="p">Loading...</Text> : null}
      {error ? <InlineAlert variant="danger" title="Error" description={error} /> : null}
      {message ? <InlineAlert variant="success" title="Success" description={message} /> : null}
    </div>
  );
}
