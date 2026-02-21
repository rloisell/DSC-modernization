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
  deleteAdminUser,
  deactivateAdminUser,
  activateAdminUser
} from '../api/AdminUserService';
import { AdminCatalogService } from '../api/AdminCatalogService';
import SubTabs from '../components/SubTabs';

export default function AdminUsers() {
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
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
    role: ''
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
    role: ''
  });
  const navigate = useNavigate();
  const [subTab, setSubTab] = useState('current');

  const userItems = users.map(user => {
    const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    return {
      id: user.id,
      label: name || user.username || user.email || user.id,
      description: user.email || undefined
    };
  });

  const positionItems = positions.map(p => ({
    id: p.id,
    label: p.title
  }));

  const departmentItems = departments.map(d => ({
    id: d.id,
    label: d.name
  }));

  const roleItems = roles.map(r => ({
    id: r.id,
    label: r.name
  }));

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, posData, deptData, roleData] = await Promise.all([
          getAdminUsers(),
          AdminCatalogService.getPositions(),
          AdminCatalogService.getDepartments(),
          AdminCatalogService.getRoles()
        ]);
        setUsers(usersData);
        setPositions(posData);
        setDepartments(deptData);
        setRoles(roleData);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
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
        role: ''
      });
      return;
    }

    setEditForm(prev => ({
      ...prev,
      empId: selected.empId ?? '',
      firstName: selected.firstName ?? '',
      lastName: selected.lastName ?? '',
      email: selected.email ?? '',
      lanId: selected.username ?? '',
      role: selected.roleId ?? '',
      position: selected.positionId ?? '',
      department: selected.departmentId ?? ''
    }));
    setSubTab('edit');
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
        password: addForm.password || null,
        roleId: addForm.role || null,
        positionId: addForm.position || null,
        departmentId: addForm.department || null
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
        role: ''
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
        password: editForm.password || null,
        roleId: editForm.role || null,
        positionId: editForm.position || null,
        departmentId: editForm.department || null
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

  async function handleDeactivateUser(user) {
    setMessage('');
    setError(null);
    try {
      await deactivateAdminUser(user.id);
      const refreshed = await getAdminUsers();
      setUsers(refreshed);
      setMessage(`${user.firstName || user.username} deactivated.`);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleActivateUser(user) {
    setMessage('');
    setError(null);
    try {
      await activateAdminUser(user.id);
      const refreshed = await getAdminUsers();
      setUsers(refreshed);
      setMessage(`${user.firstName || user.username} reactivated.`);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="page">
      <SubTabs
        tabs={[
          { id: 'current', label: 'Current Users' },
          { id: 'add', label: 'Add User' },
          ...(selectedUserId ? [{ id: 'edit', label: 'Edit User' }] : []),
        ]}
        activeTab={subTab}
        onTabChange={(tab) => { if (tab !== 'edit') setSelectedUserId(''); setSubTab(tab); }}
      />
      {subTab === 'add' && (
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
            <Select label="Position" placeholder="Select position" items={positionItems} selectedKey={addForm.position || null} onSelectionChange={key => updateAddForm('position', key ? String(key) : '')} />
            <TextField
              label="Position Start Date"
              type="date"
              value={addForm.positionStartDate}
              onChange={value => updateAddForm('positionStartDate', value)}
            />
          </div>
          <div className="form-columns">
            <Select label="Department" placeholder="Select department" items={departmentItems} selectedKey={addForm.department || null} onSelectionChange={key => updateAddForm('department', key ? String(key) : '')} />
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
      )}
      {subTab === 'edit' && (
      <section className="section stack">
        <Heading level={2}>Edit User</Heading>
        <Text elementType="p">Select a user from the dropdown below or click Edit in the table.</Text>
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
            <Select label="Position" placeholder="Select position" items={positionItems} selectedKey={editForm.position || null} onSelectionChange={key => updateEditForm('position', key ? String(key) : '')} />
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
            <Select label="Department" placeholder="Select department" items={departmentItems} selectedKey={editForm.department || null} onSelectionChange={key => updateEditForm('department', key ? String(key) : '')} />
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
            {selectedUserId && (() => {
              const selectedUser = users.find(u => u.id === selectedUserId);
              return selectedUser?.isActive
                ? <Button type="button" variant="tertiary" onPress={() => handleDeactivateUser(selectedUser)}>Deactivate User</Button>
                : <Button type="button" variant="tertiary" onPress={() => handleActivateUser(selectedUser)}>Activate User</Button>;
            })()}
            <Button type="button" variant="tertiary" onPress={handleDeleteUser}>Delete User</Button>
          </ButtonGroup>
        </Form>
      </section>
      )}
      {subTab === 'current' && (
      <section className="section stack">
        <Heading level={2}>Current Users</Heading>
        {loading ? <Text elementType="p">Loading...</Text> : null}
        {users.length > 0 ? (
          <table className="bcds-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>LAN ID</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const role = roles.find(r => r.id === user.roleId);
                const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || '—';
                
                return (
                  <tr 
                    key={user.id}
                    style={{ 
                      backgroundColor: selectedUserId === user.id ? '#f0f9ff' : 'transparent' 
                    }}
                  >
                    <td>{user.empId ?? '—'}</td>
                    <td><strong>{fullName}</strong></td>
                    <td>{user.email || '—'}</td>
                    <td>{user.username || '—'}</td>
                    <td>{role?.name || '—'}</td>
                    <td>
                      <span style={{ color: user.isActive ? '#1a7f37' : '#b91c1c', fontWeight: 500, fontSize: '0.85em' }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <ButtonGroup ariaLabel="User actions">
                        <Button size="small" variant="secondary" onPress={() => handleSelectUser(user.id)}>Edit</Button>
                        {user.isActive
                          ? <Button size="small" variant="tertiary" onPress={() => handleDeactivateUser(user)}>Deactivate</Button>
                          : <Button size="small" variant="tertiary" onPress={() => handleActivateUser(user)}>Activate</Button>
                        }
                      </ButtonGroup>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : !loading ? (
          <Text elementType="p" className="muted">No users found.</Text>
        ) : null}
      </section>
      )}
      {error ? <InlineAlert variant="danger" title="Error" description={error} /> : null}
      {message ? <InlineAlert variant="success" title="Success" description={message} /> : null}
    </div>
  );
}
