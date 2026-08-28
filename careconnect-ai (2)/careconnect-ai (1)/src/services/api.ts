const TOKEN_KEY = "careconnect_token";

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  getToken,
  setToken,
  clearToken,

  health: () => request<any>("/api/health"),

  login: (email: string, password?: string) =>
    request<{ token: string; user: any; demoMode: boolean }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, fullName: string, password?: string) =>
    request<{ token: string; user: any; demoMode: boolean }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, fullName, password }),
    }),

  firebaseAuth: (idToken: string) =>
    request<{ token: string; user: any }>("/api/auth/firebase", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }),

  getProfile: () => request<any>("/api/auth/profile"),
  updateProfile: (profile: any) =>
    request<any>("/api/auth/profile", { method: "PUT", body: JSON.stringify(profile) }),

  getProviders: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ providers: any[] }>(`/api/providers${qs}`);
  },

  getProvider: (id: string) => request<any>(`/api/providers/${id}`),

  getNearbyProviders: (params: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ providers: any[] }>(`/api/providers/nearby?${qs}`);
  },

  getNearbyHospitals: (params: Record<string, string>) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ hospitals: any[] }>(`/api/maps/nearby-hospitals?${qs}`);
  },

  getAppointments: () => request<any[]>("/api/appointments"),
  createAppointment: (data: any) =>
    request<any>("/api/appointments", { method: "POST", body: JSON.stringify(data) }),
  updateAppointment: (id: string, data: any) =>
    request<any>(`/api/appointments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  cancelAppointment: (id: string) =>
    request<any>(`/api/appointments/${id}`, { method: "DELETE" }),

  getSymptoms: () => request<any[]>("/api/symptoms"),
  createSymptom: (data: any) =>
    request<any>("/api/symptoms", { method: "POST", body: JSON.stringify(data) }),
  deleteSymptom: (id: string) =>
    request<any>(`/api/symptoms/${id}`, { method: "DELETE" }),

  getCycle: () => request<any>("/api/womens-health/cycles"),
  updateCycle: (data: any) =>
    request<any>("/api/womens-health/cycles", { method: "POST", body: JSON.stringify(data) }),

  getChatSessions: () => request<any[]>("/api/womens-health/chat-sessions"),
  saveChatSession: (session: any) =>
    request<any>("/api/womens-health/chat-sessions", { method: "POST", body: JSON.stringify(session) }),
  deleteChatSession: (sessionId: string) =>
    request<any>(`/api/womens-health/chat-sessions/${sessionId}`, { method: "DELETE" }),

  chat: (messages: any[], userProfile?: any) =>
    request<any>("/api/chat", { method: "POST", body: JSON.stringify({ messages, userProfile }) }),

  analyzeSymptoms: (data: any) =>
    request<any>("/api/analyze-symptoms", { method: "POST", body: JSON.stringify(data) }),
  translateGuidance: (text: string, language: string) =>
    request<{ text: string }>("/api/ai/translate-guidance", { method: "POST", body: JSON.stringify({ text, language }) }),

  analyzeQuery: (query: string) =>
    request<any>("/api/ai/analyze", { method: "POST", body: JSON.stringify({ query }) }),
};
