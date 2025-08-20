# AuthGuard System Documentation

This directory contains the authentication guard system for protecting routes and components in the Power CRM Next.js client application.

## Overview

The AuthGuard system provides multiple layers of protection for your application:

- **Route Protection**: Automatically redirect unauthenticated users
- **Component Protection**: Wrap sensitive components with authentication checks
- **Role-based Access**: Control access based on user roles and permissions
- **Loading States**: Show appropriate loading indicators during auth checks
- **Flexible Implementation**: Multiple patterns for different use cases

## Components

### `AuthGuard.tsx` - Main Protection Component

The core component that provides authentication protection for routes and components.

#### Basic Usage

```tsx
import AuthGuard from '@/components/auth/AuthGuard';

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <div>This content is only visible to authenticated users</div>
    </AuthGuard>
  );
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | - | Content to render when user is authenticated |
| `fallback` | `React.ReactNode` | `<LoadingScreen />` | Component to show while checking auth |
| `redirectTo` | `string` | `'/login'` | URL to redirect unauthenticated users |

#### Advanced Usage

```tsx
import AuthGuard from '@/components/auth/AuthGuard';
import CustomLoader from '@/components/CustomLoader';

export default function DashboardPage() {
  return (
    <AuthGuard
      fallback={<CustomLoader message="Checking permissions..." />}
      redirectTo="/signin"
    >
      <DashboardContent />
    </AuthGuard>
  );
}
```

## Implementation Patterns

### 1. Component Wrapper Pattern

The most straightforward approach - wrap your component content:

```tsx
import AuthGuard from '@/components/auth/AuthGuard';

function DashboardContent() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Protected content here</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
```

### 2. Higher-Order Component (HOC) Pattern

Use `withAuthGuard` for cleaner component composition:

```tsx
import { withAuthGuard } from '@/components/auth/AuthGuard';

function AdminPanel() {
  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Admin-only content</p>
    </div>
  );
}

// Export the protected version
export default withAuthGuard(AdminPanel, {
  redirectTo: '/login',
  fallback: <div>Loading admin panel...</div>
});
```

### 3. Hook Pattern

Use `useAuthGuard` for manual control:

```tsx
import { useAuthGuard } from '@/components/auth/AuthGuard';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useAuthGuard('/login');

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect automatically
  }

  return (
    <div>
      <h1>User Profile</h1>
      <p>Profile content here</p>
    </div>
  );
}
```

## Role-Based Access Control

### Using Role Helpers

The auth store provides several role-based helpers:

```tsx
import { useIsAdmin, useHasRole, useCanManageUsers } from '@/store/auth.store';

function AdminSection() {
  const isAdmin = useIsAdmin();
  const hasManagementRole = useHasRole(['ADMIN', 'MANAGER']);
  const canManageUsers = useCanManageUsers();

  if (!hasManagementRole) {
    return <div>Access denied</div>;
  }

  return (
    <div>
      <h2>Management Panel</h2>
      {isAdmin && <button>Admin Only Action</button>}
      {canManageUsers && <button>Manage Users</button>}
    </div>
  );
}
```

### Role-Based Route Protection

```tsx
import AuthGuard from '@/components/auth/AuthGuard';
import { useHasRole } from '@/store/auth.store';

function AdminContent() {
  const hasAdminRole = useHasRole(['ADMIN']);
  
  if (!hasAdminRole) {
    return (
      <div>
        <h1>Access Denied</h1>
        <p>You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin content */}
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminContent />
    </AuthGuard>
  );
}
```

## Authentication Flow

### 1. Initial Load

```
User visits protected route
        ↓
AuthGuard checks isAuthenticated
        ↓
If false → Redirect to login
If true → Render content
```

### 2. With Token Refresh

```
AuthGuard initializes
        ↓
Check for stored token
        ↓
If token exists → Verify with API
        ↓
If valid → Set authenticated state
If invalid → Clear token & redirect
```

### 3. Logout Flow

```
User clicks logout
        ↓
Call logout() from store
        ↓
Clear token from storage
        ↓
Update authentication state
        ↓
Redirect to login page
```

## Error Handling

### Network Errors

```tsx
import { useAuthStore } from '@/store/auth.store';

function ProtectedComponent() {
  const { error, clearError } = useAuthStore();

  if (error) {
    return (
      <div>
        <p>Authentication error: {error}</p>
        <button onClick={clearError}>Retry</button>
      </div>
    );
  }

  return <div>Protected content</div>;
}
```

### Token Expiration

The AuthGuard automatically handles token expiration:

1. Detects expired tokens during API calls
2. Attempts to refresh the token
3. If refresh fails, logs out the user
4. Redirects to login page

## Testing

### Unit Testing AuthGuard

```tsx
import { render, screen } from '@testing-library/react';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuthStore } from '@/store/auth.store';

// Mock the auth store
jest.mock('@/store/auth.store');

describe('AuthGuard', () => {
  it('renders children when authenticated', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows loading when checking auth', () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText(/checking authentication/i)).toBeInTheDocument();
  });
});
```

### Integration Testing

```bash
# Run the comprehensive test script
./test-auth-guard.sh
```

## Performance Considerations

### Optimization Tips

1. **Lazy Loading**: Use React.lazy for protected components
```tsx
import { lazy, Suspense } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';

const LazyDashboard = lazy(() => import('./DashboardContent'));

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div>Loading dashboard...</div>}>
        <LazyDashboard />
      </Suspense>
    </AuthGuard>
  );
}
```

2. **Memoization**: Memoize role-based components
```tsx
import { memo } from 'react';
import { useIsAdmin } from '@/store/auth.store';

const AdminPanel = memo(() => {
  const isAdmin = useIsAdmin();
  
  if (!isAdmin) return null;
  
  return <div>Admin content</div>;
});
```

### Avoiding Re-renders

The AuthGuard uses `useState` and `useEffect` efficiently to minimize re-renders:

- Authentication state is cached in Zustand
- Role checks are memoized
- Loading states are properly managed

## Common Patterns

### Protected Layout

```tsx
import AuthGuard from '@/components/auth/AuthGuard';

export default function ProtectedLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="protected-layout">
        <header>Protected Header</header>
        <main>{children}</main>
        <footer>Protected Footer</footer>
      </div>
    </AuthGuard>
  );
}
```

### Conditional Rendering

```tsx
import { useAuthStore } from '@/store/auth.store';

export default function ConditionalComponent() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div>
      <h1>Welcome</h1>
      {isAuthenticated ? (
        <p>Hello, {user?.phone}!</p>
      ) : (
        <p>Please log in to continue</p>
      )}
    </div>
  );
}
```

### Mixed Public/Private Content

```tsx
import { useAuthStore } from '@/store/auth.store';

export default function MixedContentPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div>
      {/* Public content */}
      <section>
        <h1>Public Information</h1>
        <p>This is visible to everyone</p>
      </section>

      {/* Protected content */}
      {isAuthenticated && (
        <section>
          <h2>Member Area</h2>
          <p>This is only visible to authenticated users</p>
        </section>
      )}
    </div>
  );
}
```

## Troubleshooting

### Common Issues

**Issue**: Infinite redirect loops
```
Solution: Check middleware configuration and ensure login page is excluded from protection
```

**Issue**: Flash of unauthenticated content
```
Solution: Use proper loading states and avoid rendering content before auth check completes
```

**Issue**: Token not persisting
```
Solution: Verify localStorage is working and Zustand persistence is configured correctly
```

**Issue**: Role checks not working
```
Solution: Ensure user data is loaded and role field is properly set
```

### Debug Mode

Enable detailed logging by setting environment variable:
```bash
NEXT_PUBLIC_DEBUG_AUTH=true
```

This will log authentication state changes and route protection decisions.

## Migration Guide

### From Manual Auth Checks

**Before:**
```tsx
export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return <div>Dashboard content</div>;
}
```

**After:**
```tsx
import AuthGuard from '@/components/auth/AuthGuard';

function DashboardContent() {
  return <div>Dashboard content</div>;
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
```

## Best Practices

1. **Always use AuthGuard for sensitive routes**
2. **Provide meaningful loading states**
3. **Handle role-based access at the component level**
4. **Test authentication flows thoroughly**
5. **Use TypeScript for better type safety**
6. **Keep role checks consistent across components**
7. **Handle edge cases (network errors, token expiration)**

## Related Files

- `/src/store/auth.store.ts` - Authentication state management
- `/src/middleware.ts` - Route protection middleware
- `/src/components/ui/LoadingScreen.tsx` - Loading component
- `/src/app/login/page.tsx` - Login page
- `/src/app/dashboard/page.tsx` - Protected dashboard example

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Maintainer**: Power CRM Development Team