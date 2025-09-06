import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Badge,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material';
import {
  Dashboard,
  Psychology,
  Groups,
  Insights,
  School,
  Notifications,
  AccountCircle,
  Logout,
  Settings,
  LocalFireDepartment
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEmotion } from '../context/EmotionContext';

const Navigation = ({ user, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { wellnessStreak, interventions } = useEmotion();

  const menuItems = [
    { path: '/', icon: <Dashboard />, label: 'Dashboard' },
    { path: '/analysis', icon: <Psychology />, label: 'Mood Analysis' },
    { path: '/support', icon: <Groups />, label: 'Peer Support' },
    { path: '/insights', icon: <Insights />, label: 'Campus Insights' }
  ];

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    onLogout();
  };

  const unreadNotifications = interventions.filter(i => !i.read).length;

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: 'linear-gradient(90deg, rgba(26,29,41,0.95) 0%, rgba(16,20,31,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <Toolbar>
        {/* Logo and Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <Avatar sx={{ bgcolor: '#667eea', mr: 2 }}>
            <School />
          </Avatar>
          <Typography variant="h6" component="div" fontWeight="bold">
            MindfulCampus
          </Typography>
        </Box>

        {/* Navigation Menu */}
        <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
          {menuItems.map((item) => (
            <Button
              key={item.path}
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                color: location.pathname === item.path ? '#667eea' : 'rgba(255,255,255,0.7)',
                backgroundColor: location.pathname === item.path ? 'rgba(102,126,234,0.1)' : 'transparent',
                borderRadius: 2,
                px: 2,
                py: 1,
                textTransform: 'none',
                fontWeight: location.pathname === item.path ? 600 : 400,
                '&:hover': {
                  backgroundColor: 'rgba(102,126,234,0.1)',
                  color: '#667eea'
                }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Wellness Streak */}
        <Tooltip title={`${wellnessStreak} day wellness streak!`}>
          <Chip
            icon={<LocalFireDepartment sx={{ color: '#ff6b35 !important' }} />}
            label={`${wellnessStreak} days`}
            variant="outlined"
            sx={{
              mr: 2,
              color: '#ff6b35',
              borderColor: '#ff6b35',
              '& .MuiChip-icon': {
                color: '#ff6b35'
              }
            }}
          />
        </Tooltip>

        {/* Notifications */}
        <Tooltip title="Recent interventions">
          <IconButton 
            color="inherit" 
            sx={{ mr: 2 }}
            onClick={() => navigate('/')}
          >
            <Badge badgeContent={unreadNotifications} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ mr: 2, textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {user.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              {user.major} • {user.year}
            </Typography>
          </Box>
          
          <IconButton onClick={handleMenuClick} sx={{ p: 0 }}>
            <Avatar 
              src={user.avatar}
              sx={{ 
                width: 40, 
                height: 40,
                border: '2px solid rgba(255,255,255,0.2)'
              }}
            />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                background: 'rgba(26,29,41,0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <Typography variant="body1" fontWeight="600">
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.university}
              </Typography>
            </Box>

            <MenuItem onClick={handleMenuClose}>
              <AccountCircle sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <Settings sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: '#ff6b6b' }}>
              <Logout sx={{ mr: 1 }} />
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;