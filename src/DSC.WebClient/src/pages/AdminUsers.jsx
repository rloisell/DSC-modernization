import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  ButtonGroup,
  Form,
  Heading,
  InlineAlert,
  NumberField,
  Select,
  Text,
  TextField
} from '@bcgov/design-system-react-components';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser
} from '../api/AdminUserService';

export default function AdminUsers() {
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [addForm, setAddForm] = useState({
    empId: '',
    firstName: '',
    lastName: '',
    email: '',
    ncsDate: '',
    position: '',
    positionStartDate: '',
    department: '',
    departmentStartDate: '',
    lanId: '',
    password: '',
    role: '1'
  });
  const [editForm, setEditForm] = useState({
    empId: '',
    firstName: '',
    lastName: '',
    email: '',
    ncsDate: '',
    position: '',
    positionStartDate: '',
    positionEndDate: '',
    department: '',
    departmentStartDate: '',
    departmentEndDate: '',
    lanId: '',
    password: '',
    role: '1'
  });
  const navigate = useNavigate();

  const userItems = users.map(user => {
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return {
      id: user.id,
      label: name || user.username || user.email || user.id,
      description: user.email || undefined
    };
  });

  const roleItems = [
    { id: '1', label: 'Role 1' },
    { id: '2', label: 'Role 2' }
  ];

  useEffect(() => {
    getAdminUsers()
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function updateAddForm(field, value) {
    setAddForm(prev => ({ ...prev, [field]: value }));
  }

  function updateEditForm(field, value) {
    setEditForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSelectUser(value) {
    setSelectedUserId(value);
    const selected = users.find(u => u.id === value);
    if (!selected) {
      setEditForm({
        empId: '',
        firstName: '',
        lastName: '',
        email: '',
        ncsDate: '',
        position: '',
        positionStartDate: '',
        positionEndDate: '',
        department: '',
        departmentStartDate: '',
        departmentEndDate: '',
        lanId: '',
        password: '',
        role: '1'
      });
      return;
    }

    setEditForm(prev => ({
      ...prev,
      empId: selected.empId ?? '',
      firstName: selected.firstName ?? '',
      lastName: selected.lastName ?? '',
      email: selected.email ?? '',
      lanId: selected.username ?? ''
    }));
  }

  async function handleAddUser(e) {
    e.preventDefault();
    setMessage('');
    setError(null);

    try {
      const payload = {
        empId: addForm.empId ? Number(addForm.empId) : null,
        username: addForm.lanId,
        email: addForm.email,
        firstName: addForm.firstName,
        lastName: addForm.lastName,
        password: addForm.password || null
      };
      await createAdminUser(payload);
      const refreshed = await getAdminUsers();
      setUsers(refreshed);
      setAddForm({
        empId: '',
        firstName: '',
        lastName: '',
        email: '',
        ncsDate: '',
        position: '',
        positionStartDate: '',
        department: '',
        departmentStartDate: '',
        lanId: '',
        password: '',
        role: '1'
      });
      setMessage('User created.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleUpdateUser(e) {
    e.preventDefault();
    setMessage('');
    setError(null);
    if (!selectedUserId) {
      setError('Select a user to edit.');
      return;
    }

    try {
      const payload = {
        empId: editForm.empId ? Number(editForm.empId) : null,
        email: editForm.email,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        password: editForm.password || null
      };
      await updateAdminUser(selectedUserId, payload);
      const refreshed = await getAdminUsers();
      setUsers(refreshed);
      setMessage('User updated.');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDeleteUser() {
    setMessage('');
    setError(null);
    if (!selectedUserId) {
      setError('Select a user to delete.');
      return;
    }

    try {
      await deleteAdminUser(selectedUserId);
      const refreshed = await getAdminUsers();
      setUsers(refreshed);
      setSelectedUserId('');
      setMessage('User deleted.');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="page">
      <section className="section stack">
        <Heading level={1}>Admin Users</Heading>
        <Text elementType="p">Legacy servlet: AdminUsers. This page will manage user accounts, roles, and assignments.</Text>
        <div className="page-actions">
          <Button variant="link" onPress={() => navigate('/admin')}>Back to Administrator</Button>
        </div>
      </section>
      <section className="section stack">
        <Heading level={2}>Add New User</Heading>
        <Form onSubmit={handleAddUser} className="form-grid">
          <NumberField
            label="Employee ID"
            value={addForm.empId ? Number(addForm.empId) : undefined}
            onChange={value => updateAddForm('empId', value == null ? '' : String(value))}
            description="Optional"
          />
          <div className="form-columns">
            <TextField label="First Name" value={addForm.firstName} onChange={value => updateAddForm('firstName', value)} />
            <TextField label="Last Name" value={addForm.lastName} onChange={value => updateAddForm('lastName', value)} />
          </div>
          <TextField
            label="Email"
            type="email"
            value={addForm.email}
            onChange={value => updateAddForm('email', value)}
            isRequired
          />
          <TextField
            label="NCS Date"
            type="date"
            value={addForm.ncsDate}
            onChange={value => updateAddForm('ncsDate', value)}
          />
          <div className="form-columns">
            <Select label="Position" placeholder="Select position" items={[]} selectedKey={null} />
            <TextField
              label="Position Start Date"
              type="date"
              value={addForm.positionStartDate}
              onChange={value => updateAddForm('positionStartDate', value)}
            />
          </div>
          <div className="form-columns">
            <Select label="Department" placeholder="Select department" items={[]} selectedKey={null} />
            <TextField
              label="Department Start Date"
              type="date"
              value={addForm.departmentStartDate}
              onChange={value => updateAddForm('departmentStartDate', value)}
            />
          </div>
          <div className="form-columns">
            <TextField label="LAN ID" value={addForm.lanId} onChange={value => updateAddForm('lanId', value)} />
            <TextField
              label="Password"
              type="password"
              value={addForm.password}
              onChange={value => updateAddForm('password', value)}
            />
          </div>
          <Select
            label="Role"
            items={roleItems}
            selectedKey={addForm.role}
            onSelectionChange={key => updateAddForm('role', String(key))}
          />
          <ButtonGroup alignment="start" ariaLabel="Create user actions">
            <Button type="submit" variant="primary">Create User</Button>
          </ButtonGroup>
        </Form>
      </section>
      <section className="section stack">
        <Heading level={2}>Edit User</Heading>
        <Select
          label="Select User"
          placeholder="Select user"
          items={userItems}
          selectedKey={selectedUserId || null}
          onSelectionChange={key => handleSelectUser(key ? String(key) : '')}
        />
        <Form onSubmit={handleUpdateUser} className="form-grid">
          <NumberField
            label="Employee ID"
            value={editForm.empId ? Number(editForm.empId) : undefined}
            onChange={value => updateEditForm('empId', value == null ? '' : String(value))}
            description="Optional"
          />
          <div className="form-columns">
            <TextField label="First Name" value={editForm.firstName} onChange={value => updateEditForm('firstName', value)} />
            <TextField label="Last Name" value={editForm.lastName} onChange={value => updateEditForm('lastName', value)} />
          </div>
          <TextField
            label="Email"
            type="email"
            value={editForm.email}
            onChange={value => updateEditForm('email', value)}
          />
          <TextField
            label="NCS Date"
            type="date"
            value={editForm.ncsDate}
            onChange={value => updateEditForm('ncsDate', value)}
          />
          <div className="form-columns">
            <Select label="Position" placeholder="Select position" items={[]} selectedKey={null} />
            <TextField
              label="Position Start Date"
              type="date"
              value={editForm.positionStartDate}
              onChange={value => updateEditForm('positionStartDate', value)}
            />
            <TextField
              label="Position End Date"
              type="date"
              value={editForm.positionEndDate}
              onChange={value => updateEditForm('positionEndDate', value)}
            />
          </div>
          <div className="form-columns">
            <Select label="Department" placeholder="Select department" items={[]} selectedKey={null} />
            <TextField
              label="Department Start Date"
              type="date"
              value={editForm.departmentStartDate}
              onChange={value => updateEditForm('departmentStartDate', value)}
            />
            <TextField
              label="Department End Date"
              type="date"
              value={editForm.departmentEndDate}
              onChange={value => updateEditForm('departmentEndDate', value)}
            />
          </div>
          <div className="form-columns">
            <TextField label="LAN ID" value={editForm.lanId} onChange={value => updateEditForm('lanId', value)} />
            <TextField
              label="Password"
              type="password"
              value={editForm.password}
              onChange={value => updateEditForm('password', value)}
            />
          </div>
          <Select
            label="Role"
            items={roleItems}
            selectedKey={editForm.role}
            onSelectionChange={key => updateEditForm('role', String(key))}
          />
          <ButtonGroup alignment="start" ariaLabel="Update user actions">
            <Button type="submit" variant="primary">Update User</Button>
            <Button type="button" variant="tertiary" danger onPress={handleDeleteUser}>Delete User</Button>
          </ButtonGroup>
        </Form>
      </section>
      <section className="section stack">
        <Heading level={2}>Current Users</Heading>
        {loading ? <Text elementType="p">Loading...</Text> : null}
        <table className="bcds-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.empId}</td>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {error ? <InlineAlert variant="danger" title="Error" description={error} /> : null}
      {message ? <InlineAlert variant="success" title="Success" description={message} /> : null}
    </div>
  );
}
