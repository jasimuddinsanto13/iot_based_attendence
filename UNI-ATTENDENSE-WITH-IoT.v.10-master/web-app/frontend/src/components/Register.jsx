import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Paper, TextField, Button, Box, Typography, Alert, CircularProgress
} from '@mui/material'
import api from '../api.jsx'

const roleLabels = {
  admin: 'Admin',
  faculty: 'Faculty',
  student: 'Student'
}

function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState('student')
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    student_number: '',
    department: '',
    semester: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value })
  }

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setError('')
    setSuccess('')
    setStep(2)
  }

  const handleBack = () => {
    setStep(1)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.username || !form.email || !form.password || !form.confirmPassword || !form.full_name) {
      setError('Please complete all required fields.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (selectedRole === 'student' && !form.student_number) {
      setError('Student number is required for student registration.')
      return
    }

    const payload = {
      role: selectedRole,
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      full_name: form.full_name.trim(),
      department: form.department.trim() || undefined,
      semester: form.semester ? Number(form.semester) : undefined,
      student_number: selectedRole === 'student' ? form.student_number.trim() : undefined
    }

    setLoading(true)
    try {
      await api.post('/auth/register', payload)
      setSuccess('Registration submitted. Please wait for admin approval.')
      setTimeout(() => {
        navigate('/', { state: { successMessage: 'Registration request submitted. Awaiting admin approval.' } })
      }, 1200)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#eef4ff' }}>
      <Box
        sx={{
          flex: 1,
          bgcolor: '#1e40af',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4
        }}
      >
        <Typography variant="h3" sx={{ color: '#fff', textAlign: 'center', maxWidth: 460 }}>
          Create your account and join the attendance tracking system.
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4
        }}
      >
        <Paper elevation={12} sx={{ width: '100%', maxWidth: 520, p: 5, borderRadius: 3 }}>
          <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
            {step === 1 ? 'Register as:' : `Register as ${roleLabels[selectedRole]}`}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {step === 1 ? (
            <Box sx={{ display: 'grid', gap: 2 }}>
              {Object.entries(roleLabels).map(([role, label]) => (
                <Button
                  key={role}
                  variant="contained"
                  color="primary"
                  sx={{ py: 1.8, textTransform: 'none' }}
                  onClick={() => handleRoleSelect(role)}
                >
                  Register as {label}
                </Button>
              ))}

              <Button variant="text" onClick={() => navigate('/')}>
                Back to login
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={form.full_name}
                onChange={handleChange('full_name')}
                disabled={loading}
                required
              />

              <TextField
                fullWidth
                label="Username"
                value={form.username}
                onChange={handleChange('username')}
                disabled={loading}
                required
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                disabled={loading}
                required
              />

              {selectedRole === 'student' && (
                <TextField
                  fullWidth
                  label="Student Number"
                  value={form.student_number}
                  onChange={handleChange('student_number')}
                  disabled={loading}
                  required
                />
              )}

              {selectedRole === 'student' && (
                <TextField
                  fullWidth
                  label="Department"
                  value={form.department}
                  onChange={handleChange('department')}
                  disabled={loading}
                  helperText="Optional"
                />
              )}

              {selectedRole === 'student' && (
                <TextField
                  fullWidth
                  label="Semester"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={form.semester}
                  onChange={handleChange('semester')}
                  disabled={loading}
                  helperText="Optional"
                />
              )}

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                disabled={loading}
                required
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                disabled={loading}
                required
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                {loading ? <CircularProgress size={22} /> : 'Submit Registration'}
              </Button>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Button variant="outlined" onClick={handleBack} disabled={loading}>
                  Choose another role
                </Button>
                <Button variant="text" onClick={() => navigate('/')} disabled={loading}>
                  Back to login
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  )
}

export default Register
