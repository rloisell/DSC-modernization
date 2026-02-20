import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import {
  Button,
  ButtonGroup,
  Footer,
  Header
} from '@bcgov/design-system-react-components'
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

function NavButton({ to, children }) {
  const navigate = useNavigate()
  return (
    <Button variant="link" size="small" onPress={() => navigate(to)}>
      {children}
    </Button>
  )
}

export default function App() {
  return (
    <div className="app-shell">
      <Header
        title="DSC Modernization"
        skipLinks={[<a key="main" href="#main-content">Skip to main content</a>]}
      />
      <div className="app-nav">
        <ButtonGroup ariaLabel="Primary navigation" alignment="start">
          <NavButton to="/">Home</NavButton>
          <NavButton to="/activity">Activity</NavButton>
          <NavButton to="/projects">Projects</NavButton>
          <NavButton to="/admin">Admin</NavButton>
          <NavButton to="/login">Login</NavButton>
        </ButtonGroup>
      </div>
      <main id="main-content" className="app-main">
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
      <Footer />
    </div>
  )
}
