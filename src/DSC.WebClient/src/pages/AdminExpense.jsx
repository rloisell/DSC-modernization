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
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [budgetForm, setBudgetForm] = useState({ description: '', status: 'active' });
  const [categoryForm, setCategoryForm] = useState({ budgetId: '', name: '', status: 'active' });
  const [optionForm, setOptionForm] = useState({ categoryId: '', name: '', status: 'active' });
  const [editingCategoryId, setEditingCategoryId] = useState('');
  const [editingBudgetId, setEditingBudgetId] = useState('');
  const [editingOptionId, setEditingOptionId] = useState('');
  const navigate = useNavigate();

  const statusItems = [
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' }
  ];
  const budgetItems = budgets.map(budget => ({
    id: budget.id,
    label: budget.description
  }));
  const categoryItems = categories.map(category => ({
    id: category.id,
    label: category.name
  }));

  useEffect(() => {
    Promise.all([
      AdminCatalogService.getBudgets(),
      AdminCatalogService.getExpenseCategories(),
      AdminCatalogService.getExpenseOptions()
    ])
      .then(([budgetData, categoryData, optionData]) => {
        setBudgets(budgetData);
        setCategories(categoryData);
        setOptions(optionData);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function updateCategoryForm(field, value) {
    setCategoryForm(prev => ({ ...prev, [field]: value }));
  }

  function updateOptionForm(field, value) {
    setOptionForm(prev => ({ ...prev, [field]: value }));
  }

  function getErrorMessage(err) {
    return err?.response?.data?.error || err?.message || 'Request failed.';
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
      setError(getErrorMessage(e));
    }
  }

  async function handleOptionSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError(null);
    if (!optionForm.categoryId) {
      setError('Select a category before saving an option.');
      return;
    }
    try {
      if (editingOptionId) {
        await AdminCatalogService.updateExpenseOption(editingOptionId, {
          expenseCategoryId: optionForm.categoryId,
          name: optionForm.name,
          isActive: optionForm.status === 'active'
        });
      } else {
        await AdminCatalogService.createExpenseOption({
          expenseCategoryId: optionForm.categoryId,
          name: optionForm.name
        });
      }
      const refreshed = await AdminCatalogService.getExpenseOptions();
      setOptions(refreshed);
      setOptionForm({ categoryId: optionForm.categoryId, name: '', status: 'active' });
      setEditingOptionId('');
      setMessage(editingOptionId ? 'Expense option updated.' : 'Expense option created.');
    } catch (e) {
      setError(getErrorMessage(e));
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
      setError(getErrorMessage(e));
    }
  }

  async function handleDeactivateCategory(category) {
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.updateExpenseCategory(category.id, {
        budgetId: category.budgetId,
        name: category.name,
        isActive: false
      });
      const refreshed = await AdminCatalogService.getExpenseCategories();
      setCategories(refreshed);
      setMessage('Expense category deactivated.');
    } catch (e) {
      setError(getErrorMessage(e));
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
      setError(getErrorMessage(e));
    }
  }

  async function handleDeactivateOption(option) {
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.updateExpenseOption(option.id, {
        expenseCategoryId: option.expenseCategoryId,
        name: option.name,
        isActive: false
      });
      const refreshed = await AdminCatalogService.getExpenseOptions();
      setOptions(refreshed);
      setMessage('Expense option deactivated.');
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  async function handleDeleteBudget(budget) {
    if (!window.confirm(`Delete budget "${budget.description}"? This cannot be undone.`)) {
      return;
    }
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.deleteBudget(budget.id);
      const refreshed = await AdminCatalogService.getBudgets();
      setBudgets(refreshed);
      setMessage('Budget deleted.');
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  async function handleDeleteCategory(category) {
    if (!window.confirm(`Delete expense category "${category.name}"? This cannot be undone.`)) {
      return;
    }
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.deleteExpenseCategory(category.id);
      const refreshed = await AdminCatalogService.getExpenseCategories();
      setCategories(refreshed);
      setMessage('Expense category deleted.');
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  async function handleDeleteOption(option) {
    if (!window.confirm(`Delete expense option "${option.name}"? This cannot be undone.`)) {
      return;
    }
    setMessage('');
    setError(null);
    try {
      await AdminCatalogService.deleteExpenseOption(option.id);
      const refreshed = await AdminCatalogService.getExpenseOptions();
      setOptions(refreshed);
      setMessage('Expense option deleted.');
    } catch (e) {
      setError(getErrorMessage(e));
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

  function handleEditOption(option) {
    setEditingOptionId(option.id);
    setOptionForm({
      categoryId: option.expenseCategoryId || '',
      name: option.name,
      status: option.isActive ? 'active' : 'inactive'
    });
  }

  return (
    <div className="page">
      <section className="section stack">
        <Heading level={1}>Admin Expense</Heading>
        <Text elementType="p">Legacy servlet: AdminExpense. This page will manage budgets (CAPEX/OPEX) and expense categories.</Text>

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
                    <Button size="small" variant="secondary" danger onPress={() => handleDeleteBudget(budget)}>
                      Delete
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
                  setCategoryForm({ budgetId: '', name: '', status: 'active' });
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
                    <Button size="small" variant="secondary" danger onPress={() => handleDeleteCategory(category)}>
                      Delete
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
            label="Expense Category"
            placeholder="Select category"
            items={categoryItems}
            selectedKey={optionForm.categoryId || null}
            onSelectionChange={key => updateOptionForm('categoryId', key ? String(key) : '')}
            isRequired
          />
          <TextField
            label="Option Name"
            value={optionForm.name}
            onChange={value => updateOptionForm('name', value)}
            isRequired
          />
          <Select
            label="Status"
            items={statusItems}
            selectedKey={optionForm.status}
            onSelectionChange={key => updateOptionForm('status', String(key))}
          />
          <ButtonGroup alignment="start" ariaLabel="Expense option actions">
            <Button type="submit" variant="primary">
              {editingOptionId ? 'Save Option' : 'Create Option'}
            </Button>
            {editingOptionId ? (
              <Button
                type="button"
                variant="tertiary"
                onPress={() => {
                  setEditingOptionId('');
                  setOptionForm({ categoryId: '', name: '', status: 'active' });
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
                <td>{option.expenseCategoryName || categories.find(c => c.id === option.expenseCategoryId)?.name || '—'}</td>
                <td>{option.name}</td>
                <td>{option.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <div className="actions">
                    <Button size="small" variant="tertiary" onPress={() => handleEditOption(option)}>Edit</Button>
                    <Button size="small" variant="tertiary" danger onPress={() => handleDeactivateOption(option)}>
                      Deactivate
                    </Button>
                    <Button size="small" variant="secondary" danger onPress={() => handleDeleteOption(option)}>
                      Delete
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
