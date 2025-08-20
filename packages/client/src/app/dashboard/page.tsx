'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  ExitToApp,
  Dashboard as DashboardIcon,
  ConfirmationNumber,
  Add,
} from '@mui/icons-material';
import { useAuthStore } from '@/store/auth.store';
import AuthGuard from '@/components/auth/AuthGuard';
import { getTickets, Ticket } from '@/lib/api';

function DashboardContent() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();

  // Fetch user tickets using React Query
  const {
    data: ticketsResponse,
    isLoading: ticketsLoading,
    isError: ticketsError,
    error,
  } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => getTickets({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }),
    enabled: !!user, // Only fetch when user is available
  });

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'unseen':
        return 'error';
      case 'in_progress':
      case 'pending':
        return 'warning';
      case 'resolved':
      case 'closed':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tickets = ticketsResponse?.data?.tickets || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DashboardIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" color="primary">
                Dashboard
              </Typography>
              {user && (
                <Typography variant="body1" color="text.secondary">
                  Welcome back, {user.phone}
                </Typography>
              )}
            </Box>
          </Box>
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
      </Box>

      <Grid container spacing={3}>
        {/* Tickets Overview Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ConfirmationNumber sx={{ fontSize: 30, color: 'primary.main' }} />
                  <Typography variant="h5" component="h2">
                    Your Support Tickets
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => router.push('/tickets/new')}
                  size="small"
                >
                  New Ticket
                </Button>
              </Box>

              {/* Loading State */}
              {ticketsLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ ml: 2, alignSelf: 'center' }}>
                    Loading your tickets...
                  </Typography>
                </Box>
              )}

              {/* Error State */}
              {ticketsError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Failed to load tickets: {error?.message || 'Please try again later.'}
                </Alert>
              )}

              {/* Empty State */}
              {!ticketsLoading && !ticketsError && tickets.length === 0 && (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'background.default',
                  }}
                >
                  <ConfirmationNumber sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    You have no tickets yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Create your first support ticket to get help with any issues.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => router.push('/tickets/new')}
                  >
                    Create First Ticket
                  </Button>
                </Paper>
              )}

              {/* Tickets Table */}
              {!ticketsLoading && !ticketsError && tickets.length > 0 && (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>ID</strong></TableCell>
                        <TableCell><strong>Title</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Created</strong></TableCell>
                        <TableCell><strong>Updated</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tickets.map((ticket: Ticket) => (
                        <TableRow
                          key={ticket.id}
                          hover
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                          onClick={() => router.push(`/tickets/${ticket.id}`)}
                        >
                          <TableCell>#{ticket.id}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {ticket.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {ticket.content.substring(0, 50)}
                              {ticket.content.length > 50 ? '...' : ''}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={ticket.status}
                              color={getStatusColor(ticket.status) as any}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(ticket.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(ticket.updatedAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Show more link if there are many tickets */}
              {tickets.length >= 10 && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    variant="text"
                    onClick={() => router.push('/tickets')}
                  >
                    View All Tickets
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
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
