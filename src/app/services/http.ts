export interface ApiErrorPayload {
  message?: string;
}

function buildApiPath(path: string) {
  if (path.startsWith("/api")) {
    return path;
  }

  return path.startsWith("/") ? `/api${path}` : `/api/${path}`;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(buildApiPath(path), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as ApiErrorPayload;
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}
