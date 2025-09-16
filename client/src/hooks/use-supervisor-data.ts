import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API call functions using localStorage token authentication
async function fetchWithAuth(url: string) {
  // Get auth token from localStorage for Replit compatibility
  const authToken = localStorage.getItem('auth-token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['X-Auth-Token'] = authToken;
    console.log(`🔥 SUPERVISOR API: Adding auth token to GET ${url}`);
  } else {
    console.warn(`⚠️ SUPERVISOR API: No auth token found for GET ${url}`);
  }

  const response = await fetch(url, {
    credentials: "include",
    headers,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.json();
}

export function useSupervisorDashboard(supervisorId: string | undefined) {
  return useQuery({
    queryKey: ["supervisor", "dashboard", supervisorId || 'no-id'],
    queryFn: () => fetchWithAuth('/api/supervisor/dashboard'),
    enabled: !!supervisorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

export function useAssignedTrainees(supervisorId: string | undefined) {
  return useQuery({
    queryKey: ["supervisor", "trainees", supervisorId || 'no-id'],
    queryFn: () => fetchWithAuth('/api/supervisor/trainees'),
    enabled: !!supervisorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });
}

export function useTraineeProgress(traineeId: string | undefined) {
  return useQuery({
    queryKey: ["supervisor", "trainee-progress", traineeId || 'no-id'],
    queryFn: () => fetchWithAuth(`/api/supervisor/trainee/${traineeId || 'no-id'}/progress`),
    enabled: !!traineeId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
}

export function useSupervisorFeedback(supervisorId: string | undefined, traineeId?: string) {
  const queryKey = traineeId 
    ? ["supervisor", "feedback", supervisorId || 'no-id', traineeId]
    : ["supervisor", "feedback", supervisorId || 'no-id'];
    
  return useQuery({
    queryKey,
    queryFn: () => {
      const url = traineeId 
        ? `/api/supervisor/feedback?traineeId=${traineeId}`
        : '/api/supervisor/feedback';
      return fetchWithAuth(url);
    },
    enabled: !!supervisorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useSupervisorScenarios(supervisorId: string | undefined) {
  return useQuery({
    queryKey: ["supervisor", "scenarios", supervisorId || 'no-id'],
    queryFn: () => fetchWithAuth('/api/supervisor/scenarios'),
    enabled: !!supervisorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSupervisorAnalytics(supervisorId: string | undefined) {
  return useQuery({
    queryKey: ["supervisor", "analytics", supervisorId || 'no-id'],
    queryFn: () => fetchWithAuth('/api/supervisor/analytics'),
    enabled: !!supervisorId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Trainee Management API functions
async function assignTrainee(traineeId: string, institution?: string) {
  // Get auth token from localStorage for Replit compatibility
  const authToken = localStorage.getItem('auth-token');
  
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers['X-Auth-Token'] = authToken;
  }

  const response = await fetch('/api/supervisor/assign-trainee', {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify({ traineeId, institution }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to assign trainee');
  }
  
  return response.json();
}

async function unassignTrainee(traineeId: string) {
  // Get auth token from localStorage for Replit compatibility
  const authToken = localStorage.getItem('auth-token');
  
  const headers: Record<string, string> = {};
  if (authToken) {
    headers['X-Auth-Token'] = authToken;
  }

  const response = await fetch(`/api/supervisor/trainees/${traineeId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to unassign trainee');
  }
  
  return response.json();
}

// Trainee Management Hooks
export function useAllTrainees(supervisorId: string | undefined) {
  return useQuery({
    queryKey: ["supervisor", "all-trainees", supervisorId],
    queryFn: () => fetchWithAuth('/api/supervisor/all-trainees'),
    enabled: !!supervisorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

export function useAssignTrainee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ traineeId, institution }: { traineeId: string; institution?: string }) =>
      assignTrainee(traineeId, institution),
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["supervisor", "all-trainees"] });
      queryClient.invalidateQueries({ queryKey: ["supervisor", "trainees"] });
      queryClient.invalidateQueries({ queryKey: ["supervisor", "dashboard"] });
    },
  });
}

export function useUnassignTrainee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ traineeId }: { traineeId: string }) =>
      unassignTrainee(traineeId),
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["supervisor", "all-trainees"] });
      queryClient.invalidateQueries({ queryKey: ["supervisor", "trainees"] });
      queryClient.invalidateQueries({ queryKey: ["supervisor", "dashboard"] });
    },
  });
}