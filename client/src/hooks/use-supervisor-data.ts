import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API call functions using session-based authentication
async function fetchWithAuth(url: string) {
  const response = await fetch(url, {
    credentials: "include", // Use session cookies instead of Bearer tokens
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.json();
}

export function useSupervisorDashboard(supervisorId: string | undefined) {
  return useQuery({
    queryKey: ["supervisor", "dashboard", supervisorId],
    queryFn: () => fetchWithAuth('/api/supervisor/dashboard'),
    enabled: !!supervisorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

export function useAssignedTrainees(supervisorId: string | undefined) {
  return useQuery({
    queryKey: ["supervisor", "trainees", supervisorId],
    queryFn: () => fetchWithAuth('/api/supervisor/trainees'),
    enabled: !!supervisorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });
}

export function useTraineeProgress(traineeId: string | undefined) {
  return useQuery({
    queryKey: ["supervisor", "trainee-progress", traineeId],
    queryFn: () => fetchWithAuth(`/api/supervisor/trainee/${traineeId}/progress`),
    enabled: !!traineeId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
}

export function useSupervisorFeedback(supervisorId: string | undefined, traineeId?: string) {
  const queryKey = traineeId 
    ? ["supervisor", "feedback", supervisorId, traineeId]
    : ["supervisor", "feedback", supervisorId];
    
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
    queryKey: ["supervisor", "scenarios", supervisorId],
    queryFn: () => fetchWithAuth('/api/supervisor/scenarios'),
    enabled: !!supervisorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSupervisorAnalytics(supervisorId: string | undefined) {
  return useQuery({
    queryKey: ["supervisor", "analytics", supervisorId],
    queryFn: () => fetchWithAuth('/api/supervisor/analytics'),
    enabled: !!supervisorId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Trainee Management API functions
async function assignTrainee(traineeId: string, institution?: string) {
  const response = await fetch('/api/supervisor/assign-trainee', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ traineeId, institution }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to assign trainee');
  }
  
  return response.json();
}

async function unassignTrainee(traineeId: string) {
  const response = await fetch(`/api/supervisor/trainees/${traineeId}`, {
    method: 'DELETE',
    credentials: 'include',
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