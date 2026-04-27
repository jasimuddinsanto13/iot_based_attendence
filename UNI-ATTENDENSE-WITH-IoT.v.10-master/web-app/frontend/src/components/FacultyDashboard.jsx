import React, { useState, useEffect } from 'react'
import {
  Box, Card, CardContent, Tabs, Tab, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, CircularProgress, Paper, Grid, TextField, Alert
} from '@mui/material'
import { Bar } from 'react-chartjs-2'
import api from '../api.jsx'

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ p: 2 }}>{children}</Box> : null
}

function FacultyDashboard() {
  const [tabIndex, setTabIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseStudents, setCourseStudents] = useState([])
  const [threshold, setThreshold] = useState(75)
  const [thresholdInput, setThresholdInput] = useState('75')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [simStudentId, setSimStudentId] = useState('')
  const [simMessage, setSimMessage] = useState('')
  const [simLoading, setSimLoading] = useState(false)

  // Past Attendance
  const [pastRecords, setPastRecords] = useState([])
  const [pastLoading, setPastLoading] = useState(false)
  const [liveRecords, setLiveRecords] = useState([])
  const [liveLoading, setLiveLoading] = useState(false)
  const [pastFilters, setPastFilters] = useState({
    date_from: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0],
    student_name_filter: ''
  })

  const loadPastAttendance = async () => {
    setPastLoading(true)
    try {
      const params = new URLSearchParams()
      if (pastFilters.date_from) params.append('date_from', pastFilters.date_from)
      if (pastFilters.date_to) params.append('date_to', pastFilters.date_to)
      const res = await api.get(`/attendance/history?${params.toString()}`)
      setPastRecords(res.data || [])
    } catch {
      setError('Failed to load attendance history')
    } finally {
      setPastLoading(false)
    }
  }

  const loadLiveAttendance = async () => {
    setLiveLoading(true)
    try {
      const res = await api.get('/attendance/history?limit=20')
      setLiveRecords(res.data || [])
    } catch {
      setError('Failed to load live attendance')
    } finally {
      setLiveLoading(false)
    }
  }
  
  useEffect(() => {
    loadData()
    loadLiveAttendance()
    const interval = setInterval(loadLiveAttendance, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      loadLiveAttendance()
    }
  }, [selectedCourse])
  
  const CLASSROOM_MAP = {
    crs_001: 'ESP32_CLASSROOM_101',
    crs_002: 'ESP32_CLASSROOM_102',
    crs_003: 'ESP32_CLASSROOM_103',
    crs_004: 'ESP32_CLASSROOM_104'
  }

  const getClassroomId = () => CLASSROOM_MAP[selectedCourse?.id] || 'ESP32_CLASSROOM_101'

  const handleSimulateAttendance = async () => {
    if (!selectedCourse) {
      setError('Please select a course before simulating attendance.')
      return
    }

    const studentId = simStudentId.trim()
    if (!studentId) {
      setError('Enter a student ID or student number to simulate attendance.')
      return
    }

    setSimLoading(true)
    setError('')
    setSimMessage('')

    try {
      const payload = {
        student_id: studentId,
        classroom_id: getClassroomId(),
        timestamp: new Date().toISOString(),
        device_id: 'FAC_SIM',
        status: 'present',
        match_score: 90
      }

      await api.post('/attendance/fingerprint', payload)
      setSimMessage(`Attendance simulated for ${studentId}.`)
      setSuccess(`Attendance recorded for ${studentId}.`)
      setSimStudentId('')
      loadLiveAttendance()
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Simulation failed.')
    } finally {
      setSimLoading(false)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      // In real app, fetch faculty's courses
      setCourses([
        { id: 'crs_001', name: 'Database Management', classroom_id: 'ESP32_CLASSROOM_101' },
        { id: 'crs_002', name: 'Data Communication', classroom_id: 'ESP32_CLASSROOM_102' },
        { id: 'crs_003', name: 'App Dev Lab', classroom_id: 'ESP32_CLASSROOM_103' },
        { id: 'crs_004', name: 'Computer Architecture and Organizations', classroom_id: 'ESP32_CLASSROOM_104' }
      ])
      
      // Load course-specific data if selected
      if (selectedCourse) {
        try {
          const res = await api.get(`/attendance/course/${selectedCourse.id}`)
          setCourseStudents(res.data || [])
        } catch {}
      }
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Faculty Dashboard</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Threshold Setting */}
      <Card sx={{ mb: 3, p: 1 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1 }}><strong>Attendance Threshold</strong></Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              label="Threshold %" type="number" size="small"
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              inputProps={{ min: 1, max: 100 }} sx={{ width: 120 }}
            />
            <Button variant="outlined" onClick={async () => {
              const val = parseInt(thresholdInput)
              if (isNaN(val) || val < 1 || val > 100) { setError('Must be 1-100'); return }
              try {
                await api.post('/settings/threshold', { threshold: val })
              } catch {}
              setThreshold(val)
              setSuccess(`Threshold updated to ${val}%`)
            }}>Save</Button>
            <Typography variant="body2" color="textSecondary">Current: {threshold}%</Typography>
          </Box>
        </CardContent>
      </Card>
      
      <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} sx={{ mb: 2 }}>
        <Tab label="Live Attendance" />
        <Tab label="Course Reports" />
        <Tab label="Past Attendance" />
        <Tab label="At-Risk Students" />
      </Tabs>
      
      {/* Tab 1: Live Attendance */}
      <TabPanel value={tabIndex} index={0}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Current Class</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <label>
                  <strong>Select Course:</strong>
                  <select
                    value={selectedCourse?.id || ''}
                    onChange={(e) => {
                      const course = courses.find(c => c.id === e.target.value)
                      setSelectedCourse(course)
                    }}
                    style={{ marginLeft: 10, padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
              </Grid>
            </Grid>
            
            <>
              <Card sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0' }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Faculty Simulation</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Enter a student ID or student number and click the button to simulate a fingerprint attendance scan.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
                  <TextField
                    label="Student ID / Number"
                    size="small"
                    value={simStudentId}
                    onChange={(e) => setSimStudentId(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSimulateAttendance}
                    disabled={simLoading}
                  >
                    {simLoading ? 'Simulating…' : 'Simulate Scan'}
                  </Button>
                </Box>
                {simMessage && <Alert severity="success" sx={{ mb: 2 }}>{simMessage}</Alert>}
              </Card>

              <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                <strong>Recent scanned attendance</strong>
              </Typography>
              {liveLoading ? (
                <CircularProgress />
              ) : liveRecords.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell>Student</TableCell>
                          <TableCell>Room</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {liveRecords.slice(0, 8).map((rec) => (
                          <TableRow key={rec.record_id}>
                            <TableCell>{rec.student_name}</TableCell>
                            <TableCell>{rec.room_number}</TableCell>
                            <TableCell>
                              <Chip label={rec.status} size="small" color={rec.status === 'present' ? 'success' : 'warning'} />
                            </TableCell>
                            <TableCell>{new Date(rec.timestamp).toLocaleTimeString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2">No live attendance scans available yet.</Typography>
                )}
              </>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Tab 2: Course Reports */}
      <TabPanel value={tabIndex} index={1}>
        <label sx={{ mb: 2 }}>
          <strong>Select Course:</strong>
          <select
            value={selectedCourse?.id || ''}
            onChange={(e) => {
              const course = courses.find(c => c.id === e.target.value)
              setSelectedCourse(course)
              loadData()
            }}
            style={{ marginLeft: 10, padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
          >
            <option value="">-- Select Course --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        
        {selectedCourse && loading ? (
          <CircularProgress />
        ) : selectedCourse ? (
          <>
            <Box sx={{ height: 300, mb: 3 }}>
              <Bar
                data={{
                  labels: ['Alice', 'Bob', 'Carol', 'David', 'Eve'],
                  datasets: [{
                    label: 'Attendance %',
                    data: [85, 78, 92, 70, 88],
                    backgroundColor: '#1976d2'
                  }]
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </Box>
            
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Present</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Attendance %</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {['Alice Rahman', 'Bob Chen', 'Carol Martinez', 'David Smith', 'Eve Johnson'].map(name => {
                    const pct = Math.floor(Math.random() * 40 + 60)
                    return (
                      <TableRow key={name}>
                        <TableCell>{name}</TableCell>
                        <TableCell>20</TableCell>
                        <TableCell>25</TableCell>
                        <TableCell>{pct}%</TableCell>
                        <TableCell>
                          <Chip
                            label={pct >= 75 ? 'OK' : pct >= 60 ? 'AT-RISK' : 'CRITICAL'}
                            color={pct >= 75 ? 'success' : pct >= 60 ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : null}
      </TabPanel>
      
      {/* Tab 3: Past Attendance */}
      <TabPanel value={tabIndex} index={2}>
        <Typography variant="h6" sx={{ mb: 2 }}>Past Attendance Records</Typography>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField fullWidth label="From Date" type="date" size="small"
                  value={pastFilters.date_from}
                  onChange={(e) => setPastFilters({ ...pastFilters, date_from: e.target.value })}
                  InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField fullWidth label="To Date" type="date" size="small"
                  value={pastFilters.date_to}
                  onChange={(e) => setPastFilters({ ...pastFilters, date_to: e.target.value })}
                  InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Filter by Student Name" size="small"
                  value={pastFilters.student_name_filter}
                  onChange={(e) => setPastFilters({ ...pastFilters, student_name_filter: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button fullWidth variant="contained" onClick={loadPastAttendance}>Search</Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {pastLoading ? <CircularProgress /> : (
          <>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              {pastRecords.length} records found
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Student</TableCell>
                    <TableCell>Student #</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Match Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pastRecords
                    .filter(r => !pastFilters.student_name_filter ||
                      r.student_name?.toLowerCase().includes(pastFilters.student_name_filter.toLowerCase()))
                    .map((rec) => (
                      <TableRow key={rec.record_id}>
                        <TableCell>{new Date(rec.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{rec.student_name}</TableCell>
                        <TableCell>{rec.student_number}</TableCell>
                        <TableCell>{rec.room_number}</TableCell>
                        <TableCell>
                          <Chip label={rec.status} size="small"
                            color={rec.status === 'present' ? 'success' : rec.status === 'manual' ? 'warning' : 'error'} />
                        </TableCell>
                        <TableCell>{rec.match_score ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </TabPanel>

      {/* Tab 4: At-Risk Students */}
      <TabPanel value={tabIndex} index={3}>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Students below {threshold}% attendance threshold
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Student Name</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Attendance %</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { name: 'Frank Lee', course: 'Software Engineering', pct: 65 },
                { name: 'Henry Patel', course: 'Database Design', pct: 58 }
              ].map(student => (
                <TableRow key={student.name}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.course}</TableCell>
                  <TableCell><strong>{student.pct}%</strong></TableCell>
                  <TableCell>
                    <Chip
                      label={student.pct >= 60 ? 'AMBER' : 'RED'}
                      color={student.pct >= 60 ? 'warning' : 'error'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>
    </Box>
  )
}

export default FacultyDashboard
