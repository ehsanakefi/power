'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  Avatar,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  Person,
  ExitToApp,
  Dashboard as DashboardIcon,
  Phone,
  Schedule,
} from '@mui/icons-material';
import { useAuthStore } from '@/store/auth.store';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading, fetchProfile } = useAuthStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch user profile if not loaded
    if (!user && isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, user, router, fetchProfile]);

  const handleLogout = () => {
    logout();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'MANAGER':
        return 'warning';
      case 'EMPLOYEE':
        return 'info';
      case 'CLIENT':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'MANAGER':
        return 'Manager';
      case 'EMPLOYEE':
        return 'Employee';
      case 'CLIENT':
        return 'Client';
      default:
        return role;
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" color="primary">
            <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Dashboard
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<ExitToApp />}
            onClick={handleLogout}
            disabled={isLoading}
          >
            Logout
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Welcome to your Power CRM dashboard
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* User Profile Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h6" component="h2">
                    User Profile
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your account information
                  </Typography>
                </Box>
              </Box>

              {user ? (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Phone Number
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Phone sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body1">{user.phone}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Role
                    </Typography>
                    <Chip
                      label={getRoleLabel(user.role)}
                      color={getRoleColor(user.role) as any}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Member Since
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Schedule sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body1">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" color="text.secondary">
                    User ID: {user.id}
                  </Typography>
                </Box>
              ) : (
                <Alert severity="info">Loading user information...</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Quick Actions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Common tasks and features
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => router.push('/tickets')}
                  >
                    <Typography variant="h6" color="primary">
                      Support Tickets
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View and manage support tickets
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => router.push('/profile')}
                  >
                    <Typography variant="h6" color="primary">
                      Profile Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Update your account settings
                    </Typography>
                  </Paper>
                </Grid>

                {user?.role !== 'CLIENT' && (
                  <Grid item xs={12}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                      onClick={() => router.push('/admin')}
                    >
                      <Typography variant="h6" color="primary">
                        Admin Panel
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage system settings
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* System Status Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                System Status
              </Typography>
              <Alert severity="success" sx={{ mt: 2 }}>
                All systems are operational. Welcome to Power CRM!
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
