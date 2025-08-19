'use client';

import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Container,
  Paper,
} from '@mui/material';
import { keyframes } from '@mui/system';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

interface LoadingScreenProps {
  message?: string;
  size?: number;
  fullScreen?: boolean;
}

export default function LoadingScreen({
  message = 'Loading...',
  size = 40,
  fullScreen = true,
}: LoadingScreenProps) {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        ...(fullScreen && {
          minHeight: '100vh',
          width: '100vw',
          position: 'fixed',
          top: 0,
          left: 0,
          bgcolor: 'background.default',
          zIndex: 9999,
        }),
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          animation: `${fadeIn} 0.5s ease-out`,
        }}
      >
        <Box
          sx={{
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        >
          <CircularProgress
            size={size}
            thickness={4}
            sx={{
              color: 'primary.main',
            }}
          />
        </Box>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {message}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            mt: 1,
          }}
        >
          {[0, 1, 2].map((index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                animation: `${pulse} 1.5s ease-in-out infinite`,
                animationDelay: `${index * 0.2}s`,
              }}
            />
          ))}
        </Box>
      </Paper>

      <Typography
        variant="body2"
        color="text.disabled"
        sx={{
          textAlign: 'center',
          maxWidth: 300,
        }}
      >
        Power CRM System
      </Typography>
    </Box>
  );

  if (fullScreen) {
    return content;
  }

  return (
    <Container
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
      }}
    >
      {content}
    </Container>
  );
}
