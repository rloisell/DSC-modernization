import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Activity from './pages/Activity'
import Project from './pages/Project'
import Administrator from './pages/Administrator'
import AdminUsers from './pages/AdminUsers'
import AdminPositions from './pages/AdminPositions'
import AdminDepartments from './pages/AdminDepartments'
import AdminProjects from './pages/AdminProjects'
import AdminExpense from './pages/AdminExpense'
import AdminActivityOptions from './pages/AdminActivityOptions'
import Login from './pages/Login'

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/activity">Activity</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/admin">Admin</Link>
        <Link to="/login">Login</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/projects" element={<Project />} />
          <Route path="/admin" element={<Administrator />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/positions" element={<AdminPositions />} />
          <Route path="/admin/departments" element={<AdminDepartments />} />
          <Route path="/admin/projects" element={<AdminProjects />} />
          <Route path="/admin/expense" element={<AdminExpense />} />
          <Route path="/admin/activity-options" element={<AdminActivityOptions />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  )
}
