# Login System Documentation

This directory contains the complete login system for the Power CRM Next.js client application.

## Features

### 🔐 Authentication Flow
- **Phone-based Login**: Users authenticate using their Iranian mobile phone numbers
- **SMS Verification**: Secure login process through SMS verification codes
- **Token Management**: JWT tokens stored securely in localStorage and Zustand store
- **Auto-redirect**: Authenticated users are redirected to dashboard, unauthenticated users to login

### 🎨 UI Components
- **Material-UI Design**: Clean, responsive login form using MUI components
- **Form Validation**: Real-time validation for Iranian phone numbers (09xxxxxxxxx format)
- **Loading States**: Visual feedback during authentication process
- **Error Handling**: User-friendly error messages for failed login attempts

### 🛡️ Security Features
- **Route Protection**: Middleware prevents unauthorized access to protected routes
- **Token Persistence**: Authentication state persists across browser sessions
- **Automatic Logout**: Invalid tokens trigger automatic logout and redirect

## File Structure

```
src/app/login/
├── README.md          # This documentation
├── layout.tsx         # Login page layout with gradient background
└── page.tsx          # Main login component
```

## Components Overview

### `page.tsx` - Main Login Component
- **Form Management**: React state for phone number input
- **Validation**: Iranian phone number format validation
- **API Integration**: Calls login endpoint via Zustand store
- **Navigation**: Redirects to dashboard on successful authentication

### `layout.tsx` - Login Layout
- **Styling**: Gradient background and centered container
- **Responsive**: Mobile-friendly design
- **Clean Interface**: Minimal layout focusing on the login form

## Authentication Store Integration

The login system integrates with the Zustand authentication store (`/src/store/auth.store.ts`):

### State Management
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### Key Actions
- `login(phone: string)`: Authenticate user with phone number
- `logout()`: Clear authentication state and redirect
- `clearError()`: Reset error state
- `fetchProfile()`: Load user profile data

## API Integration

### Login Endpoint
```typescript
POST /api/auth/login
{
  "phone": "09123456789"
}
```

### Expected Response
```typescript
{
  "success": true,
  "data": {
    "user": { id, phone, role, createdAt, updatedAt },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

## Usage Example

### Basic Login Flow
1. User enters phone number (e.g., `09123456789`)
2. Form validates Iranian phone format
3. API call made to `/api/auth/login`
4. On success: token saved, user redirected to `/dashboard`
5. On error: error message displayed to user

### Phone Number Validation
```typescript
const validatePhone = (phoneNumber: string): boolean => {
  const iranPhoneRegex = /^09\d{9}$/;
  return iranPhoneRegex.test(phoneNumber);
};
```

## Protected Routes

The system includes middleware protection for authenticated routes:

### Protected Routes
- `/dashboard` - User dashboard
- `/profile` - User profile settings
- `/tickets` - Support tickets
- `/admin` - Administrative panel

### Public Routes
- `/login` - Login page
- `/register` - Registration page (if implemented)

## Error Handling

### Client-Side Errors
- Invalid phone number format
- Network connectivity issues
- API timeout errors

### Server-Side Errors
- Invalid credentials
- Account not found
- Rate limiting
- Server errors

## Styling & Theming

### Material-UI Integration
- Uses MUI components: `Card`, `TextField`, `Button`, `Alert`
- Consistent with application theme
- Responsive design principles
- Loading states with `CircularProgress`

### Custom Styling
- Gradient background layout
- Centered form design
- Phone icon in input field
- Error state styling

## Testing

### Manual Testing Checklist
- [ ] Valid phone numbers accepted (09xxxxxxxxx)
- [ ] Invalid phone numbers rejected
- [ ] Loading state shows during API call
- [ ] Success redirects to dashboard
- [ ] Errors display properly
- [ ] Form resets after errors
- [ ] Authenticated users redirect from login

### Test Phone Numbers
For development/testing, use these formats:
- Valid: `09123456789`
- Invalid: `9123456789` (missing 0)
- Invalid: `09123` (too short)
- Invalid: `091234567890` (too long)

## Environment Configuration

### Required Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Development Setup
1. Ensure backend API is running
2. Set environment variables
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Navigate to `http://localhost:3000/login`

## Future Enhancements

### Planned Features
- [ ] Remember me functionality
- [ ] Password reset flow
- [ ] Social media login integration
- [ ] Multi-factor authentication
- [ ] Account lockout protection

### Performance Optimizations
- [ ] Form validation debouncing
- [ ] API call caching
- [ ] Progressive loading
- [ ] Error boundary implementation

## Troubleshooting

### Common Issues

**Issue**: "Network error occurred"
**Solution**: Check if backend API is running and accessible

**Issue**: "Invalid phone number format"
**Solution**: Ensure phone number starts with `09` and has 11 digits total

**Issue**: Infinite redirect loop
**Solution**: Clear localStorage and check middleware configuration

**Issue**: Token not persisting
**Solution**: Verify Zustand persistence configuration and localStorage access

### Debug Mode
Enable development logging by setting:
```bash
NODE_ENV=development
```

This will log API requests and responses in the browser console.

## Related Files

- `/src/store/auth.store.ts` - Authentication state management
- `/src/lib/api.ts` - API client configuration
- `/src/middleware.ts` - Route protection middleware
- `/src/providers/AuthProvider.tsx` - Authentication context provider
- `/src/app/dashboard/page.tsx` - Post-login destination

## Support

For technical support or questions about the login system:
1. Check this documentation
2. Review browser console for errors
3. Verify API endpoint connectivity
4. Contact the development team

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Maintainer**: Power CRM Development Team