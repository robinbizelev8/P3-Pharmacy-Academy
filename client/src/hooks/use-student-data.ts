import { useQuery } from "@tanstack/react-query";

// API call functions
async function fetchWithAuth(url: string) {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.json();
}

export function useStudentDashboard(studentId: string | undefined) {
  return useQuery({
    queryKey: ["student", "dashboard", studentId],
    queryFn: () => fetchWithAuth('/api/student/dashboard'),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

export function useAssignedScenarios(studentId: string | undefined) {
  return useQuery({
    queryKey: ["student", "assigned-scenarios", studentId],
    queryFn: () => fetchWithAuth('/api/student/assigned-scenarios'),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

export function useStudentFeedback(studentId: string | undefined) {
  return useQuery({
    queryKey: ["student", "feedback", studentId],
    queryFn: () => fetchWithAuth('/api/student/feedback'),
    enabled: !!studentId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
}

export function useStudentProgress(studentId: string | undefined, module?: string) {
  const queryKey = module 
    ? ["student", "progress", studentId, module]
    : ["student", "progress", studentId];

  return useQuery({
    queryKey,
    queryFn: () => {
      const url = module 
        ? `/api/student/progress/${module}`
        : '/api/student/dashboard';
      return fetchWithAuth(url);
    },
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useStudentCompetencies(studentId: string | undefined) {
  return useQuery({
    queryKey: ["student", "competencies", studentId],
    queryFn: () => fetchWithAuth('/api/student/progress/competencies'),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useStudentTimeline(studentId: string | undefined) {
  return useQuery({
    queryKey: ["student", "timeline", studentId],
    queryFn: () => fetchWithAuth('/api/student/progress/timeline'),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}