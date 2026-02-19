import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Activity from './pages/Activity'
import Project from './pages/Project'
import Administrator from './pages/Administrator'
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
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  )
}
