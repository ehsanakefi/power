'use client';

import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled button with custom variants
const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'isLoading',
})<{ isLoading?: boolean }>(({ theme, isLoading }) => ({
  position: 'relative',
  textTransform: 'none',
  fontWeight: 500,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1, 2),
  transition: 'all 0.2s ease-in-out',

  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[4],
  },

  '&:active': {
    transform: 'translateY(0)',
  },

  '&:disabled': {
    transform: 'none',
    boxShadow: 'none',
  },

  ...(isLoading && {
    color: 'transparent',
    '&:hover': {
      transform: 'none',
    },
  }),
}));

const LoadingSpinner = styled(CircularProgress)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: 'inherit',
}));

export interface ButtonProps extends Omit<MuiButtonProps, 'color'> {
  /**
   * Shows loading spinner and disables the button
   */
  isLoading?: boolean;
  /**
   * Button color variant
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  /**
   * Button size
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Button variant
   */
  variant?: 'contained' | 'outlined' | 'text';
  /**
   * Full width button
   */
  fullWidth?: boolean;
  /**
   * Button children (text or elements)
   */
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  isLoading = false,
  disabled = false,
  children,
  size = 'medium',
  variant = 'contained',
  color = 'primary',
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <StyledButton
      disabled={isDisabled}
      isLoading={isLoading}
      size={size}
      variant={variant}
      color={color}
      {...props}
    >
      {children}
      {isLoading && (
        <LoadingSpinner
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
          thickness={4}
        />
      )}
    </StyledButton>
  );
};

export default Button;
