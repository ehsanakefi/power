'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack,
  Send,
  ConfirmationNumber,
} from '@mui/icons-material';
import { useAuthStore } from '@/store/auth.store';
import AuthGuard from '@/components/auth/AuthGuard';
import { api } from '@/lib/api';

function NewTicketContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      api.tickets.create(data),
    onSuccess: (response) => {
      // Invalidate and refetch tickets
      queryClient.invalidateQueries({ queryKey: ['tickets'] });

      // Show success and redirect
      const ticketId = response.data.data?.ticket?.id;
      if (ticketId) {
        router.push(`/tickets/${ticketId}`);
      } else {
        router.push('/tickets');
      }
    },
    onError: (error: any) => {
      setFormError(
        error.response?.data?.message ||
        'Failed to create ticket. Please try again.'
      );
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!title.trim()) {
      setFormError('Please enter a ticket title');
      return;
    }

    if (!content.trim()) {
      setFormError('Please enter ticket content');
      return;
    }

    if (title.trim().length < 5) {
      setFormError('Title must be at least 5 characters long');
      return;
    }

    if (content.trim().length < 10) {
      setFormError('Content must be at least 10 characters long');
      return;
    }

    // Submit the form
    createTicketMutation.mutate({
      title: title.trim(),
      content: content.trim(),
    });
  };

  const isLoading = createTicketMutation.isPending;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/tickets')}
          sx={{ mb: 2 }}
        >
          Back to Tickets
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <ConfirmationNumber sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" color="primary">
              Create New Ticket
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Submit a new support request
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Form */}
      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* User Info */}
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Submitting as:
              </Typography>
              <Typography variant="body1">
                {user?.phone} ({user?.role})
              </Typography>
            </Box>

            {/* Error Alert */}
            {formError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {formError}
              </Alert>
            )}

            {/* Title Field */}
            <TextField
              fullWidth
              label="Ticket Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              required
              placeholder="Brief description of your issue"
              helperText="Provide a clear, concise title for your support request"
              sx={{ mb: 3 }}
              inputProps={{ maxLength: 200 }}
            />

            {/* Content Field */}
            <TextField
              fullWidth
              label="Description"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
              required
              multiline
              rows={8}
              placeholder="Describe your issue in detail..."
              helperText={`Provide detailed information about your issue. ${content.length}/1000 characters`}
              sx={{ mb: 3 }}
              inputProps={{ maxLength: 1000 }}
            />

            {/* Submit Button */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => router.push('/tickets')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                disabled={isLoading || !title.trim() || !content.trim()}
              >
                {isLoading ? 'Creating...' : 'Create Ticket'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <Typography variant="h6" gutterBottom>
          💡 Tips for Better Support
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Be specific about the problem you&apos;re experiencing</li>
          <li>Include any error messages you&apos;ve seen</li>
          <li>Mention what you were trying to do when the issue occurred</li>
          <li>Include relevant details like date, time, or account information</li>
        </ul>
      </Paper>
    </Container>
  );
}

export default function NewTicketPage() {
  return (
    <AuthGuard>
      <NewTicketContent />
    </AuthGuard>
  );
}
