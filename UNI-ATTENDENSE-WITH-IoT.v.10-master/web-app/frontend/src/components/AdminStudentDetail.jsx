import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Paper, Typography, Button, Alert, CircularProgress, Grid, Chip
} from '@mui/material'
import api from '../api.jsx'

function AdminStudentDetail() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStudent = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await api.get(`/students/${studentId}`)
        setStudent(response.data)
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load student details')
      } finally {
        setLoading(false)
      }
    }
    loadStudent()
  }, [studentId])

  if (loading) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/admin')}>Back to Students</Button>
      </Box>
    )
  }

  if (!student) {
    return null
  }

  return (
    <Box sx={{ p: 4 }}>
      <Button variant="outlined" onClick={() => navigate('/admin')} sx={{ mb: 3 }}>
        Back to Student Management
      </Button>

      <Paper elevation={12} sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Student Details
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">Full Name</Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>{student.full_name}</Typography>

            <Typography variant="subtitle2" color="textSecondary">Student Number</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{student.student_number}</Typography>

            <Typography variant="subtitle2" color="textSecondary">Student ID</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{student.student_id}</Typography>

            <Typography variant="subtitle2" color="textSecondary">Department</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{student.department || 'N/A'}</Typography>

            <Typography variant="subtitle2" color="textSecondary">Semester</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{student.semester || 'N/A'}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">Account Username</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{student.username}</Typography>

            <Typography variant="subtitle2" color="textSecondary">Email</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{student.email}</Typography>

            <Typography variant="subtitle2" color="textSecondary">Status</Typography>
            <Chip
              label={student.is_active ? 'Active' : 'Inactive'}
              color={student.is_active ? 'success' : 'default'}
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle2" color="textSecondary">Created At</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>{student.created_at}</Typography>

            {!student.is_active && (
              <>
                <Typography variant="subtitle2" color="textSecondary">Deactivated At</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{student.deleted_at || 'Unknown'}</Typography>
              </>
            )}

            {student.restored_at && (
              <>
                <Typography variant="subtitle2" color="textSecondary">Restored At</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{student.restored_at}</Typography>
              </>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  )
}

export default AdminStudentDetail
