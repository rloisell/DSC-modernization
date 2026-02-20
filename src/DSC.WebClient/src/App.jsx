import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import {
  Button,
  ButtonGroup,
  Footer,
  Header
} from '@bcgov/design-system-react-components'

const Home = React.lazy(() => import('./pages/Home'))
const Activity = React.lazy(() => import('./pages/Activity'))
const Project = React.lazy(() => import('./pages/Project'))
const Administrator = React.lazy(() => import('./pages/Administrator'))
const AdminUsers = React.lazy(() => import('./pages/AdminUsers'))
const AdminPositions = React.lazy(() => import('./pages/AdminPositions'))
const AdminDepartments = React.lazy(() => import('./pages/AdminDepartments'))
const AdminProjects = React.lazy(() => import('./pages/AdminProjects'))
const AdminExpense = React.lazy(() => import('./pages/AdminExpense'))
const AdminActivityOptions = React.lazy(() => import('./pages/AdminActivityOptions'))
const Login = React.lazy(() => import('./pages/Login'))

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
        <React.Suspense fallback={<div className="section">Loading...</div>}>
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
        </React.Suspense>
      </main>
      <Footer />
    </div>
  )
}
