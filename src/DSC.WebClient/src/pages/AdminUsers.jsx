import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div>
      <h1>Admin Users</h1>
      <p>Legacy servlet: AdminUsers. This page will manage user accounts, roles, and assignments.</p>
      <p><Link to="/admin">Back to Administrator</Link></p>

      <section>
        <h2>Add New User</h2>
        <form onSubmit={handleAddUser}>
          <div>
            <label>
              Employee ID
              <input
                type="text"
                name="empId"
                placeholder="#####"
                value={addForm.empId}
                onChange={e => updateAddForm('empId', e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              First Name
              <input
                type="text"
                name="firstName"
                value={addForm.firstName}
                onChange={e => updateAddForm('firstName', e.target.value)}
              />
            </label>
            <label>
              Last Name
              <input
                type="text"
                name="lastName"
                value={addForm.lastName}
                onChange={e => updateAddForm('lastName', e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={addForm.email}
                onChange={e => updateAddForm('email', e.target.value)}
                required
              />
            </label>
          </div>
          <div>
            <label>
              NCS Date
              <input
                type="date"
                name="ncsDate"
                value={addForm.ncsDate}
                onChange={e => updateAddForm('ncsDate', e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Position
              <select name="position">
                <option value="">Select position</option>
              </select>
            </label>
            <label>
              Position Start Date
              <input
                type="date"
                name="positionStartDate"
                value={addForm.positionStartDate}
                onChange={e => updateAddForm('positionStartDate', e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Department
              <select name="department">
                <option value="">Select department</option>
              </select>
            </label>
            <label>
              Department Start Date
              <input
                type="date"
                name="departmentStartDate"
                value={addForm.departmentStartDate}
                onChange={e => updateAddForm('departmentStartDate', e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              LAN ID
              <input
                type="text"
                name="lanId"
                value={addForm.lanId}
                onChange={e => updateAddForm('lanId', e.target.value)}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                name="password"
                value={addForm.password}
                onChange={e => updateAddForm('password', e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              DSC Role
              <select name="role">
                <option value="1">Employee</option>
                <option value="2">Manager</option>
                <option value="-1">Administrator</option>
              </select>
            </label>
            <small>Role/assignment fields are not persisted yet.</small>
          </div>
          <button type="submit">Add User</button>
        </form>
      </section>

      <section>
        <h2>Edit Current User</h2>
        <form onSubmit={handleUpdateUser}>
          <div>
            <label>
              Select User
              <select
                name="user"
                value={selectedUserId}
                onChange={e => handleSelectUser(e.target.value)}
              >
                <option value="">Select user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.lastName}, {user.firstName} ({user.username})
                  </option>
                ))}
              </select>
            </label>
            <button type="button" onClick={() => handleSelectUser(selectedUserId)}>Load User</button>
          </div>
          <div>
            <label>
              First Name
              <input
                type="text"
                name="editFirstName"
                value={editForm.firstName}
                onChange={e => updateEditForm('firstName', e.target.value)}
              />
            </label>
            <label>
              Last Name
              <input
                type="text"
                name="editLastName"
                value={editForm.lastName}
                onChange={e => updateEditForm('lastName', e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Email
              <input
                type="email"
                name="editEmail"
                value={editForm.email}
                onChange={e => updateEditForm('email', e.target.value)}
                required
              />
            </label>
          </div>
          <div>
            <label>
              NCS Date
              <input
                type="date"
                name="editNcsDate"
                value={editForm.ncsDate}
                onChange={e => updateEditForm('ncsDate', e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Position
              <select name="editPosition">
                <option value="">Select position</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              Position Start Date
              <input
                type="date"
                name="editPositionStartDate"
                value={editForm.positionStartDate}
                onChange={e => updateEditForm('positionStartDate', e.target.value)}
              />
            </label>
            <label>
              Position End Date
              <input
                type="date"
                name="editPositionEndDate"
                value={editForm.positionEndDate}
                onChange={e => updateEditForm('positionEndDate', e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Department
              <select name="editDepartment">
                <option value="">Select department</option>
              </select>
            </label>
          </div>
          <div>
            <label>
              Department Start Date
              <input
                type="date"
                name="editDepartmentStartDate"
                value={editForm.departmentStartDate}
                onChange={e => updateEditForm('departmentStartDate', e.target.value)}
              />
            </label>
            <label>
              Department End Date
              <input
                type="date"
                name="editDepartmentEndDate"
                value={editForm.departmentEndDate}
                onChange={e => updateEditForm('departmentEndDate', e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              LAN ID
              <input
                type="text"
                name="editLanId"
                value={editForm.lanId}
                onChange={e => updateEditForm('lanId', e.target.value)}
                disabled
              />
            </label>
            <label>
              Password
              <input
                type="password"
                name="editPassword"
                value={editForm.password}
                onChange={e => updateEditForm('password', e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              DSC Role
              <select name="editRole">
                <option value="1">Employee</option>
                <option value="2">Manager</option>
                <option value="-1">Administrator</option>
              </select>
            </label>
            <small>Role/assignment fields are not persisted yet.</small>
          </div>
          <div>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={handleDeleteUser}>Delete User</button>
          </div>
        </form>
      </section>
      <section>
        <h2>Current Users</h2>
        <table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.empId ?? '-'}</td>
                <td>{user.lastName}, {user.firstName}</td>
                <td>{user.username}</td>
                <td>Unassigned</td>
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
