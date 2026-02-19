import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AdminUsers() {
  const [message, setMessage] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setMessage('Admin user actions are not wired to the API yet.');
  }

  return (
    <div>
      <h1>Admin Users</h1>
      <p>Legacy servlet: AdminUsers. This page will manage user accounts, roles, and assignments.</p>
      <p><Link to="/admin">Back to Administrator</Link></p>

      <section>
        <h2>Add New User</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Employee ID
              <input type="text" name="empId" placeholder="#####" />
            </label>
          </div>
          <div>
            <label>
              First Name
              <input type="text" name="firstName" />
            </label>
            <label>
              Last Name
              <input type="text" name="lastName" />
            </label>
          </div>
          <div>
            <label>
              Email
              <input type="email" name="email" />
            </label>
          </div>
          <div>
            <label>
              NCS Date
              <input type="date" name="ncsDate" />
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
              <input type="date" name="positionStartDate" />
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
              <input type="date" name="departmentStartDate" />
            </label>
          </div>
          <div>
            <label>
              LAN ID
              <input type="text" name="lanId" />
            </label>
            <label>
              Password
              <input type="password" name="password" />
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
          </div>
          <button type="submit">Add User</button>
        </form>
      </section>

      <section>
        <h2>Edit Current User</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Select User
              <select name="user">
                <option value="">Select user</option>
              </select>
            </label>
            <button type="submit">Load User</button>
          </div>
          <div>
            <label>
              First Name
              <input type="text" name="editFirstName" />
            </label>
            <label>
              Last Name
              <input type="text" name="editLastName" />
            </label>
          </div>
          <div>
            <label>
              Email
              <input type="email" name="editEmail" />
            </label>
          </div>
          <div>
            <label>
              NCS Date
              <input type="date" name="editNcsDate" />
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
              <input type="date" name="editPositionStartDate" />
            </label>
            <label>
              Position End Date
              <input type="date" name="editPositionEndDate" />
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
              <input type="date" name="editDepartmentStartDate" />
            </label>
            <label>
              Department End Date
              <input type="date" name="editDepartmentEndDate" />
            </label>
          </div>
          <div>
            <label>
              LAN ID
              <input type="text" name="editLanId" />
            </label>
            <label>
              Password
              <input type="password" name="editPassword" />
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
          </div>
          <div>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setMessage('Delete user is not wired to the API yet.')}>Delete User</button>
          </div>
        </form>
      </section>

      {message ? <p>{message}</p> : null}
    </div>
  );
}
