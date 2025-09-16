import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  // Use proper authentication endpoint that respects actual user sessions
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Debug authentication state (uncomment for debugging)
  // console.log('🔥 USE_AUTH DEBUG:', {
  //   hasUser: !!user,
  //   userRole: user?.role,
  //   isLoading,
  //   error: error?.message,
  //   hasAuthToken: !!localStorage.getItem('auth-token')
  // });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
