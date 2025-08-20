'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import {
  Person,
  Phone,
  Schedule,
  Edit,
  ArrowBack,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import AuthGuard from '@/components/auth/AuthGuard';

function ProfileContent() {
  const router = useRouter();
  const { user } = useAuthStore();

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

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Profile Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account information and preferences
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  mr: 3,
                  width: 80,
                  height: 80,
                  fontSize: '2rem'
                }}
              >
                <Person sx={{ fontSize: '2.5rem' }} />
              </Avatar>
              <Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  User Profile
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Your account details and information
                </Typography>
              </Box>
            </Box>

            {user ? (
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Phone Number
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="h6">{user.phone}</Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Role
                  </Typography>
                  <Chip
                    label={getRoleLabel(user.role)}
                    color={getRoleColor(user.role) as any}
                    size="medium"
                    sx={{ fontWeight: 'medium' }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Member Since
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Account Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    User ID: {user.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated: {new Date(user.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => {
                      // TODO: Implement edit profile functionality
                      alert('Edit profile functionality coming soon!');
                    }}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography color="text.secondary">
                Loading profile information...
              </Typography>
            )}
          </CardContent>
        </Card>
      </Paper>
    </Container>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
