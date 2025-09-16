import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error(`❌ API Error ${res.status}: ${res.url} - ${text}`);
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get auth token from localStorage for Replit compatibility
  const authToken = localStorage.getItem('auth-token');
  
  const headers: Record<string, string> = {};
  if (data) {
    headers['Content-Type'] = 'application/json';
  }
  if (authToken) {
    headers['X-Auth-Token'] = authToken;
    console.log(`🔥 API REQUEST: Adding auth token to ${method} ${url}`);
  } else {
    console.warn(`⚠️ API REQUEST: No auth token found for ${method} ${url}`);
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Handle complex queryKey arrays by filtering out non-string values
    const url = queryKey.filter(key => typeof key === 'string').join("/");
    
    // Get auth token from localStorage for Replit compatibility
    const authToken = localStorage.getItem('auth-token');
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['X-Auth-Token'] = authToken;
      console.log(`🔥 QUERY REQUEST: Adding auth token to GET ${url}`);
    } else {
      console.warn(`⚠️ QUERY REQUEST: No auth token found for GET ${url}`);
    }
    
    const res = await fetch(url, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
