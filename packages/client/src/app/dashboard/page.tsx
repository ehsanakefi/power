'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
} from '@mui/material';
import {
  ExitToApp,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/store/auth.store';
import AuthGuard from '@/components/auth/AuthGuard';

function DashboardContent() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      // The logout function in the store will handle the redirect
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout API fails
      router.push('/login');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 3,
        }}
      >
        <Box sx={{ mb: 4 }}>
          <DashboardIcon
            sx={{
              fontSize: 60,
              color: 'primary.main',
              mb: 2
            }}
          />
          <Typography variant="h3" component="h1" gutterBottom color="primary">
            Welcome to your Dashboard
          </Typography>
          {user && (
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Hello, {user.phone}!
            </Typography>
          )}
          <Typography variant="body1" color="text.secondary">
            You have successfully logged into Power CRM system.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={<ExitToApp />}
          onClick={handleLogout}
          disabled={isLoading}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
          }}
        >
          Logout
        </Button>
      </Paper>
    </Container>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
