import React, { useEffect, useState } from 'react'
import {
  Box, Card, CardContent, Typography, Grid, Button, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Table, TableBody,
  TableCell, TableContainer, TableHead, Paper, Alert, Chip
} from '@mui/material'
import { useAuthStore } from '../store.jsx'
import api from '../api.jsx'

const CLASS_OPTIONS = [
  { id: 'ESP32_CLASSROOM_101', course: 'Software Engineering', room: '101', time: '09:00 - 10:30' },
  { id: 'ESP32_CLASSROOM_102', course: 'Database Design', room: '102', time: '11:00 - 12:30' },
  { id: 'ESP32_CLASSROOM_103', course: 'Artificial Intelligence', room: '103', time: '14:00 - 15:30' }
]

function FingerprintAttendance() {
  const user = useAuthStore((state) => state.user)
  const [selectedClassId, setSelectedClassId] = useState(CLASS_OPTIONS[0].id)
  const [sessionActive, setSessionActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [enrolledStudents, setEnrolledStudents] = useState([])
  const [enrollmentStatus, setEnrollmentStatus] = useState(null)
  const [scanHistory, setScanHistory] = useState([])
  const [scanningId, setScanningId] = useState(null)

  useEffect(() => {
    loadFingerprintData()
  }, [user])

  const loadFingerprintData = async () => {
    setLoading(true)
    setError('')

    try {
      if (!user) return

      const statusRes = await api.get(`/enrollment/status/${user.user_id}`)
      setEnrollmentStatus(statusRes.data)

      if (user.role !== 'student') {
        const enrolledRes = await api.get('/students/enrolled')
        setEnrolledStudents(enrolledRes.data || [])
      }
    } catch (err) {
      setError('Unable to load fingerprint enrollment information. Please refresh.')
    } finally {
      setLoading(false)
    }
  }

  const startSession = () => {
    setSessionActive(true)
    setScanHistory([])
    setSuccess('Attendance session is active. Fingerprint scan is unlimited for development testing.')
    setError('')
  }

  const handleScan = async (student) => {
    if (!sessionActive) {
      setError('Attendance session is closed. Start the session again before class begins.')
      return
    }

    if (!selectedClassId) {
      setError('Please select a classroom before scanning.')
      return
    }

    const resolvedStudentId = user?.role === 'student'
      ? enrollmentStatus?.student_id || student.student_id
      : student.student_id

    if (user?.role === 'student' && !enrollmentStatus?.student_id) {
      setError('Unable to resolve your enrolled student record. Please refresh and try again.')
      return
    }

    setScanningId(resolvedStudentId)
    setError('')
    setSuccess('')

    try {
      const payload = {
        student_id: resolvedStudentId,
        classroom_id: selectedClassId,
        timestamp: new Date().toISOString(),
        device_id: 'FP_SCANNER_01',
        status: 'present',
        match_score: 95
      }

      const res = await api.post('/attendance/fingerprint', payload)
      setScanHistory((prev) => [
        {
          id: student.student_id,
          name: student.full_name,
          time: new Date().toLocaleTimeString(),
          status: 'Present',
          message: res.data?.message || 'Fingerprint matched successfully'
        },
        ...prev
      ].slice(0, 20))
      setSuccess(`Fingerprint attendance recorded for ${student.full_name}.`)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Scan failed. Please try again.')
    } finally {
      setScanningId(null)
    }
  }

  const currentClass = CLASS_OPTIONS.find((item) => item.id === selectedClassId)
  const timeLabel = sessionActive ? 'Ready to scan (no timeout for development)' : 'Session closed'

  if (loading) return <CircularProgress />

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Fingerprint Attendance</Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Open this page before class. Fingerprint scanning is unlimited for development testing, so you can try it as many times as needed.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Classroom Session</Typography>

              <FormControl fullWidth>
                <InputLabel id="classroom-select-label">Classroom</InputLabel>
                <Select
                  labelId="classroom-select-label"
                  value={selectedClassId}
                  label="Classroom"
                  onChange={(e) => setSelectedClassId(e.target.value)}
                >
                  {CLASS_OPTIONS.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {`${option.course} — Room ${option.room} (${option.time})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="body2" sx={{ mt: 2 }}>
                Status: <strong>{timeLabel}</strong>
              </Typography>

              {user?.role !== 'student' && (
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={startSession}
                >
                  Restart Scan Session
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Fingerprint Enrollment</Typography>

              {user?.role === 'student' ? (
                <>
                  <Typography variant="body2">
                    {enrollmentStatus?.fp_enrolled
                      ? 'Your fingerprint is enrolled. Use the button below to scan when the session is open.'
                      : 'Your fingerprint is not enrolled. Please ask your admin to register your fingerprint.'}
                  </Typography>

                  <Chip
                    label={enrollmentStatus?.fp_enrolled ? 'Enrolled' : 'Not Enrolled'}
                    color={enrollmentStatus?.fp_enrolled ? 'success' : 'error'}
                    sx={{ mt: 2 }}
                  />
                </>
              ) : (
                <>
                  <Typography variant="body2">
                    {enrolledStudents.length} active fingerprint enrollment(s) available for the current device.
                  </Typography>
                  <Chip label={`${enrolledStudents.length} enrolled`} color="primary" sx={{ mt: 2 }} />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Live Fingerprint Scan</Typography>
          {user?.role === 'student' ? (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {currentClass ? `Current class: ${currentClass.course} in room ${currentClass.room}` : 'Select a class to scan.'}
              </Typography>
              <Button
                variant="contained"
                disabled={!enrollmentStatus?.fp_enrolled || Boolean(scanningId)}
                onClick={() => handleScan({ student_id: user.user_id, full_name: user.username })}
              >
                {scanningId === user.user_id ? 'Scanning...' : 'Scan Fingerprint'}
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Student</TableCell>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enrolledStudents.length > 0 ? enrolledStudents.map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell>{student.full_name}</TableCell>
                      <TableCell>{student.student_number}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={Boolean(scanningId)}
                          onClick={() => handleScan(student)}
                        >
                          {scanningId === student.student_id ? 'Scanning...' : 'Scan'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="body2">No enrolled students available.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Scan History</Typography>
          {scanHistory.length === 0 ? (
            <Typography variant="body2">No scans recorded yet during this session.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Time</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scanHistory.map((scan, index) => (
                    <TableRow key={`${scan.id}-${index}`}>
                      <TableCell>{scan.time}</TableCell>
                      <TableCell>{scan.name}</TableCell>
                      <TableCell>
                        <Chip label={scan.status} color="success" size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default FingerprintAttendance
