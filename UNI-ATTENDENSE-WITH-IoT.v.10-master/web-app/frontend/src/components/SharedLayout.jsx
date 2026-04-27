import React from 'react'
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography
} from '@mui/material'
import {
  Analytics,
  Apps,
  CalendarToday,
  Dashboard,
  DeviceHub,
  HelpOutline,
  Notifications,
  Settings
} from '@mui/icons-material'
import { useAuthStore } from '../store.jsx'

const navItems = [
  { label: 'Dashboard', icon: <Dashboard fontSize="small" /> },
  { label: 'Attendance', icon: <CalendarToday fontSize="small" /> },
  { label: 'Devices', icon: <DeviceHub fontSize="small" /> },
  { label: 'Reports', icon: <Analytics fontSize="small" /> },
  { label: 'Settings', icon: <Settings fontSize="small" /> }
]

function SharedLayout({ children }) {
  const { user } = useAuthStore()
  const displayName = user?.username || 'Guest'
  const initials = displayName ? displayName.split(' ').map((part) => part[0]).join('').slice(0, 2) : 'U'

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafb' }}>
      <Box
        component="aside"
        sx={{
          width: 280,
          bgcolor: '#f1f7fb',
          borderRight: '1px solid #e7eff4',
          px: 3,
          py: 4,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'common.white'
              }}
            >
              <Dashboard fontSize="small" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                IoT Scholar
              </Typography>
              <Typography variant="caption" sx={{ letterSpacing: '0.18em', textTransform: 'uppercase', color: 'text.secondary' }}>
                Academic Ether
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            A clean attendance dashboard for campus IoT workflows.
          </Typography>
        </Box>

        <List disablePadding>
          {navItems.map((item) => (
            <ListItemButton
              key={item.label}
              sx={{
                gap: 2,
                mb: 1,
                borderRadius: 3,
                color: 'text.primary',
                bgcolor: item.label === 'Dashboard' ? '#e6f5fb' : 'transparent',
                '&:hover': { bgcolor: '#e8f2f9' }
              }}
            >
              <ListItemIcon sx={{ color: 'text.secondary', minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 700, fontSize: '0.95rem' }} />
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ flex: '1 1 auto' }} />

        <Divider sx={{ mb: 3, borderColor: '#e4edf2' }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Support
          </Typography>
          <IconButton size="small" sx={{ bgcolor: '#ffffff', '&:hover': { bgcolor: '#f4f9ff' } }}>
            <HelpOutline fontSize="small" />
          </IconButton>
        </Box>
        <Button variant="contained" fullWidth sx={{ borderRadius: 3, py: 1.5 }}>
          Live Status
        </Button>
      </Box>

      <Box sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            bgcolor: 'rgba(248,250,251,0.95)',
            borderBottom: '1px solid #e8edf1',
            px: 4,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1, flexWrap: 'wrap' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Attendance Control
            </Typography>
            <TextField
              placeholder="Search sessions..."
              size="small"
              sx={{ minWidth: 280, bgcolor: 'common.white', borderRadius: 3 }}
              InputProps={{ sx: { borderRadius: 3 } }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <IconButton sx={{ bgcolor: 'common.white', '&:hover': { bgcolor: '#f0f6fb' } }}>
              <Notifications fontSize="small" />
            </IconButton>
            <IconButton sx={{ bgcolor: 'common.white', '&:hover': { bgcolor: '#f0f6fb' } }}>
              <Apps fontSize="small" />
            </IconButton>
            <Button variant="contained" sx={{ borderRadius: '999px', textTransform: 'none', py: 1.25, px: 3 }}>
              Check-in
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'common.white', borderRadius: 3, px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {displayName}
              </Typography>
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>{initials}</Avatar>
            </Box>
          </Box>
        </Box>

        <Box component="main" sx={{ flex: '1 1 auto', p: 4 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default SharedLayout
