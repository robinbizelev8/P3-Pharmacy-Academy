import { useQuery } from "@tanstack/react-query";

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