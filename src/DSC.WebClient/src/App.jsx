import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import {
  Button,
  ButtonGroup,
  Footer,
  Header
} from '@bcgov/design-system-react-components'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'

const Home = React.lazy(() => import('./pages/Home'))
const Activity = React.lazy(() => import('./pages/Activity'))
const Project = React.lazy(() => import('./pages/Project'))
const Administrator = React.lazy(() => import('./pages/Administrator'))
const AdminUsers = React.lazy(() => import('./pages/AdminUsers'))
const AdminRoles = React.lazy(() => import('./pages/AdminRoles'))
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

function AppContent() {
  const { user, isAdmin, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <Header
        title="DSC Modernization"
        skipLinks={[<a key="main" href="#main-content">Skip to main content</a>]}
      />
      <div className="app-nav">
        <ButtonGroup ariaLabel="Primary navigation" alignment="start">
          <NavButton to="/">Home</NavButton>
          {isAuthenticated() && (
            <>
              <NavButton to="/activity">Activity</NavButton>
              <NavButton to="/projects">Projects</NavButton>
            </>
          )}
          {isAuthenticated() && isAdmin() && (
            <NavButton to="/admin">Admin</NavButton>
          )}
          {!isAuthenticated() ? (
            <NavButton to="/login">Login</NavButton>
          ) : (
            <Button variant="link" size="small" onPress={handleLogout}>
              Logout ({user?.username})
            </Button>
          )}
        </ButtonGroup>
      </div>
      <main id="main-content" className="app-main">
        <React.Suspense fallback={<div className="section">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/activity" element={
              <ProtectedRoute>
                <Activity />
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <Project />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute>
                <Administrator />
              </AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            } />
            <Route path="/admin/roles" element={
              <AdminRoute>
                <AdminRoles />
              </AdminRoute>
            } />
            <Route path="/admin/positions" element={
              <AdminRoute>
                <AdminPositions />
              </AdminRoute>
            } />
            <Route path="/admin/departments" element={
              <AdminRoute>
                <AdminDepartments />
              </AdminRoute>
            } />
            <Route path="/admin/projects" element={
              <AdminRoute>
                <AdminProjects />
              </AdminRoute>
            } />
            <Route path="/admin/expense" element={
              <AdminRoute>
                <AdminExpense />
              </AdminRoute>
            } />
            <Route path="/admin/activity-options" element={
              <AdminRoute>
                <AdminActivityOptions />
              </AdminRoute>
            } />
          </Routes>
        </React.Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
