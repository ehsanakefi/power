'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Avatar,
  Chip,
  Stack,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ConfirmationNumber as TicketIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useAuthStore } from '@/store/auth.store';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { useAuthContext } from '@/providers/AuthProvider';

export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore();
  const { isInitialized } = useAuthContext();

  const handleLogin = () => {
    window.location.href = '/login';
  };

  const handleDashboard = () => {
    window.location.href = '/dashboard';
  };

  // Show loading screen while initializing authentication
  if (!isInitialized) {
    return <LoadingScreen message="Initializing..." />;
  }

  if (isAuthenticated && user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Paper elevation={2} sx={{ p: 4, mb: 4, background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)' }}>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: '2rem'
              }}
            >
              {user.phone.slice(-2)}
            </Avatar>
            <Box>
              <Typography variant="h4" color="white" gutterBottom>
                خوش آمدید!
              </Typography>
              <Typography variant="h6" color="rgba(255,255,255,0.9)" gutterBottom>
                شماره تماس: {user.phone}
              </Typography>
              <Chip
                label={user.role === 'CLIENT' ? 'مشتری' :
                       user.role === 'EMPLOYEE' ? 'کارمند' :
                       user.role === 'MANAGER' ? 'مدیر' : 'ادمین'}
                color="secondary"
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, height: '100%' }}>
              <CardContent>
                <DashboardIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  داشبورد
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  مشاهده آمار و گزارشات
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleDashboard}
                >
                  ورود به داشبورد
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, height: '100%' }}>
              <CardContent>
                <TicketIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  تیکت‌ها
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  مدیریت شکایات و درخواست‌ها
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  href="/tickets"
                >
                  مشاهده تیکت‌ها
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2, height: '100%' }}>
                <CardContent>
                  <PeopleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    کاربران
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    مدیریت کاربران سیستم
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    href="/users"
                  >
                    مدیریت کاربران
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2, height: '100%' }}>
              <CardContent>
                <SettingsIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  تنظیمات
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  تنظیمات حساب کاربری
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  href="/settings"
                >
                  تنظیمات
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            فعالیت‌های اخیر
          </Typography>
          <Typography variant="body1" color="text.secondary">
            در حال حاضر فعالیت خاصی وجود ندارد.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={10}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Logo and Title */}
          <Box sx={{ mb: 4 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                margin: '0 auto',
                mb: 3,
                fontSize: '3rem',
              }}
            >
              ⚡
            </Avatar>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              Power CRM
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              gutterBottom
              sx={{ mb: 4 }}
            >
              سیستم جامع مدیریت ارتباط با مشتری
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, lineHeight: 1.7 }}
            >
              مدیریت هوشمند شکایات و درخواست‌های مردمی از طریق پیامک برای شرکت توزیع برق
            </Typography>
          </Box>

          {/* Features */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Stack alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 60, height: 60 }}>
                  <TicketIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h6">
                  مدیریت تیکت‌ها
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  ثبت و پیگیری شکایات و درخواست‌های مشتریان
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.main', width: 60, height: 60 }}>
                  <PhoneIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h6">
                  ورود با پیامک
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  احراز هویت امن از طریق شماره موبایل
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'info.main', width: 60, height: 60 }}>
                  <DashboardIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h6">
                  داشبورد جامع
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  مشاهده آمار و گزارشات تفصیلی
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          {/* CTA Button */}
          <Box>
            <Button
              variant="contained"
              size="large"
              onClick={handleLogin}
              sx={{
                py: 2,
                px: 6,
                fontSize: '1.1rem',
                borderRadius: 3,
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 10px 2px rgba(25, 118, 210, .3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              ورود به سیستم
            </Button>
          </Box>

          {/* Contact Info */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
            <Typography variant="body2" color="text.secondary">
              جهت پشتیبانی با شماره ۰۲۱-۱۲۳۴۵۶۷۸ تماس بگیرید
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
