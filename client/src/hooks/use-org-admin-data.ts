import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ============================================
// HELPER FUNCTIONS
// ============================================

async function fetchWithAuth(url: string) {
  const authToken = localStorage.getItem('auth-token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['X-Auth-Token'] = authToken;
  }

  const response = await fetch(url, {
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `Failed to fetch ${url}`);
  }

  return response.json();
}

async function postWithAuth(url: string, data: any) {
  const authToken = localStorage.getItem('auth-token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['X-Auth-Token'] = authToken;
  }

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `Failed to POST ${url}`);
  }

  return response.json();
}

async function patchWithAuth(url: string, data: any) {
  const authToken = localStorage.getItem('auth-token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['X-Auth-Token'] = authToken;
  }

  const response = await fetch(url, {
    method: 'PATCH',
    credentials: 'include',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `Failed to PATCH ${url}`);
  }

  return response.json();
}

async function deleteWithAuth(url: string) {
  const authToken = localStorage.getItem('auth-token');

  const headers: Record<string, string> = {};

  if (authToken) {
    headers['X-Auth-Token'] = authToken;
  }

  const response = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `Failed to DELETE ${url}`);
  }

  return response.json();
}

// ============================================
// ANALYTICS & DASHBOARD QUERIES
// ============================================

export function useOrganizationAnalytics(params?: { startDate?: string; endDate?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.set('startDate', params.startDate);
  if (params?.endDate) queryParams.set('endDate', params.endDate);

  const url = `/api/org-admin/analytics/overview${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  return useQuery({
    queryKey: ["org-admin", "analytics", params],
    queryFn: () => fetchWithAuth(url),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useActivityLogs(params?: {
  userId?: string;
  activityType?: string;
  startDate?: string;
  endDate?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.userId) queryParams.set('userId', params.userId);
  if (params?.activityType) queryParams.set('activityType', params.activityType);
  if (params?.startDate) queryParams.set('startDate', params.startDate);
  if (params?.endDate) queryParams.set('endDate', params.endDate);

  const url = `/api/org-admin/analytics/activity${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  return useQuery({
    queryKey: ["org-admin", "activity-logs", params],
    queryFn: () => fetchWithAuth(url),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

export function useUsageStatistics(params?: {
  periodType?: string;
  startDate?: string;
  endDate?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.periodType) queryParams.set('periodType', params.periodType);
  if (params?.startDate) queryParams.set('startDate', params.startDate);
  if (params?.endDate) queryParams.set('endDate', params.endDate);

  const url = `/api/org-admin/analytics/usage${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  return useQuery({
    queryKey: ["org-admin", "usage-stats", params],
    queryFn: () => fetchWithAuth(url),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

// ============================================
// USER MANAGEMENT QUERIES & MUTATIONS
// ============================================

export function useOrganizationUsers(params?: {
  role?: string;
  status?: string;
  search?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.role) queryParams.set('role', params.role);
  if (params?.status) queryParams.set('status', params.status);
  if (params?.search) queryParams.set('search', params.search);

  const url = `/api/org-admin/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  return useQuery({
    queryKey: ["org-admin", "users", params],
    queryFn: () => fetchWithAuth(url),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      patchWithAuth(`/api/org-admin/users/${userId}/suspend`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["org-admin", "analytics"] });
      queryClient.invalidateQueries({ queryKey: ["org-admin", "activity-logs"] });
    },
  });
}

export function useTerminateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      patchWithAuth(`/api/org-admin/users/${userId}/terminate`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["org-admin", "analytics"] });
      queryClient.invalidateQueries({ queryKey: ["org-admin", "activity-logs"] });
    },
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      patchWithAuth(`/api/org-admin/users/${userId}/reactivate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["org-admin", "analytics"] });
      queryClient.invalidateQueries({ queryKey: ["org-admin", "activity-logs"] });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      patchWithAuth(`/api/org-admin/users/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["org-admin", "analytics"] });
    },
  });
}

// ============================================
// DOCUMENT MANAGEMENT QUERIES & MUTATIONS
// ============================================

export function useOrganizationDocuments(params?: {
  category?: string;
  search?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.set('category', params.category);
  if (params?.search) queryParams.set('search', params.search);

  const url = `/api/org-admin/documents${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  return useQuery({
    queryKey: ["org-admin", "documents", params],
    queryFn: () => fetchWithAuth(url),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const authToken = localStorage.getItem('auth-token');
      const headers: Record<string, string> = {};

      if (authToken) {
        headers['X-Auth-Token'] = authToken;
      }

      const response = await fetch('/api/org-admin/documents', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Failed to upload document');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-admin", "documents"] });
      queryClient.invalidateQueries({ queryKey: ["org-admin", "activity-logs"] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId }: { documentId: string }) =>
      deleteWithAuth(`/api/org-admin/documents/${documentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-admin", "documents"] });
      queryClient.invalidateQueries({ queryKey: ["org-admin", "activity-logs"] });
    },
  });
}

// ============================================
// SCENARIO MANAGEMENT QUERIES & MUTATIONS
// ============================================

export function useOrganizationScenarios(params?: {
  module?: string;
  search?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.module) queryParams.set('module', params.module);
  if (params?.search) queryParams.set('search', params.search);

  const url = `/api/org-admin/scenarios${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  return useQuery({
    queryKey: ["org-admin", "scenarios", params],
    queryFn: () => fetchWithAuth(url),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

export function useCreateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      postWithAuth('/api/org-admin/scenarios', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-admin", "scenarios"] });
      queryClient.invalidateQueries({ queryKey: ["org-admin", "activity-logs"] });
    },
  });
}

export function useUpdateScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scenarioId, data }: { scenarioId: string; data: any }) =>
      patchWithAuth(`/api/org-admin/scenarios/${scenarioId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-admin", "scenarios"] });
    },
  });
}

export function useDeleteScenario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scenarioId }: { scenarioId: string }) =>
      deleteWithAuth(`/api/org-admin/scenarios/${scenarioId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-admin", "scenarios"] });
      queryClient.invalidateQueries({ queryKey: ["org-admin", "activity-logs"] });
    },
  });
}

// ============================================
// KNOWLEDGE BASE QUERIES & MUTATIONS
// ============================================

export function useKnowledgeSources() {
  return useQuery({
    queryKey: ["org-admin", "knowledge-sources"],
    queryFn: () => fetchWithAuth('/api/org-admin/knowledge/sources'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useTriggerKnowledgeSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params?: { sources?: string[] }) =>
      postWithAuth('/api/org-admin/knowledge/sync', params || {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-admin", "knowledge-sources"] });
      queryClient.invalidateQueries({ queryKey: ["org-admin", "activity-logs"] });
    },
  });
}
