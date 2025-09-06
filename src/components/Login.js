import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Avatar,
  InputAdornment,
  IconButton,
  Alert,
  Fade,
  Card,
  CardContent
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  School,
  Psychology,
  Groups,
  TrendingUp,
  Security
} from '@mui/icons-material';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    studentId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock authentication - in reality, you'd validate against your backend
      if (formData.email && formData.password) {
        const userData = {
          id: Math.random().toString(36).substr(2, 9),
          name: formData.email.split('@')[0].charAt(0).toUpperCase() + formData.email.split('@')[0].slice(1),
          email: formData.email,
          studentId: formData.studentId || `STU${Math.floor(Math.random() * 10000)}`,
          university: 'Tech University',
          major: 'Computer Science',
          year: 'Junior',
          joinedAt: new Date().toISOString(),
          wellnessStreak: Math.floor(Math.random() * 15),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`
        };
        
        onLogin(userData);
      } else {
        setError('Please fill in all required fields');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = () => {
    const demoUser = {
      id: 'demo_user_123',
      name: 'Alex Johnson',
      email: 'alex.johnson@techuniv.edu',
      studentId: 'STU2024001',
      university: 'Tech University',
      major: 'Computer Science',
      year: 'Junior',
      joinedAt: new Date().toISOString(),
      wellnessStreak: 7,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'
    };
    onLogin(demoUser);
  };

  const features = [
    {
      icon: <Psychology sx={{ fontSize: 40, color: '#667eea' }} />,
      title: 'AI-Powered Analysis',
      description: 'Real-time emotional pattern recognition and personalized insights'
    },
    {
      icon: <Groups sx={{ fontSize: 40, color: '#764ba2' }} />,
      title: 'Peer Support Network',
      description: 'Connect with students facing similar challenges anonymously'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: '#667eea' }} />,
      title: 'Wellness Tracking',
      description: 'Monitor your mental health journey with detailed analytics'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: '#764ba2' }} />,
      title: 'Privacy First',
      description: 'Your data stays secure with end-to-end encryption'
    }
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Fade in={true} timeout={1000}>
          <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', minHeight: '80vh' }}>
            {/* Left Side - Branding & Features */}
            <Box sx={{ flex: 1, color: 'white', pr: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Avatar sx={{ bgcolor: 'white', color: '#667eea', mr: 2, width: 60, height: 60 }}>
                  <School sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h2" fontWeight="bold">
                  MindfulCampus
                </Typography>
              </Box>
              
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Transform your mental wellness journey with AI-powered insights and peer support
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 4 }}>
                {features.map((feature, index) => (
                  <Fade in={true} timeout={1500 + index * 200} key={index}>
                    <Card sx={{ 
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white'
                    }}>
                      <CardContent sx={{ textAlign: 'center', py: 3 }}>
                        {feature.icon}
                        <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Fade>
                ))}
              </Box>
            </Box>

            {/* Right Side - Login Form */}
            <Box sx={{ flex: '0 0 400px' }}>
              <Paper
                elevation={24}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <Typography variant="h4" align="center" gutterBottom fontWeight="600">
                  {isSignUp ? 'Join MindfulCampus' : 'Welcome Back'}
                </Typography>
                
                <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                  {isSignUp 
                    ? 'Start your wellness journey today' 
                    : 'Sign in to continue your wellness journey'}
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="University Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    margin="normal"
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          @
                        </InputAdornment>
                      )
                    }}
                  />

                  {isSignUp && (
                    <TextField
                      fullWidth
                      label="Student ID"
                      value={formData.studentId}
                      onChange={handleChange('studentId')}
                      margin="normal"
                      placeholder="STU2024001"
                    />
                  )}

                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange('password')}
                    margin="normal"
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{
                      mt: 3,
                      mb: 2,
                      py: 1.5,
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      fontSize: '1.1rem',
                      fontWeight: 600
                    }}
                  >
                    {isLoading ? 'Signing In...' : (isSignUp ? 'Create Account' : 'Sign In')}
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={demoLogin}
                    sx={{ mb: 2 }}
                  >
                    Try Demo Account
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      onClick={() => setIsSignUp(!isSignUp)}
                      sx={{ textTransform: 'none' }}
                    >
                      {isSignUp 
                        ? 'Already have an account? Sign In' 
                        : "Don't have an account? Sign Up"}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login;