// User Role Constants
// These replace the Prisma UserRole enum for SQLite compatibility

export const UserRole = {
  CLIENT: 'CLIENT',
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Role hierarchy for permission checking
export const ROLE_HIERARCHY: Record<string, number> = {
  [UserRole.CLIENT]: 1,
  [UserRole.EMPLOYEE]: 2,
  [UserRole.MANAGER]: 3,
  [UserRole.ADMIN]: 4,
  [UserRole.SUPER_ADMIN]: 5,
};

// Helper functions for role checking
export const isValidRole = (role: string): role is UserRoleType => {
  return Object.values(UserRole).includes(role as UserRoleType);
};

export const hasPermission = (userRole: string, requiredRole: string): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

export const canManageTickets = (role: string): boolean => {
  return hasPermission(role, UserRole.EMPLOYEE);
};

export const canDeleteTickets = (role: string): boolean => {
  return hasPermission(role, UserRole.MANAGER);
};

export const canManageUsers = (role: string): boolean => {
  return hasPermission(role, UserRole.ADMIN);
};

// Default role for new users
export const DEFAULT_USER_ROLE = UserRole.CLIENT;

// Export for backward compatibility
export default UserRole;
