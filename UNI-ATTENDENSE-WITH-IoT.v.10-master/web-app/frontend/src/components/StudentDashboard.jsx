import React, { useState, useEffect } from 'react'
import {
  Avatar, Box, Card, CardContent, Typography, Grid, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, Paper, LinearProgress, CircularProgress, IconButton, Stack, Tooltip
} from '@mui/material'
import { Doughnut, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend
} from 'chart.js'
import api from '../api.jsx'
import { useAuthStore } from '../store.jsx'

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend)

function StudentDashboard() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [roster, setRoster] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [simMessage, setSimMessage] = useState('')
  const [scanLoading, setScanLoading] = useState(false)
  const [enrollment, setEnrollment] = useState(null)
  const [threshold, setThreshold] = useState(75)
  const user = useAuthStore((state) => state.user)

  const COURSE_ROOM_MAP = {
    crs_001: 'ESP32_CLASSROOM_101',
    crs_002: 'ESP32_CLASSROOM_102',
    crs_003: 'ESP32_CLASSROOM_103'
  }

  const getClassroomId = () => COURSE_ROOM_MAP[selectedCourse?.id] || 'ESP32_CLASSROOM_101'

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    setLoading(true)
    try {
      if (user?.user_id) {
        // Load enrollment status — don't block on failure
        try {
          const enrollRes = await api.get(`/enrollment/status/${user.user_id}`)
          setEnrollment(enrollRes.data)
        } catch {
          setEnrollment({ fp_enrolled: false })
        }

        // Load attendance history
        try {
          const attRes = await api.get(`/attendance/student/${user.user_id}`)
          setAttendance(attRes.data || [])
        } catch {
          setAttendance([])
        }

        // Load enrolled students roster for simulation buttons
        try {
          const rosterRes = await api.get('/students/enrolled')
          setRoster(rosterRes.data || [])
        } catch {
          setRoster([])
        }
      }

      // Load threshold setting
      try {
        const settingsRes = await api.get('/settings/threshold')
        setThreshold(settingsRes.data?.threshold || 75)
      } catch {
        setThreshold(75)
      }

      setCourses([
        { id: 'crs_001', name: 'Software Engineering', present: 22, total: 30, pct: 73.3 },
        { id: 'crs_002', name: 'Database Design', present: 25, total: 30, pct: 83.3 },
        { id: 'crs_003', name: 'Artificial Intelligence', present: 18, total: 25, pct: 72 }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleStudentSelect = async (student) => {
    setSelectedStudent(student)
    setSimMessage(`This is ${student.full_name}.`)

    if (!enrollment?.student_id) {
      setSimMessage(`This is ${student.full_name}. Waiting for your enrollment identity.`)
      return
    }

    if (student.student_id !== enrollment.student_id) {
      setSimMessage(`This is ${student.full_name}. You can only mark attendance for yourself.`)
      return
    }

    setScanLoading(true)
    try {
      const classroom_id = getClassroomId()
      const payload = {
        student_id: student.student_id,
        classroom_id,
        timestamp: new Date().toISOString(),
        device_id: 'FP_SIM',
        status: 'present',
        match_score: 95
      }

      await api.post('/attendance/fingerprint', payload)
      setSimMessage(`Attendance recorded for ${student.full_name}.`)
      setAttendance((prev) => [{
        timestamp: payload.timestamp,
        classroom_id: payload.classroom_id,
        status: payload.status
      }, ...prev].slice(0, 50))
    } catch (err) {
      setSimMessage(err.response?.data?.detail || 'Attendance recording failed.')
    } finally {
      setScanLoading(false)
    }
  }

  if (loading) return <CircularProgress />

  const overallPct = courses.length > 0
    ? Math.round(courses.reduce((sum, c) => sum + c.pct, 0) / courses.length)
    : 0

  const belowThreshold = courses.filter(c => c.pct < threshold)

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Student Dashboard</Typography>

      {/* Welcome Card */}
      <Card sx={{ mb: 3, backgroundColor: '#f5f5f5' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <Typography variant="h6">{user?.username}</Typography>
              <Typography variant="body2" color="textSecondary">Student ID: {user?.user_id}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Chip
                label={enrollment?.fp_enrolled ? '✓ Fingerprint Enrolled' : '✗ Not Enrolled'}
                color={enrollment?.fp_enrolled ? 'success' : 'error'}
                size="medium"
              />
            </Grid>
          </Grid>
          {!enrollment?.fp_enrolled && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Please visit the Admin Office to register your fingerprint.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Fingerprint Attendance Simulation</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Click your own round button below to identify yourself. If your selected student matches the logged-in account, attendance will be passed to the backend.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {roster.length > 0 ? roster.map((student) => {
              const initials = student.full_name.split(' ').map((part) => part[0]).join('').slice(0, 2)
              const selected = selectedStudent?.student_id === student.student_id
              return (
                <Box key={student.student_id} sx={{ textAlign: 'center', width: 90 }}>
                  <Tooltip title={student.full_name}>
                    <IconButton
                      onClick={() => handleStudentSelect(student)}
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        border: selected ? '2px solid #1976d2' : '1px solid #ddd',
                        bgcolor: selected ? '#e3f2fd' : '#fafafa'
                      }}
                      disabled={scanLoading && selected}
                    >
                      <Avatar sx={{ bgcolor: selected ? '#1976d2' : '#9e9e9e', width: 44, height: 44 }}>
                        {initials}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, wordBreak: 'break-word' }}>
                    {student.full_name}
                  </Typography>
                </Box>
              )
            }) : (
              <Typography>No enrolled students found for simulation.</Typography>
            )}
          </Box>
          <Typography variant="body2" sx={{ mt: 2, minHeight: 24 }}>{simMessage}</Typography>
          {scanLoading && <Typography variant="body2">Recording attendance...</Typography>}
        </CardContent>
      </Card>

      {belowThreshold.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          ⚠ You are below required attendance ({threshold}%) in: {belowThreshold.map(c => c.name).join(', ')}
        </Alert>
      )}

      {/* Attendance Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Attendance Summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ height: 300 }}>
                <Doughnut
                  data={{
                    labels: ['Present', 'Absent'],
                    datasets: [{ data: [overallPct, 100 - overallPct], backgroundColor: ['#4caf50', '#f44336'] }]
                  }}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
                />
              </Box>
              <Typography variant="h6" sx={{ textAlign: 'center', mt: 1 }}>{overallPct}% Overall</Typography>
            </Grid>
            <Grid item xs={12} md={8}>
              {courses.map(course => (
                <Box key={course.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2"><strong>{course.name}</strong></Typography>
                    <Typography variant="body2">{course.present}/{course.total} ({course.pct}%)</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={course.pct}
                    sx={{
                      height: 8, borderRadius: 4, backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: course.pct >= threshold ? '#4caf50' : course.pct >= 60 ? '#ff9800' : '#f44336'
                      }
                    }}
                  />
                </Box>
              ))}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Attendance History</Typography>
            <Button size="small" variant="outlined" onClick={loadData}>Refresh</Button>
          </Box>
          <Box sx={{ mb: 2 }}>
            <strong>Select Course: </strong>
            <select
              value={selectedCourse?.id || ''}
              onChange={(e) => setSelectedCourse(courses.find(c => c.id === e.target.value) || null)}
              style={{ marginLeft: 10, padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
            >
              <option value="">-- All Courses --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Box>

          <Box sx={{ height: 250, mb: 3 }}>
            <Line
              data={{
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                  label: 'Cumulative Attendance %',
                  data: [100, 90, 85, selectedCourse ? 75 : 78],
                  borderColor: '#1976d2', backgroundColor: 'rgba(25,118,210,0.1)', fill: true, tension: 0.4
                }]
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </Box>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Date</TableCell>
                  <TableCell>Classroom</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.length > 0
                  ? attendance.slice(0, 10).map((rec, i) => (
                    <TableRow key={i}>
                      <TableCell>{new Date(rec.timestamp).toLocaleDateString()}</TableCell>
                      <TableCell>{rec.classroom_id}</TableCell>
                      <TableCell>
                        <Chip label={rec.status || 'Present'} color="success" size="small" />
                      </TableCell>
                    </TableRow>
                  ))
                  : [
                    { date: '2026-04-10', room: '101', status: 'Present' },
                    { date: '2026-04-09', room: '102', status: 'Present' },
                    { date: '2026-04-07', room: '101', status: 'Present' },
                  ].map(rec => (
                    <TableRow key={rec.date}>
                      <TableCell>{rec.date}</TableCell>
                      <TableCell>{rec.room}</TableCell>
                      <TableCell><Chip label={rec.status} color="success" size="small" /></TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Upcoming Schedule */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Upcoming Schedule (Next 7 Days)</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Day</TableCell><TableCell>Time</TableCell>
                  <TableCell>Course</TableCell><TableCell>Classroom</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { day: 'Mon', time: '09:00-10:30', course: 'Software Engineering', room: '101' },
                  { day: 'Tue', time: '14:00-15:30', course: 'Artificial Intelligence', room: '103' },
                  { day: 'Wed', time: '09:00-10:30', course: 'Software Engineering', room: '101' },
                  { day: 'Wed', time: '11:00-12:30', course: 'Database Design', room: '102' },
                  { day: 'Fri', time: '09:00-10:30', course: 'Software Engineering', room: '101' },
                ].map((s, i) => (
                  <TableRow key={i}>
                    <TableCell>{s.day}</TableCell><TableCell>{s.time}</TableCell>
                    <TableCell>{s.course}</TableCell><TableCell>{s.room}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}

export default StudentDashboard
