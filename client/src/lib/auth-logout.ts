export async function logout(): Promise<void> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (response.ok) {
      console.log('Logout successful');
    } else {
      console.warn('Server logout failed, but continuing with client-side logout');
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear localStorage token and redirect (Replit compatibility)
    localStorage.removeItem('auth-token');
    window.location.href = '/login';
  }
}