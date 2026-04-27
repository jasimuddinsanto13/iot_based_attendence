import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { Box, AppBar, Toolbar, Typography, Button, Chip, Container } from '@mui/material'
import { useAuthStore } from './store.jsx'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import AdminStudentDetail from './components/AdminStudentDetail.jsx'
import FacultyDashboard from './components/FacultyDashboard.jsx'
import StudentDashboard from './components/StudentDashboard.jsx'
import FingerprintAttendance from './components/FingerprintAttendance.jsx'

function NavBar() {
  const { user, logout } = useAuthStore()
  
  if (!user) return null
  
  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flex: 1 }}>
          📚 Attendance Tracking System
        </Typography>
        <Typography variant="body2" sx={{ mr: 2 }}>
          {user.username}
        </Typography>
        <Chip
          label={user.role.toUpperCase()}
          color="primary"
          variant="outlined"
          size="small"
          sx={{ mr: 2 }}
        />
        <Button color="inherit" component={Link} to="/attendance-scan" sx={{ mr: 2 }}>
          Attendance
        </Button>
        <Button
          color="inherit"
          onClick={() => {
            logout()
            window.location.href = '/'
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  )
}

function ProtectedRoute({ children, requiredRole }) {
  const { token, user } = useAuthStore()
  
  if (!token || !user) {
    return <Navigate to="/" replace />
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function App() {
  const { token, initializeFromStorage } = useAuthStore()
  
  useEffect(() => {
    initializeFromStorage()
  }, [])
  
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={!token ? <Login /> : <Navigate to={`/${useAuthStore.getState().user?.role}`} replace />} />
        <Route path="/register" element={!token ? <Register /> : <Navigate to={`/${useAuthStore.getState().user?.role}`} replace />} />

        <Route
          path="/admin"
          element={
            <Container maxWidth="lg">
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            </Container>
          }
        />

        <Route
          path="/admin/student/:studentId"
          element={
            <Container maxWidth="lg">
              <ProtectedRoute requiredRole="admin">
                <AdminStudentDetail />
              </ProtectedRoute>
            </Container>
          }
        />

        <Route
          path="/faculty"
          element={
            <Container maxWidth="lg">
              <ProtectedRoute requiredRole="faculty">
                <FacultyDashboard />
              </ProtectedRoute>
            </Container>
          }
        />

        <Route
          path="/student"
          element={
            <Container maxWidth="lg">
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            </Container>
          }
        />

        <Route
          path="/attendance-scan"
          element={
            <Container maxWidth="lg">
              <ProtectedRoute>
                <FingerprintAttendance />
              </ProtectedRoute>
            </Container>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
