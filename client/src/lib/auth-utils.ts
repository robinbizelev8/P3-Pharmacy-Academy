export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// Helper function to determine redirect URL based on user role
export function getRoleBasedRedirect(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'supervisor':
      return '/supervisor/dashboard';
    case 'student':
    default:
      return '/dashboard';
  }
}
