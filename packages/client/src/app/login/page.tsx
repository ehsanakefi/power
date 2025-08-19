'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
} from '@mui/material';
import { Phone } from '@mui/icons-material';
import { useAuthStore } from '@/store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, isAuthenticated, clearError } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Clear errors when component mounts or phone changes
  useEffect(() => {
    clearError();
    setFormError('');
  }, [phone, clearError]);

  const validatePhone = (phoneNumber: string): boolean => {
    // Iranian phone number validation (starts with 09 and has 11 digits)
    const iranPhoneRegex = /^09\d{9}$/;
    return iranPhoneRegex.test(phoneNumber);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setFormError('');
    clearError();

    // Validate phone number
    if (!phone.trim()) {
      setFormError('Phone number is required');
      return;
    }

    if (!validatePhone(phone.trim())) {
      setFormError('Please enter a valid Iranian phone number (e.g., 09123456789)');
      return;
    }

    try {
      const result = await login(phone.trim());

      if (result.success) {
        // Redirect to dashboard on successful login
        router.push('/dashboard');
      } else {
        setFormError(result.message || 'Login failed');
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 11) {
      setPhone(value);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: 3,
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 400,
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom color="primary">
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Enter your phone number to sign in
              </Typography>
            </Box>

            {(error || formError) && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                onClose={() => {
                  clearError();
                  setFormError('');
                }}
              >
                {formError || error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Phone Number"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="09123456789"
                disabled={isLoading}
                required
                autoFocus
                autoComplete="tel"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
                helperText="Enter your Iranian mobile number"
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading || !phone.trim()}
                sx={{
                  mt: 1,
                  mb: 2,
                  py: 1.5,
                  position: 'relative',
                }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress
                      size={20}
                      sx={{
                        color: 'white',
                        position: 'absolute',
                        left: '50%',
                        marginLeft: '-10px',
                      }}
                    />
                    <span style={{ opacity: 0 }}>Sign In</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Don&apos;t have an account?{' '}
                <Button
                  variant="text"
                  size="small"
                  onClick={() => router.push('/register')}
                  disabled={isLoading}
                >
                  Contact Support
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © 2024 Power CRM. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
