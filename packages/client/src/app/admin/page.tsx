'use client';

import React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
} from '@mui/material';
import {
  AdminPanelSettings,
  People,
  Settings,
  BarChart,
  Security,
  ArrowBack,
  Warning,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuthStore, useIsAdmin, useHasRole } from '@/store/auth.store';
import { withAuthGuard } from '@/components/auth/AuthGuard';

function AdminPageContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = useIsAdmin();
  const hasManagementRole = useHasRole(['ADMIN', 'MANAGER']);

  // Show access denied for non-admin users
  if (!hasManagementRole) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
          <Warning sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You don&apos;t have permission to access the admin panel.
            This area is restricted to administrators and managers only.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/dashboard')}
            startIcon={<ArrowBack />}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  const adminActions = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: <People sx={{ fontSize: 40 }} />,
      color: 'primary',
      adminOnly: false,
      action: () => alert('User management feature coming soon!')
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: <Settings sx={{ fontSize: 40 }} />,
      color: 'secondary',
      adminOnly: true,
      action: () => alert('System settings feature coming soon!')
    },
    {
      title: 'Analytics',
      description: 'View system analytics and reports',
      icon: <BarChart sx={{ fontSize: 40 }} />,
      color: 'success',
      adminOnly: false,
      action: () => alert('Analytics feature coming soon!')
    },
    {
      title: 'Security Center',
      description: 'Manage security settings and logs',
      icon: <Security sx={{ fontSize: 40 }} />,
      color: 'error',
      adminOnly: true,
      action: () => alert('Security center feature coming soon!')
    },
  ];

  const availableActions = adminActions.filter(action =>
    !action.adminOnly || isAdmin
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <AdminPanelSettings sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h3" component="h1" color="primary">
              Admin Panel
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Typography variant="body1" color="text.secondary">
                Welcome, {user?.phone}
              </Typography>
              <Chip
                label={user?.role === 'ADMIN' ? 'Administrator' : 'Manager'}
                color={user?.role === 'ADMIN' ? 'error' : 'warning'}
                size="small"
              />
            </Box>
          </Box>
        </Box>

        <Typography variant="body1" color="text.secondary">
          Manage and configure your Power CRM system
        </Typography>
      </Box>

      {!isAdmin && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have manager-level access. Some features may be restricted to administrators only.
        </Alert>
      )}

      <Grid container spacing={3}>
        {availableActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={6} key={index}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
              onClick={action.action}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box sx={{ color: `${action.color}.main`, mb: 2 }}>
                  {action.icon}
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {action.title}
                  {action.adminOnly && (
                    <Chip
                      label="Admin Only"
                      size="small"
                      color="error"
                      sx={{ ml: 1, fontSize: '0.7rem' }}
                    />
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={1} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          System Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Your Role:</strong> {user?.role}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>User ID:</strong> {user?.id}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Access Level:</strong> {isAdmin ? 'Full Admin Access' : 'Manager Access'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Last Login:</strong> {new Date().toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

// Using the withAuthGuard HOC pattern
export default withAuthGuard(AdminPageContent, {
  redirectTo: '/login'
});
