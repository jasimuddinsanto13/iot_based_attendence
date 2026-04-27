import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Paper, TextField, Button, Box, Typography, Alert,
  CircularProgress
} from '@mui/material'
import api from '../api.jsx'
import { useAuthStore } from '../store.jsx'

function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const { login } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage)
    }
  }, [location.state])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await api.post('/auth/login', { username, password })
      const { token, user } = response.data
      
      login(token, user)
      navigate(`/${user.role}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f3f6fb' }}>
      <Box
        sx={{
          flex: 1,
          bgcolor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 220,
            height: 220,
            bgcolor: '#2563eb',
            borderRadius: '50%'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 160,
            height: 160,
            bgcolor: '#93c5fd',
            borderRadius: '50%',
            opacity: 0.6
          }}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          backgroundImage: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4
        }}
      >
        <Paper elevation={12} sx={{ width: '100%', maxWidth: 420, p: 5, borderRadius: 3 }}>
          <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
            Attendance System Login
          </Typography>

          {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              disabled={loading}
              autoFocus
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              disabled={loading}
            />

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, py: 1.5 }}
              disabled={loading || !username || !password}
              onClick={handleSubmit}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>

          <Button
            fullWidth
            variant="outlined"
            color="primary"
            sx={{ mt: 2, textTransform: 'none' }}
            onClick={() => navigate('/register')}
            type="button"
          >
            Don't have an account? Register
          </Button>

          <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
            Demo Credentials:
            <br />Admin: admin / admin123
            <br />Faculty: faculty1 / pass123
            <br />Student: student01 / pass123
          </Typography>
        </Paper>
      </Box>
    </Box>
  )
}

export default Login
